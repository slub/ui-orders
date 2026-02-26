import PropTypes from 'prop-types';

import { FieldSelectionFinal as FieldSelection } from '@folio/stripes-acq-components';

import { PO_FORM_FIELDS } from '../constants';

const FieldOrderEmailTemplate = ({
  disabled = false,
  isNonInteractive = false,
  templates = [],
  ...props
}) => {
  const dataOptions = templates.map(({ id, name }) => ({
    label: name,
    value: id,
  }));

  return (
    <FieldSelection
      dataOptions={dataOptions}
      disabled={disabled}
      isNonInteractive={isNonInteractive}
      labelId="ui-orders.orderDetails.orderEmailTemplate"
      name={PO_FORM_FIELDS.orderEmailTemplateId}
      validateFields={[]}
      {...props}
    />
  );
};

FieldOrderEmailTemplate.propTypes = {
  disabled: PropTypes.bool,
  isNonInteractive: PropTypes.bool,
  templates: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string,
    name: PropTypes.string,
  })),
};

export default FieldOrderEmailTemplate;
