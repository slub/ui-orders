import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';

import { getExportConfigLabel } from '../utils';
import css from './AutomaticExportIntegrationName.css';

const AutomaticExportIntegrationName = ({ configs }) => {
  if (configs?.length !== 1) return null;

  const label = getExportConfigLabel(configs[0]);

  return (
    <div className={css.integrationName} title={label}>
      <FormattedMessage
        id="ui-orders.poLine.automaticExport.exportVia"
        values={{ name: label }}
      />
    </div>
  );
};

AutomaticExportIntegrationName.propTypes = {
  configs: PropTypes.arrayOf(PropTypes.object),
};

export default AutomaticExportIntegrationName;
