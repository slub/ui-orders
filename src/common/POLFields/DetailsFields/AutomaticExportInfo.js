import PropTypes from 'prop-types';
import { FormattedMessage, useIntl } from 'react-intl';

import {
  IconButton,
  InfoPopover,
} from '@folio/stripes/components';

import {
  formatConfigLabel,
  getApplicableOrderingIntegrations,
} from '../../../components/Utils/toggleAutomaticExport';
import css from './AutomaticExportInfo.css';

// Hint for the "Automatic export" checkbox. placement="label" renders an icon
// next to the label (warning: no match, info popover: several matches),
// placement="below" renders the single matching integration as a text line.
// Without integrationConfigs (order templates) there is nothing to match.
const AutomaticExportInfo = ({
  acquisitionMethod,
  automaticExport = false,
  integrationConfigs,
  isLoading = false,
  manualOrder = false,
  placement = 'below',
  vendorAccount,
}) => {
  const intl = useIntl();

  if (manualOrder || !automaticExport || isLoading || !integrationConfigs) return null;

  const applicableIntegrations = getApplicableOrderingIntegrations({
    vendorAccount,
    acquisitionMethod,
    integrationConfigs,
  });

  if (placement === 'below') {
    if (applicableIntegrations.length !== 1) return null;

    const label = formatConfigLabel(applicableIntegrations[0]);

    return (
      <div className={css.exportVia} title={label}>
        <FormattedMessage
          id="ui-orders.poLine.automaticExport.exportVia"
          values={{ name: label }}
        />
      </div>
    );
  }

  if (applicableIntegrations.length === 0) {
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
            aria-haspopup="dialog"
            aria-expanded={open}
          />
        )}
      />
    );
  }

  if (applicableIntegrations.length > 1) {
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

  return null;
};

AutomaticExportInfo.propTypes = {
  acquisitionMethod: PropTypes.string,
  automaticExport: PropTypes.bool,
  integrationConfigs: PropTypes.arrayOf(PropTypes.object),
  isLoading: PropTypes.bool,
  manualOrder: PropTypes.bool,
  placement: PropTypes.oneOf(['label', 'below']),
  vendorAccount: PropTypes.string,
};

export default AutomaticExportInfo;
