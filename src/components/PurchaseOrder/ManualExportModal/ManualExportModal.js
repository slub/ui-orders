import PropTypes from 'prop-types';
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  FormattedDate,
  FormattedMessage,
  useIntl,
} from 'react-intl';
import { Link } from 'react-router-dom';

import {
  Button,
  Checkbox,
  Icon,
  Loading,
  Modal,
  ModalFooter,
  MultiColumnList,
  Select,
} from '@folio/stripes/components';
import { useStripes } from '@folio/stripes/core';
import {
  useIntegrationConfigs,
  useShowCallout,
} from '@folio/stripes-acq-components';

import {
  EXPORT_JOB_STATUSES,
  useManualExport,
  useManualExportJobs,
} from '../../../common/hooks';
import { getApplicableOrderingIntegrations } from '../../Utils/toggleAutomaticExport';

const VISIBLE_COLUMNS = ['selected', 'poLineNumber', 'title', 'status', 'integration'];

const MAX_TITLE_LENGTH = 20;

// `errorDetails` is the raw root-cause message from the worker; the full text
// stays available as a tooltip.
const MAX_ERROR_LENGTH = 60;

// Kept local to avoid a cross-module import from ui-organizations.
const WEEKDAYS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];

const getOrderingConfig = (config) => config?.exportTypeSpecificParameters?.vendorEdiOrdersExportConfig;

// The backend runs one export configuration per request (MODEXPS-316).
const buildExportEntries = (selection) => Object.entries(selection ?? {})
  .filter(([, { selected, integrationConfigId }]) => selected && integrationConfigId)
  .reduce((acc, [lineId, { integrationConfigId }]) => {
    const entry = acc.find((item) => item.integrationConfigId === integrationConfigId);

    if (entry) entry.poLineIds.push(lineId);
    else acc.push({ integrationConfigId, poLineIds: [lineId] });

    return acc;
  }, []);

// Results arrive per integration; spread them onto the rows of that group.
const buildLineResults = (results) => results.reduce((acc, { poLineIds, ...result }) => {
  poLineIds.forEach((lineId) => { acc[lineId] = result; });

  return acc;
}, {});

const getSchedule = (config) => getOrderingConfig(config)?.ediSchedule;

const formatConfigLabel = (config) => {
  const orderingConfig = getOrderingConfig(config);
  const name = orderingConfig?.configName;
  const method = orderingConfig?.transmissionMethod;

  return method ? `${name} (${method})` : name;
};

// The schedule rule, not the computed next run: e.g. "daily at 08:00". Shows the
// stored time without the tenant-timezone conversion SchedulingView does, since
// this is only an informational hint.
const formatSchedule = (config, intl) => {
  const params = getSchedule(config)?.scheduleParameters;

  if (!params?.schedulePeriod) return '';

  const parts = [intl.formatMessage({ id: `ui-orders.manualExport.schedule.period.${params.schedulePeriod}` })];

  if (params.schedulePeriod === 'WEEK') {
    const days = WEEKDAYS
      .filter((day) => params.weekDays?.[day])
      .map((day) => intl.formatMessage({ id: `ui-orders.manualExport.schedule.weekday.${day}` }));

    if (days.length) parts.push(days.join(', '));
  }

  if (params.scheduleTime) {
    parts.push(intl.formatMessage(
      { id: 'ui-orders.manualExport.schedule.atTime' },
      { time: params.scheduleTime.slice(0, 5) },
    ));
  }

  return parts.join(' ');
};

const truncate = (value, maxLength = MAX_TITLE_LENGTH) => (
  value && value.length > maxLength ? `${value.slice(0, maxLength)}…` : value
);

