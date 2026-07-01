import PropTypes from 'prop-types';
import {
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  FormattedDate,
  FormattedMessage,
  useIntl,
} from 'react-intl';

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
import { useIntegrationConfigs } from '@folio/stripes-acq-components';

import { getApplicableIntegrations } from '../../Utils/toggleAutomaticExport';

const VISIBLE_COLUMNS = ['selected', 'poLineNumber', 'title', 'status', 'integration'];

const MAX_TITLE_LENGTH = 20;

// Weekday order for rendering the schedule rule (matches the WEEKDAYS constant
// in ui-organizations; kept local to avoid a cross-module import).
const WEEKDAYS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];

const getOrderingConfig = (config) => config?.exportTypeSpecificParameters?.vendorEdiOrdersExportConfig;

const getSchedule = (config) => getOrderingConfig(config)?.ediSchedule;

const formatConfigLabel = (config) => {
  const orderingConfig = getOrderingConfig(config);
  const name = orderingConfig?.configName;
  const method = orderingConfig?.transmissionMethod;

  return method ? `${name} (${method})` : name;
};

// Human-readable summary of an integration's scheduling rule (NOT the computed
// next run time, just the rule), e.g. "daily at 08:00" or "weekly Mon, Wed at
// 06:00". The time is the stored schedule time (HH:MM); we deliberately skip the
// tenant-timezone conversion the SchedulingView does, since this is an
// informational hint, and we omit scheduleFrequency to keep the phrase readable.
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

const truncate = (value) => (
  value && value.length > MAX_TITLE_LENGTH ? `${value.slice(0, MAX_TITLE_LENGTH)}…` : value
);

// Client-side classification of a PO line for the manual export modal. Reuses
// the same matching simulation as the read-only AutomaticExportInfo hint
// (getApplicableIntegrations), but evaluates every line regardless of the
// automaticExport flag: the user explicitly wants to trigger scheduled AND
// purely manual lines from here.
const buildRow = (line, integrationConfigs, isManualOrder) => {
  const applicable = getApplicableIntegrations({
    vendorAccount: line.vendorDetail?.vendorAccount,
    acquisitionMethod: line.acquisitionMethod,
    integrationConfigs,
  });

  // A line is "scheduled" when it is flagged for automatic export AND its single
  // matching integration runs on a scheduler -> it would be sent automatically
  // anyway, so we must not pre-select it (avoid a double send) and instead show
  // when it is due. Only evaluated for the unambiguous single-match case; an
  // ambiguous line keeps the "several matching integrations" handling.
  // Manual orders are excluded: the backend never auto-exports them
  // (`NOT purchaseOrder.manualPo`), so "Scheduled automatically" would be wrong
  // - they are a "ready" line here (manual export is exactly how they get sent),
  // matching the manualPo guard in AutomaticExportInfo (UIOR-1556).
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
    // Single unambiguous match pre-fills the integration (and enables the
    // checkbox). Pre-checked only when not already sent AND not already
    // scheduled for automatic export: a scheduled line would otherwise be sent
    // twice, so the user opts in explicitly. Ambiguous lines start unchecked
    // (and disabled) until the user picks an integration; no-match lines too.
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
}) => {
  const intl = useIntl();

  // NB: the hook exposes `isFetching` (not `isLoading`). Using the wrong key
  // would make the init guard below truthy on the first render and initialise
  // the selection before the configs have loaded -> single-match lines wrongly
  // start without an integration (checkbox greyed) once the configs arrive.
  const {
    integrationConfigs,
    isFetching,
  } = useIntegrationConfigs({ organizationId: order.vendor });

  const rows = useMemo(
    () => poLines.map((line) => buildRow(line, integrationConfigs, order.manualPo)),
    [poLines, integrationConfigs, order.manualPo],
  );

  // Selection is initialised once the integration configs have finished loading,
  // so the defaults reflect the real per-line matches.
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

  const columnMapping = useMemo(() => ({
    selected: <FormattedMessage id="ui-orders.manualExport.column.selected" />,
    poLineNumber: <FormattedMessage id="ui-orders.manualExport.column.poLine" />,
    title: <FormattedMessage id="ui-orders.manualExport.column.title" />,
    status: <FormattedMessage id="ui-orders.manualExport.column.status" />,
    integration: <FormattedMessage id="ui-orders.export.method" />,
  }), []);

  const formatter = {
    selected: ({ line, isSent }) => {
      // Selectable only once a concrete integration is set: a single match is
      // pre-filled, an ambiguous line requires the user to pick one, a no-match
      // line never has one. Keeps the checkbox in sync with the Select.
      // Already-sent lines are not selectable here: re-sending is Reexport's job
      // (it resets lastEDIExportDate so the line is picked up again); the export
      // job only processes lines without a date.
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

  const footer = (
    <ModalFooter>
      <Button
        data-testid="manual-export-send-button"
        buttonStyle="primary"
        marginBottom0
        disabled
      >
        <FormattedMessage id="ui-orders.manualExport.export" />
      </Button>
      <Button
        data-testid="manual-export-cancel-button"
        marginBottom0
        onClick={onClose}
      >
        <FormattedMessage id="ui-orders.buttons.line.cancel" />
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
};
