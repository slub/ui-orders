import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';

import {
  FieldSelectFinal as FieldSelect,
  fieldSelectOptionsShape,
} from '@folio/stripes-acq-components';

import { PO_FORM_FIELDS } from '../constants';

const FieldSuffix = ({
  isNonInteractive = false,
  suffixes,
  shouldValidate,
  ...rest
}) => {
  return (
    <FieldSelect
      dataOptions={suffixes}
      isNonInteractive={isNonInteractive}
      label={<FormattedMessage id="ui-orders.orderDetails.orderNumberSuffix" />}
      name={PO_FORM_FIELDS.poNumberSuffix}
      validateFields={shouldValidate ? [PO_FORM_FIELDS.poNumber] : []}
      {...rest}
    />
  );
};

FieldSuffix.propTypes = {
  isNonInteractive: PropTypes.bool,
  suffixes: fieldSelectOptionsShape.isRequired,
};

export default FieldSuffix;
