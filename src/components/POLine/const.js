import {
  INVENTORY_RECORDS_TYPE,
  ORDER_FORMATS,
} from '@folio/stripes-acq-components';

import { POL_FORM_FIELDS } from '../../common/constants';

export const ERESOURCES = [ORDER_FORMATS.electronicResource, ORDER_FORMATS.PEMix];
export const PHRESOURCES = [ORDER_FORMATS.physicalResource, ORDER_FORMATS.PEMix];

export const ACCORDION_ID = {
  costDetails: 'costDetails',
  eresources: 'eresources',
  fundDistribution: 'fundDistributionAccordion',
  paymentTerms: 'paymentTerms',
  itemDetails: 'itemDetails',
  lineDetails: 'lineDetails',
  location: 'location',
  other: 'other',
  notes: 'notes',
  exportDetails: 'exportDetails',
  physical: 'physical',
  poLine: 'poLine',
  relatedAgreementLines: 'relatedAgreementLines',
  relatedInvoiceLines: 'relatedInvoiceLines',
  relatedInvoices: 'relatedInvoices',
  vendor: 'vendor',
  linkedInstances: 'linkedInstances',
  ongoingOrder: 'ongoingOrder',
  donorsInformation: 'donorsInformation',
};

// Mapping between attribute (field) in form and id of accordion
export const MAP_FIELD_ACCORDION = {
  cost: ACCORDION_ID.costDetails,
  details: ACCORDION_ID.itemDetails,
  eresource: ACCORDION_ID.eresources,
  fundDistribution: ACCORDION_ID.fundDistribution,
  'fundDistribution-error': ACCORDION_ID.fundDistribution,
  locations: ACCORDION_ID.location,
  orderFormat: ACCORDION_ID.lineDetails,
  other: ACCORDION_ID.other,
  paymentTerms: ACCORDION_ID.paymentTerms,
  'paymentTerms.fiscalYearDistributions-error': ACCORDION_ID.paymentTerms,
  physical: ACCORDION_ID.physical,
  poLineNumber: ACCORDION_ID.lineDetails,
  publicationDate: ACCORDION_ID.itemDetails,
  titleOrPackage: ACCORDION_ID.itemDetails,
  vendorDetail: ACCORDION_ID.vendor,
};

export const DISCOUNT_TYPE = {
  amount: 'amount',
  percentage: 'percentage',
};

export const INVENTORY_RECORDS_TYPE_FOR_SELECT = [
  {
    labelId: 'ui-orders.settings.createInventory.recordType.all',
    value: INVENTORY_RECORDS_TYPE.all,
  },
  {
    labelId: 'ui-orders.settings.createInventory.recordType.instance',
    value: INVENTORY_RECORDS_TYPE.instance,
  },
  {
    labelId: 'ui-orders.settings.createInventory.recordType.instanceAndHolding',
    value: INVENTORY_RECORDS_TYPE.instanceAndHolding,
  },
  {
    labelId: 'ui-orders.settings.createInventory.recordType.none',
    value: INVENTORY_RECORDS_TYPE.none,
  },
];

export const OPTION_VALUE_WITH_BINDERY_ACTIVE = INVENTORY_RECORDS_TYPE.all;

export const POL_TEMPLATE_FIELDS_MAP = {
  'polTags.tagList': 'tags.tagList',
};

export const POL_TEMPLATE_FIELDS_LIST = Array.from(
  new Set([
    ...Object.values(POL_FORM_FIELDS)
      .filter((field) => !(field in POL_TEMPLATE_FIELDS_MAP)) // exclude POL form mapped fields
      .map((field) => field.split('.')[0]), // take only top-level fields
    ...Object.keys(POL_TEMPLATE_FIELDS_MAP), // include POL template mapped fields
  ]),
);

const INITIALLY_CLOSED_ACCORDION_IDS = {
  [ACCORDION_ID.donorsInformation]: true,
};

export const INITIAL_SECTIONS = Object.values(ACCORDION_ID).reduce(
  (accum, id) => ({ ...accum, [id]: !INITIALLY_CLOSED_ACCORDION_IDS[id] }), {},
);

export const ACCOUNT_STATUS = {
  ACTIVE: 'Active',
  INACTIVE: 'Inactive',
  PENDING: 'Pending',
};

export const SUBMIT_ACTION = {
  saveAndClose: 'saveAndClose',
  saveAndCreateAnother: 'saveAndCreateAnother',
  saveAndKeepEditing: 'saveAndKeepEditing',
  saveAndOpen: 'saveAndOpen',
};
