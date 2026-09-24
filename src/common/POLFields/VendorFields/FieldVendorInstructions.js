import PropTypes from 'prop-types';
import { Field } from 'react-final-form';
import { FormattedMessage } from 'react-intl';

import { TextArea } from '@folio/stripes-acq-components';

import { POL_FORM_FIELDS } from '../../constants';

const styles = {
  height: '82px',
};

const FieldVendorInstructions = ({ disabled }) => {
  return (
    <Field
      component={TextArea}
      fullWidth
      label={<FormattedMessage id="ui-orders.vendor.instructions" />}
      name={POL_FORM_FIELDS.vendorDetailInstructions}
      style={styles}
      isNonInteractive={disabled}
      validateFields={[]}
    />
  );
};

FieldVendorInstructions.propTypes = {
  disabled: PropTypes.bool,
};

export default FieldVendorInstructions;
