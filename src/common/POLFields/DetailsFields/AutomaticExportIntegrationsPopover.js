import PropTypes from 'prop-types';
import { FormattedMessage, useIntl } from 'react-intl';

import {
  IconButton,
  InfoPopover,
} from '@folio/stripes/components';

import { getExportConfigLabel } from '../utils';
import css from './AutomaticExportIntegrationsPopover.css';

const AutomaticExportIntegrationsPopover = ({ configs }) => {
  const intl = useIntl();

  if (!configs) return null;

  if (configs.length === 0) {
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

  if (configs.length > 1) {
    return (
      <InfoPopover
        content={(
          <>
            <strong>
              <FormattedMessage id="ui-orders.poLine.automaticExport.multipleTitle" />
            </strong>
            <ul className={css.list}>
              {configs.map((config) => (
                <li key={config.id}>{getExportConfigLabel(config)}</li>
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

AutomaticExportIntegrationsPopover.propTypes = {
  configs: PropTypes.arrayOf(PropTypes.object),
};

export default AutomaticExportIntegrationsPopover;
