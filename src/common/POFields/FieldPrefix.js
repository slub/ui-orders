import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';

import {
  FieldSelectFinal as FieldSelect,
  fieldSelectOptionsShape,
} from '@folio/stripes-acq-components';

import { PO_FORM_FIELDS } from '../constants';

const FieldPrefix = ({
  isNonInteractive = false,
  prefixes,
  shouldValidate,
  ...rest
}) => {
  return (
    <FieldSelect
      dataOptions={prefixes}
      isNonInteractive={isNonInteractive}
      label={<FormattedMessage id="ui-orders.orderDetails.orderNumberPrefix" />}
      name={PO_FORM_FIELDS.poNumberPrefix}
      validateFields={shouldValidate ? [PO_FORM_FIELDS.poNumber] : []}
      {...rest}
    />
  );
};

FieldPrefix.propTypes = {
  isNonInteractive: PropTypes.bool,
  prefixes: fieldSelectOptionsShape.isRequired,
};

export default FieldPrefix;
