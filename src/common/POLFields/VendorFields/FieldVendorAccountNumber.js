import PropTypes from 'prop-types';
import { Field } from 'react-final-form';
import { FormattedMessage } from 'react-intl';

import {
  FieldSelectFinal,
  fieldSelectOptionsShape,
  TextField,
} from '@folio/stripes-acq-components';

import { POL_FORM_FIELDS } from '../../constants';

const defaultValues = {
  accounts: [],
};

const FieldVendorAccountNumber = ({
  accounts = defaultValues.accounts,
  disabled,
  ...props
}) => {
  return (
    accounts.length
      ? (
        <FieldSelectFinal
          dataOptions={accounts}
          fullWidth
          label={<FormattedMessage id="ui-orders.vendor.accountNumber" />}
          name={POL_FORM_FIELDS.vendorDetailVendorAccount}
          isNonInteractive={disabled}
          validateFields={[]}
          {...props}
        />
      )
      : (
        <Field
          component={TextField}
          fullWidth
          isNonInteractive={disabled}
          label={<FormattedMessage id="ui-orders.vendor.accountNumber" />}
          name={POL_FORM_FIELDS.vendorDetailVendorAccount}
          validateFields={[]}
        />
      )
  );
};

FieldVendorAccountNumber.propTypes = {
  accounts: fieldSelectOptionsShape,
  disabled: PropTypes.bool,
};

export default FieldVendorAccountNumber;
