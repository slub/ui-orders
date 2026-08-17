import cloneDeep from 'lodash/cloneDeep';
import get from 'lodash/get';
import set from 'lodash/set';
import unset from 'lodash/unset';

import { sourceValues } from '@folio/stripes-acq-components';

import {
  DISCOUNT_TYPE,
  POL_TEMPLATE_FIELDS_LIST,
  POL_TEMPLATE_FIELDS_MAP,
} from './const';
import { createPOLDataFromInstance } from './Item/util';
import { POL_FORM_FIELDS } from '../../common/constants';

const DEFAULT_INITIAL_VALUES = {};

const INVENTORY_FIELDS_TO_CLEAR = [
  POL_FORM_FIELDS.isPackage,
  POL_FORM_FIELDS.publicationDate,
  POL_FORM_FIELDS.publisher,
  POL_FORM_FIELDS.edition,
  POL_FORM_FIELDS.contributors,
  POL_FORM_FIELDS.productIds,
];

export const buildInitialPOLineFormValues = ({
  acqMethods,
  createInventorySetting,
  customFields,
  enabled,
  identifierTypeOptions,
  instance,
  isCreateFromInstance,
  order,
  stripes,
  template,
  vendor,
}) => {
  if (!enabled) return DEFAULT_INITIAL_VALUES;

  const essentialInitialValues = {
    purchaseOrderId: order?.id,
    source: sourceValues.user,
  };

  const initialValues = template?.id
    ? buildInitialValuesBasedOnTemplate({
      acqMethods,
      customFields,
      essentialInitialValues,
      template,
    })
    : buildInitialValuesWithoutTemplate({
      createInventorySetting,
      essentialInitialValues,
      instance,
      stripes,
      vendor,
    });

  return isCreateFromInstance
    ? mergeInventoryData(initialValues, instance, identifierTypeOptions)
    : initialValues;
};

function buildInitialValuesWithoutTemplate({
  createInventorySetting,
  essentialInitialValues,
  instance,
  stripes,
  vendor,
}) {
  // Get the vendor's latest currency as default
  const vendorPreferredCurrency = vendor?.vendorCurrencies?.slice(-1)[0];

  const newObj = {
    ...essentialInitialValues,
    claimingActive: false,
    claimingInterval: vendor?.claimingInterval,
    cost: {
      currency: vendorPreferredCurrency || stripes.currency,
      discountType: DISCOUNT_TYPE.percentage,
    },
    vendorDetail: {
      instructions: '',
      vendorAccount: get(vendor, 'accounts[0].accountNo', ''),
    },
    details: {
      subscriptionInterval: vendor?.subscriptionInterval,
    },
    eresource: {
      createInventory: createInventorySetting?.eresource,
    },
    physical: {
      createInventory: createInventorySetting?.physical,
    },
    locations: [],
    isPackage: false,
    checkinItems: false,
    suppressInstanceFromDiscovery: instance?.discoverySuppress || false,
  };

  if (vendor?.id) {
    newObj.eresource.accessProvider = vendor.id;
    newObj.physical.materialSupplier = vendor.id;

    if (vendor?.discountPercent) {
      newObj.cost.discountType = DISCOUNT_TYPE.percentage;
      newObj.cost.discount = vendor.discountPercent;
    }
  }

  return newObj;
}

function buildInitialValuesBasedOnTemplate({
  acqMethods,
  customFields,
  essentialInitialValues,
  template,
}) {
  const fieldsToPopulate = Array.from(
    new Set([
      ...POL_TEMPLATE_FIELDS_LIST,
      ...(customFields || []).map(({ refId }) => `customFields.${refId}`),
    ]),
  );

  const initialValues = fieldsToPopulate.reduce((acc, field) => {
    const formFieldField = POL_TEMPLATE_FIELDS_MAP[field] || field;
    const templateFieldValue = get(template, field);

    if (templateFieldValue !== undefined) {
      set(acc, formFieldField, templateFieldValue);
    }

    return acc;
  }, { ...essentialInitialValues });

  // Don't carry a deprecated method over from a template — the required field forces a re-pick.
  const templateAcqMethodId = initialValues[POL_FORM_FIELDS.acquisitionMethod];
  const isTemplateAcqMethodDeprecated = acqMethods?.some(
    ({ id, deprecated }) => deprecated && id === templateAcqMethodId,
  );

  if (isTemplateAcqMethodDeprecated) {
    delete initialValues[POL_FORM_FIELDS.acquisitionMethod];
  }

  return initialValues;
}

function mergeInventoryData(initialValues, instance, identifierTypeOptions) {
  const values = cloneDeep(initialValues);

  /*
    These fields are protected from modification when PO Line is created from an instance.
    To ensure consistency, we clear them before merging data from the instance.
  */
  INVENTORY_FIELDS_TO_CLEAR.forEach(field => unset(values, field));

  const inventoryDataToMerge = {
    isPackage: false,
    ...createPOLDataFromInstance(instance, identifierTypeOptions),
  };

  return Object.entries(inventoryDataToMerge).reduce((acc, [key, value]) => {
    set(acc, key, value);

    return acc;
  }, values);
}
