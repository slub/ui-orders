import get from 'lodash/get';

import { dayjs } from '@folio/stripes/components';
import {
  DATE_FORMAT,
  ORDER_FORMATS,
} from '@folio/stripes-acq-components';

import {
  ERESOURCES,
  OPTION_VALUE_WITH_BINDERY_ACTIVE,
  PHRESOURCES,
} from '../../components/POLine/const';
import { isWorkflowStatusNotPending } from '../../components/PurchaseOrder/util';
import { POL_FORM_FIELDS } from '../constants';

export const isEresource = (format) => ERESOURCES.includes(format);

export const isPhresource = (format) => PHRESOURCES.includes(format);

export const isOtherResource = (format) => format === ORDER_FORMATS.other;

// Today plus a vendor interval in days; an interval of 0 means "not set".
export const getExpectedDateFromInterval = (days) => {
  return days > 0
    ? dayjs().add(days, 'day').format(DATE_FORMAT)
    : undefined;
};

export const getExportConfigLabel = (config) => {
  const { configName, transmissionMethod } = config.exportTypeSpecificParameters?.vendorEdiOrdersExportConfig || {};

  return transmissionMethod ? `${configName} (${transmissionMethod})` : configName;
};

export const isBinderyActiveDisabled = (values, order) => {
  const orderFormat = get(values, POL_FORM_FIELDS.orderFormat);
  const physicalCreateInventory = get(values, POL_FORM_FIELDS.physicalCreateInventory);

  if (!orderFormat) return false;

  /*
    Check if the order format is NOT 'Physical Resource' or 'Physical/Electronic Mix'
  */
  if (![ORDER_FORMATS.physicalResource, ORDER_FORMATS.PEMix].includes(orderFormat)) return true;

  /*
    Disable the field if the order is not in pending status (Opened, Closed) and
    the `physical.createInventory` field does not have the value 'Instance, Holding, Item'
  */
  return (
    order
    && isWorkflowStatusNotPending(order)
    && physicalCreateInventory !== OPTION_VALUE_WITH_BINDERY_ACTIVE
  );
};
