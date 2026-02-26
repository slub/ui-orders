import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';

import { FieldSelectFinal as FieldSelect } from '@folio/stripes-acq-components';

import {
  INTEGRATION_TYPE,
  PO_FORM_FIELDS,
} from '../constants';

const INTEGRATION_TYPE_OPTIONS = Object.keys(INTEGRATION_TYPE).map((key) => ({
  labelId: `ui-orders.integration_type.${key}`,
  value: INTEGRATION_TYPE[key],
}));

const FieldIntegrationName = ({
  disabled = false,
  isNonInteractive = false,
  ...props
}) => {
  return (
    <FieldSelect
      dataOptions={INTEGRATION_TYPE_OPTIONS}
      disabled={disabled}
      isNonInteractive={isNonInteractive}
      label={<FormattedMessage id="ui-orders.orderDetails.integrationName" />}
      name={PO_FORM_FIELDS.integrationName}
      validateFields={[]}
      {...props}
    />
  );
};

FieldIntegrationName.propTypes = {
  disabled: PropTypes.bool,
  isNonInteractive: PropTypes.bool,
};

export default FieldIntegrationName;