// Same matching simulation as the AutomaticExportInfo hint, but for every line
// regardless of the automaticExport flag - that is the point of a manual export.
const buildRow = (line, integrationConfigs, isManualOrder) => {
  const applicable = getApplicableOrderingIntegrations({
    vendorAccount: line.vendorDetail?.vendorAccount,
    acquisitionMethod: line.acquisitionMethod,
    integrationConfigs,
  });

  // Would go out on its own, so it must not be pre-selected (double send).
  // Manual orders are excluded: the scheduler never picks them up
  // (`NOT purchaseOrder.manualPo`), so the hint would be a false statement.
  const isScheduled = Boolean(
    !isManualOrder
    && line.automaticExport
    && applicable.length === 1
    && getSchedule(applicable[0])?.enableScheduledExport,
  );

  return {
    line,
    applicable,
    isSent: Boolean(line.lastEDIExportDate),
    hasIntegration: applicable.length > 0,
    isAmbiguous: applicable.length > 1,
    isScheduled,
  };
};

const buildInitialSelection = (rows) => rows.reduce((acc, { line, applicable, isSent, isScheduled }) => {
  const hasSingleMatch = applicable.length === 1;

  acc[line.id] = {
    // Pre-checked only for an unambiguous match that is neither already sent nor
    // scheduled - both would need an explicit opt-in.
    selected: hasSingleMatch && !isSent && !isScheduled,
    integrationConfigId: hasSingleMatch ? applicable[0].id : '',
  };

  return acc;
}, {});

