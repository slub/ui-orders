import invert from 'lodash/invert';
import { FormattedMessage } from 'react-intl';

import {
  INVENTORY_RECORDS_TYPE,
  ORDER_FORMATS,
  ORDER_TYPES,
  PAYMENT_STATUS,
  RECEIPT_STATUS,
} from '@folio/stripes-acq-components';

export const ORGANIZATION_STATUS_ACTIVE = 'Active';

export const PRODUCT_ID_TYPE = {
  asin: 'ASIN',
  coden: 'CODEN',
  doi: 'DOI',
  gpoItemNumber: 'GPO item number',
  isbn: 'ISBN',
  ismn: 'ISMN',
  issn: 'ISSN',
  lccn: 'LCCN',
  oclc: 'OCLC',
  publisherOrDistributorNumber: 'Publisher or distributor number',
  reportNumber: 'Report number',
  standardTechnicalReportNumber: 'Standard technical report number',
  upc: 'UPC',
  urn: 'URN',
};
export const QUALIFIER_SEPARATOR = ' ';

export const ORDER_TYPE = {
  oneTime: 'One-Time',
  ongoing: 'Ongoing',
};

export const ORDERS_DOMAIN = 'orders';

export const NOTE_TYPES = {
  poLine: 'poLine',
};

export const ENTITY_TYPE_ORDER = 'purchase_order';
export const ENTITY_TYPE_PO_LINE = 'po_line';

export const CONFIG_INSTANCE_STATUS = 'inventory-instanceStatusCode';
export const CONFIG_INSTANCE_TYPE = 'inventory-instanceTypeCode';
export const CENTRAL_ORDERING_DEFAULT_RECEIVING_SEARCH_SETTINGS_KEY = 'CENTRAL_ORDERING_DEFAULT_RECEIVING_SEARCH';

export const CLOSING_REASONS_SOURCE = {
  system: 'System',
  user: 'User',
};

export const RESULT_COUNT_INCREMENT = 30;

export const VALIDATION_ERRORS = {
  duplicateLines: 'duplicateLines',
  differentAccount: 'differentAccount',
};

export const CANCEL_ORDER_REASON = 'Cancelled';

export const REEXPORT_SOURCES = {
  order: 'order',
  orderLine: 'orderLine',
};

export const UNOPEN_ORDER_ABANDONED_HOLDINGS_TYPES = {
  synchronized: 'synchronized',
  independent: 'independent',
  defaultType: 'withoutPieces',
};

export const FIELD_ARRAY_ITEM_IDENTIFIER_KEY = '__key__';
export const OKAPI_TENANT_HEADER = 'X-Okapi-Tenant';

export const HIDDEN_ORDER_FIELDS_FOR_VERSION_HISTORY = ['nextPolNumber', 'searchLocationIds'];

export const CENTRAL_ORDERING_DEFAULT_RECEIVING_SEARCH = {
  activeAffiliationOnly: 'Active affiliation only',
  centralOnly: 'Central only',
  centralDefault: 'Central default',
  activeAffiliationDefault: 'Active affiliation default',
};

export const SUBMIT_ACTION_FIELD = '__submitAction__';

export const PO_LINE_CONFIG_NAME_PREFIX = 'po_lines';
export const PO_CONFIG_NAME_PREFIX = 'purchase_orders';

export const SCOPE_CUSTOM_FIELDS_MANAGE = 'ui-orders.custom-fields.manage';

const buildCommonTranslatedDictionary = (dictionary, baseTranslationKey) => {
  return Object.fromEntries(
    Object.entries(invert(dictionary))
      .map(([orderType, key]) => [orderType, <FormattedMessage key={key} id={`${baseTranslationKey}${key}`} />]),
  );
};

export const ORDER_TYPE_TRANSLATED_VALUES = buildCommonTranslatedDictionary(ORDER_TYPES, 'ui-orders.order_type.');
export const ORDER_FORMAT_TRANSLATED_VALUES = buildCommonTranslatedDictionary(ORDER_FORMATS, 'ui-orders.order_format.');
export const RECEIPT_STATUS_TRANSLATED_VALUES = buildCommonTranslatedDictionary(RECEIPT_STATUS, 'ui-orders.receipt_status.');
export const PAYMENT_STATUS_TRANSLATED_VALUES = buildCommonTranslatedDictionary(PAYMENT_STATUS, 'ui-orders.payment_status.');
export const CREATE_INVENTORY_TRANSLATED_VALUES = buildCommonTranslatedDictionary(INVENTORY_RECORDS_TYPE, 'ui-orders.settings.createInventory.recordType.');
