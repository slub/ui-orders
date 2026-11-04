import get from 'lodash/get';
import PropTypes from 'prop-types';
import { useForm } from 'react-final-form';
import { FormattedMessage } from 'react-intl';

import {
  FieldSelectFinal,
  ORDER_FORMATS,
} from '@folio/stripes-acq-components';

import { OPTION_VALUE_WITH_BINDERY_ACTIVE } from '../../../components/POLine/const';
import { POL_FORM_FIELDS } from '../../constants';

const ORDER_FORMAT_OPTIONS = Object.keys(ORDER_FORMATS).map((key) => ({
  labelId: `ui-orders.order_format.${key}`,
  value: ORDER_FORMATS[key],
}));

const OPTIONS_WITH_BINDERY_ACTIVE = ORDER_FORMAT_OPTIONS.filter(({ value }) => {
  return value === ORDER_FORMATS.PEMix || value === ORDER_FORMATS.physicalResource;
});

/* Format handlers */
const handleEmpty = (change) => {
  change(POL_FORM_FIELDS.physical, undefined);
  change(POL_FORM_FIELDS.eresource, undefined);
};

const handleElectronic = (change, settings, formValues, vendor) => {
  change(POL_FORM_FIELDS.eresourceCreateInventory, settings.eresource);

  const activationDue = get(formValues, POL_FORM_FIELDS.eresourceActivationDue);

  if (activationDue === undefined && vendor?.expectedActivationInterval) {
    change(POL_FORM_FIELDS.eresourceActivationDue, vendor.expectedActivationInterval);
  }
};

const handlePhysical = (change, settings, formValues) => {
  // Bindery's required inventory takes precedence over tenant defaults in both physical formats.
  const createInventory = get(formValues, POL_FORM_FIELDS.isBinderyActive)
    ? OPTION_VALUE_WITH_BINDERY_ACTIVE
    : settings.physical;

  change(POL_FORM_FIELDS.physicalCreateInventory, createInventory);
};

const handleOther = (change, settings) => {
  change(POL_FORM_FIELDS.physicalCreateInventory, settings.other);
};

export const formatHandlers = {
  [ORDER_FORMATS.electronicResource]: (change, settings, formValues, vendor) => {
    change(POL_FORM_FIELDS.physical, undefined);
    handleElectronic(change, settings, formValues, vendor);
  },
  [ORDER_FORMATS.physicalResource]: (change, settings, formValues, _vendor) => {
    change(POL_FORM_FIELDS.eresource, undefined);
    handlePhysical(change, settings, formValues);
  },
  [ORDER_FORMATS.other]: (change, settings, _formValues, _vendor) => {
    change(POL_FORM_FIELDS.eresource, undefined);
    handleOther(change, settings);
  },
  [ORDER_FORMATS.PEMix]: (change, settings, formValues, vendor) => {
    handleElectronic(change, settings, formValues, vendor);
    handlePhysical(change, settings, formValues);
  },
};

function FieldOrderFormat({
  createInventorySetting,
  disabled,
  formValues,
  required = true,
  vendor,
}) {
  const { batch, change } = useForm();

  const onChangeSelect = (event) => {
    const value = event.target.value;

    batch(() => {
      change(POL_FORM_FIELDS.orderFormat, value || undefined);
      change(POL_FORM_FIELDS.costQuantityPhysical, undefined);
      change(POL_FORM_FIELDS.costQuantityElectronic, undefined);
      change(POL_FORM_FIELDS.costListUnitPriceElectronic, undefined);
      change(POL_FORM_FIELDS.costListUnitPrice, undefined);

      if (formValues.isPackage) {
        formValues?.locations?.forEach((_, i) => {
          change(`${POL_FORM_FIELDS.locations}[${i}].quantityPhysical`, undefined);
          change(`${POL_FORM_FIELDS.locations}[${i}].quantityElectronic`, undefined);
        });
      }

      (formatHandlers[value] || handleEmpty)(change, createInventorySetting, formValues, vendor);
    });
  };

  const isBinderyActive = get(formValues, POL_FORM_FIELDS.isBinderyActive, false);
  const dataOptions = isBinderyActive ? OPTIONS_WITH_BINDERY_ACTIVE : ORDER_FORMAT_OPTIONS;

  return (
    <FieldSelectFinal
      dataOptions={dataOptions}
      label={<FormattedMessage id="ui-orders.poLine.orderFormat" />}
      name={POL_FORM_FIELDS.orderFormat}
      onChange={onChangeSelect}
      required={required}
      isNonInteractive={disabled}
    />
  );
}

FieldOrderFormat.propTypes = {
  createInventorySetting: PropTypes.object.isRequired,
  disabled: PropTypes.bool,
  formValues: PropTypes.object.isRequired,
  required: PropTypes.bool,
  vendor: PropTypes.object,
};

export default FieldOrderFormat;