export const ManualExportModal = ({
  id,
  order,
  poLines,
  onClose,
  onExported,
}) => {
  const intl = useIntl();

  const stripes = useStripes();
  const showCallout = useShowCallout();

  // Following up on the jobs is optional: without the permission the modal stops
  // after the trigger request and points at the export manager instead.
  const canPollJobs = stripes.hasPerm('data-export.job.item.get');
  const canViewExportManager = stripes.hasPerm('ui-export-manager.export-manager.view');

  // NB: `isFetching`, not `isLoading` - the wrong key would initialise the
  // selection before the configs arrive, leaving matched lines unselectable.
  const {
    integrationConfigs,
    isFetching,
  } = useIntegrationConfigs({ organizationId: order.vendor });

  const {
    manualExport,
    isLoading: isExporting,
  } = useManualExport();

  const rows = useMemo(
    () => poLines.map((line) => buildRow(line, integrationConfigs, order.manualPo)),
    [poLines, integrationConfigs, order.manualPo],
  );

  // Initialised only once the configs are loaded, so the defaults reflect the
  // real per-line matches.
  const [selection, setSelection] = useState(null);

  useEffect(() => {
    if (!isFetching && selection === null) {
      setSelection(buildInitialSelection(rows));
    }
  }, [isFetching, rows, selection]);

  const toggleLine = (lineId) => {
    setSelection((prev) => ({
      ...prev,
      [lineId]: { ...prev[lineId], selected: !prev[lineId].selected },
    }));
  };

  const changeIntegration = (lineId, value) => {
    setSelection((prev) => ({
      ...prev,
      [lineId]: { integrationConfigId: value, selected: Boolean(value) },
    }));
  };

  // Outcome of the last submit per PO line id; `null` until submitted.
  const [lineResults, setLineResults] = useState(null);
  const [jobIds, setJobIds] = useState([]);

  const {
    jobs,
    isComplete,
    hasTimedOut,
  } = useManualExportJobs(jobIds);

  const exportEntries = useMemo(() => buildExportEntries(selection), [selection]);

  const selectedCount = useMemo(
    () => exportEntries.reduce((sum, { poLineIds }) => sum + poLineIds.length, 0),
    [exportEntries],
  );

  const closeAfterExport = useCallback(() => {
    onExported?.();
    onClose();
  }, [onExported, onClose]);

  const onExport = async () => {
    const results = await manualExport(exportEntries);
    const failed = results.filter(({ isSuccess }) => !isSuccess);

    setLineResults(buildLineResults(results));

    if (canPollJobs) {
      setJobIds(results.filter(({ jobId }) => jobId).map(({ jobId }) => jobId));
    }

    if (failed.length) {
      showCallout({
        messageId: 'ui-orders.manualExport.error',
        type: 'error',
        values: { count: failed.length },
      });

      return;
    }

    // Nothing to wait for without the job permission - report the hand-off.
    if (!canPollJobs) {
      showCallout({
        messageId: 'ui-orders.manualExport.started',
        values: { count: selectedCount },
      });
      closeAfterExport();
    }
  };

  // The trigger request only says the job was created. Close once every job
  // reported back successfully; on failure or timeout stay open so the user can
  // read what happened and follow the link into the export manager.
  useEffect(() => {
    const hasFailure = jobs.some(({ status }) => status === EXPORT_JOB_STATUSES.FAILED);

    if (!isComplete || hasFailure) return;

    showCallout({
      messageId: 'ui-orders.manualExport.success',
      values: { count: selectedCount },
    });
    closeAfterExport();
  }, [isComplete, jobs, selectedCount, showCallout, closeAfterExport]);

  // `lastEDIExportDate` is written by mod-orders-storage via its own Kafka event,
  // so the cached lines are stale after an export. Refetch on every exit path;
  // the event may lag by a moment, then the value shows up on the next open.
  const onDismiss = useCallback(() => {
    if (lineResults) onExported?.();
    onClose();
  }, [lineResults, onExported, onClose]);

  const jobsById = useMemo(
    () => jobs.reduce((acc, job) => ({ ...acc, [job.id]: job }), {}),
    [jobs],
  );

  const jobLink = (jobId) => canViewExportManager && (
    <div>
      <Link to={`/export-manager/jobs/${jobId}`}>
        <FormattedMessage id="ui-orders.manualExport.viewJob" />
      </Link>
    </div>
  );

  const columnMapping = useMemo(() => ({
    selected: <FormattedMessage id="ui-orders.manualExport.column.selected" />,
    poLineNumber: <FormattedMessage id="ui-orders.manualExport.column.poLine" />,
    title: <FormattedMessage id="ui-orders.manualExport.column.title" />,
    status: <FormattedMessage id="ui-orders.manualExport.column.status" />,
    integration: <FormattedMessage id="ui-orders.export.method" />,
  }), []);

  const formatter = {
    selected: ({ line, isSent }) => {
      // Selectable only once an integration is set, which keeps the checkbox in
      // sync with the Select. Already-sent lines stay disabled: the export job
      // filters on `lastEDIExportDate == null`, so they would be dropped silently.
      const hasChosenIntegration = Boolean(selection?.[line.id]?.integrationConfigId);

      return (
        <Checkbox
          checked={Boolean(selection?.[line.id]?.selected)}
          disabled={isSent || !hasChosenIntegration}
          onChange={() => toggleLine(line.id)}
          aria-label={intl.formatMessage(
            { id: 'ui-orders.manualExport.selectLine' },
            { poLineNumber: line.poLineNumber },
          )}
        />
      );
    },
    poLineNumber: ({ line }) => line.poLineNumber,
    title: ({ line }) => <span title={line.titleOrPackage}>{truncate(line.titleOrPackage)}</span>,
    status: ({ line, applicable, isSent, hasIntegration, isAmbiguous, isScheduled }) => {
      // After a submit the result replaces the status; unsent lines keep theirs.
      const result = lineResults?.[line.id];

      if (result) {
        // The request itself failed - no job was created.
        if (!result.isSuccess) {
          return (
            <Icon icon="exclamation-circle" size="small" status="error">
              <FormattedMessage id="ui-orders.manualExport.status.exportFailed" />
            </Icon>
          );
        }

        const job = jobsById[result.jobId];

        if (job?.status === EXPORT_JOB_STATUSES.FAILED) {
          return (
            <Icon icon="exclamation-circle" size="small" status="error">
              <FormattedMessage id="ui-orders.manualExport.status.exportFailed" />
              {job.errorDetails && <div title={job.errorDetails}>{truncate(job.errorDetails, MAX_ERROR_LENGTH)}</div>}
              {jobLink(result.jobId)}
            </Icon>
          );
        }

        if (job?.status === EXPORT_JOB_STATUSES.SUCCESSFUL) {
          return (
            <Icon icon="check-circle" size="small">
              <FormattedMessage id="ui-orders.manualExport.status.exportSucceeded" />
            </Icon>
          );
        }

        // Still queued or running. Kafka may take longer than we wait, so after
        // the timeout we stop claiming progress and point at the export manager.
        if (hasTimedOut) {
          return (
            <>
              <FormattedMessage id="ui-orders.manualExport.status.exportPending" />
              {jobLink(result.jobId)}
            </>
          );
        }

        return (
          <Icon icon="clock" size="small">
            <FormattedMessage id="ui-orders.manualExport.status.exportRunning" />
          </Icon>
        );
      }

      if (isSent) {
        return (
          <FormattedMessage
            id="ui-orders.manualExport.status.alreadySent"
            values={{ date: <FormattedDate value={line.lastEDIExportDate} /> }}
          />
        );
      }

      if (!hasIntegration) return <FormattedMessage id="ui-orders.manualExport.status.noIntegration" />;

      if (isAmbiguous) return <FormattedMessage id="ui-orders.manualExport.status.ambiguous" />;

      if (isScheduled) {
        return (
          <FormattedMessage
            id="ui-orders.manualExport.status.scheduled"
            values={{ schedule: formatSchedule(applicable[0], intl) }}
          />
        );
      }

      return <FormattedMessage id="ui-orders.manualExport.status.ready" />;
    },
    integration: ({ line, applicable, isSent, hasIntegration, isAmbiguous }) => {
      // Sent lines are read-only here -> show the matching integration(s) as
      // plain info text, no interactive control.
      if (isSent) return applicable.map(formatConfigLabel).join(', ');

      if (!hasIntegration) {
        return (
          <Icon icon="exclamation-circle" size="small">
            <FormattedMessage id="ui-orders.manualExport.status.noIntegration" />
          </Icon>
        );
      }

      if (isAmbiguous) {
        const options = [
          { value: '', label: intl.formatMessage({ id: 'ui-orders.manualExport.selectIntegration' }) },
          ...applicable.map((config) => ({ value: config.id, label: formatConfigLabel(config) })),
        ];

        return (
          <Select
            dataOptions={options}
            value={selection?.[line.id]?.integrationConfigId || ''}
            onChange={(e) => changeIntegration(line.id, e.target.value)}
            aria-label={intl.formatMessage({ id: 'ui-orders.manualExport.selectIntegration' })}
            marginBottom0
          />
        );
      }

      return formatConfigLabel(applicable[0]);
    },
  };

  // Once submitted the export must not be repeatable from the same modal: the
  // selection is unchanged, so a second click would send everything again.
  const isSubmitted = Boolean(lineResults);

  const footer = (
    <ModalFooter>
      <Button
        data-testid="manual-export-send-button"
        buttonStyle="primary"
        marginBottom0
        disabled={!exportEntries.length || isExporting || isSubmitted}
        onClick={onExport}
      >
        <FormattedMessage id="ui-orders.manualExport.export" />
      </Button>
      <Button
        data-testid="manual-export-cancel-button"
        marginBottom0
        onClick={onDismiss}
      >
        <FormattedMessage id={`ui-orders.buttons.line.${isSubmitted ? 'close' : 'cancel'}`} />
      </Button>
    </ModalFooter>
  );

  const modalLabel = intl.formatMessage(
    { id: 'ui-orders.manualExport.modal.title' },
    { orderNumber: order.poNumber },
  );

  return (
    <Modal
      aria-label={modalLabel}
      open
      id={id}
      label={modalLabel}
      footer={footer}
      dismissible
      onClose={onClose}
      size="large"
    >
      {(isFetching || selection === null)
        ? <Loading />
        : (
          <MultiColumnList
            id="manual-export-po-lines"
            contentData={rows}
            visibleColumns={VISIBLE_COLUMNS}
            columnMapping={columnMapping}
            formatter={formatter}
            interactive={false}
          />
        )}
    </Modal>
  );
};

ManualExportModal.propTypes = {
  id: PropTypes.string.isRequired,
  order: PropTypes.object.isRequired,
  poLines: PropTypes.arrayOf(PropTypes.object).isRequired,
  onClose: PropTypes.func.isRequired,
  onExported: PropTypes.func,
};
