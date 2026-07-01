import PropTypes from 'prop-types';
import { Field } from 'react-final-form';
import { FormattedMessage } from 'react-intl';

import {
  Checkbox,
  InfoPopover,
} from '@folio/stripes/components';

import { POL_FORM_FIELDS } from '../../constants';

const FieldAutomaticExport = ({ isManualOrder = false, exportInfo = null, ...props }) => {
  const label = (
    <>
      <FormattedMessage id="ui-orders.poLine.automaticExport" />
      {isManualOrder && <InfoPopover content={<FormattedMessage id="ui-orders.poLine.manualPO.info" />} />}
      {exportInfo}
    </>
  );

  return (
    <Field
      component={Checkbox}
      fullWidth
      label={label}
      name={POL_FORM_FIELDS.automaticExport}
      type="checkbox"
      vertical
      validateFields={[]}
      {...props}
    />
  );
};

FieldAutomaticExport.propTypes = {
  exportInfo: PropTypes.node,
  isManualOrder: PropTypes.bool,
};

export default FieldAutomaticExport;
