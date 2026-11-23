import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';

import { getExportConfigLabel } from '../utils';
import css from './AutomaticExportVia.css';

const AutomaticExportVia = ({ configs }) => {
  if (configs?.length !== 1) return null;

  const label = getExportConfigLabel(configs[0]);

  return (
    <div className={css.exportVia} title={label}>
      <FormattedMessage
        id="ui-orders.poLine.automaticExport.exportVia"
        values={{ name: label }}
      />
    </div>
  );
};

AutomaticExportVia.propTypes = {
  configs: PropTypes.arrayOf(PropTypes.object),
};

export default AutomaticExportVia;
