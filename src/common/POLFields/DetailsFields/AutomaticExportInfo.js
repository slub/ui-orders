import PropTypes from 'prop-types';
import { FormattedMessage, useIntl } from 'react-intl';

import {
  IconButton,
  InfoPopover,
} from '@folio/stripes/components';

import { getApplicableOrderingIntegrations } from '../../../components/Utils/toggleAutomaticExport';
import css from './AutomaticExportInfo.css';

const getOrderingConfig = (config) => config?.exportTypeSpecificParameters?.vendorEdiOrdersExportConfig;

const formatConfigLabel = (config) => {
  const orderingConfig = getOrderingConfig(config);
  const name = orderingConfig?.configName;
  const method = orderingConfig?.transmissionMethod;

  return method ? `${name} (${method})` : name;
};

// Read-only hint for the "Automatic export" checkbox showing which
// integration(s) would pick up this PO line. Reuses getApplicableOrderingIntegrations
// so the hint stays consistent with the checkbox value. Only shown while
// automatic export is enabled: with the checkbox off the order is handled
// manually (e.g. placed by phone), so there is nothing to surface.
//
// placement="label" renders the compact icon states (no/multiple integrations)
// meant to sit next to the checkbox label; placement="below" renders the
// single-integration name as a line beneath the checkbox. Only one of them is
// ever non-null for a given state.
const AutomaticExportInfo = ({
  acquisitionMethod,
  automaticExport = false,
  integrationConfigs = [],
  manualOrder = false,
  placement = 'below',
  vendorAccount,
}) => {
  const intl = useIntl();

  // A manual order is excluded from any automated transmission (the disabled
  // checkbox already carries an explanatory popover), so do not surface an
  // export hint. Likewise nothing to surface while the checkbox is off.
  if (manualOrder || !automaticExport) return null;

  const applicableIntegrations = getApplicableOrderingIntegrations({
    vendorAccount,
    acquisitionMethod,
    integrationConfigs,
  });

  // No matching integration while automatic export is on: warning icon next to
  // the label (the order will not be exported automatically).
  if (applicableIntegrations.length === 0) {
    if (placement !== 'label') return null;

    return (
      <InfoPopover
        content={<FormattedMessage id="ui-orders.poLine.automaticExport.noIntegration" />}
        renderTrigger={({ open, ref, toggle }) => (
          <IconButton
            ref={ref}
            icon="exclamation-circle"
            className={css.warningButton}
            onClick={toggle}
            aria-label={intl.formatMessage({ id: 'ui-orders.poLine.automaticExport.noIntegration' })}
            aria-haspopup="true"
            aria-expanded={open}
          />
        )}
      />
    );
  }

  // Several matches: keep the row compact - info icon next to the label, list
  // in the popover.
  if (applicableIntegrations.length > 1) {
    if (placement !== 'label') return null;

    return (
      <InfoPopover
        content={(
          <>
            <strong>
              <FormattedMessage id="ui-orders.poLine.automaticExport.multipleTitle" />
            </strong>
            <ul className={css.list}>
              {applicableIntegrations.map((config) => (
                <li key={config.id}>{formatConfigLabel(config)}</li>
              ))}
            </ul>
            <FormattedMessage id="ui-orders.poLine.automaticExport.multipleHint" />
          </>
        )}
      />
    );
  }

  // Single match: show the integration name inline beneath the checkbox. The CSS
  // ellipsis keeps it on one line, the title carries the full name.
  if (placement !== 'below') return null;

  const fullLabel = formatConfigLabel(applicableIntegrations[0]);

  return (
    <div className={css.exportVia} title={fullLabel}>
      <FormattedMessage
        id="ui-orders.poLine.automaticExport.sentVia"
        values={{ name: fullLabel }}
      />
    </div>
  );
};

AutomaticExportInfo.propTypes = {
  acquisitionMethod: PropTypes.string,
  automaticExport: PropTypes.bool,
  integrationConfigs: PropTypes.arrayOf(PropTypes.object),
  manualOrder: PropTypes.bool,
  placement: PropTypes.oneOf(['label', 'below']),
  vendorAccount: PropTypes.string,
};

export default AutomaticExportInfo;
