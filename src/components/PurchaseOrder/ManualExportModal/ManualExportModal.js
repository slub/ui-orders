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

const getOrderingConfig = (config) => config?.exportTypeSpecificParameters?.vendorEdiOrdersExportConfig;

const formatConfigLabel = (config) => {
  const orderingConfig = getOrderingConfig(config);
  const name = orderingConfig?.configName;
  const method = orderingConfig?.transmissionMethod;

  return method ? `${name} (${method})` : name;
};

const truncate = (value) => (
  value && value.length > MAX_TITLE_LENGTH ? `${value.slice(0, MAX_TITLE_LENGTH)}…` : value
);

// Client-side classification of a PO line for the manual export modal. Reuses
// the same matching simulation as the read-only AutomaticExportInfo hint
// (getApplicableIntegrations), but evaluates every line regardless of the
// automaticExport flag: the user explicitly wants to trigger scheduled AND
// purely manual lines from here.
const buildRow = (line, integrationConfigs) => {
  const applicable = getApplicableIntegrations({
    vendorAccount: line.vendorDetail?.vendorAccount,
    acquisitionMethod: line.acquisitionMethod,
    integrationConfigs,
  });

  return {
    line,
    applicable,
    isSent: Boolean(line.lastEDIExportDate),
    hasIntegration: applicable.length > 0,
    isAmbiguous: applicable.length > 1,
  };
};

const buildInitialSelection = (rows) => rows.reduce((acc, { line, applicable, isSent }) => {
  acc[line.id] = {
    // Default-on only when there is exactly one matching integration (pre-filled
    // below) and the line was not exported yet. Ambiguous lines start unchecked
    // (and disabled) until the user picks an integration; no-match and
    // already-sent lines start off too.
    selected: applicable.length === 1 && !isSent,
    integrationConfigId: applicable.length === 1 ? applicable[0].id : '',
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
    () => poLines.map((line) => buildRow(line, integrationConfigs)),
    [poLines, integrationConfigs],
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
    integration: <FormattedMessage id="ui-orders.manualExport.column.integration" />,
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
    status: ({ line, isSent, hasIntegration, isAmbiguous }) => {
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
