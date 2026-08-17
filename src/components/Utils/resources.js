import {
  ACQUISITIONS_UNITS_API,
  baseManifest,
  CONTRIBUTOR_NAME_TYPES_API,
  fundsManifest,
  IDENTIFIER_TYPES_API,
  LIMIT_MAX,
  LOCATIONS_API,
  MATERIAL_TYPE_API,
  ORDERS_STORAGE_SETTINGS_API,
  USERS_API,
  VENDORS_API,
} from '@folio/stripes-acq-components';

import {
  INVOICE_LINES_API,
  INVOICES_API,
  ISBN_VALIDATOR,
  LINE_DETAIL_API,
  LINES_API,
  ORDERS_API,
  ORDER_DETAIL_API,
  ORDER_INVOICE_RELNS_API,
  ORDER_TEMPLATE_DETAIL_API,
  ORDER_TEMPLATES_API,
  ORDER_NUMBER_API,
  ORDER_NUMBER_VALIDATE_API,
  HOLDINGS_API,
  ISBN_CONVERT_TO_13,
  ORGANIZATION_TYPES_API,
} from './api';
import {
  CONFIG_APPROVALS,
  CONFIG_CREATE_INVENTORY,
  CONFIG_LINES_LIMIT,
  CONFIG_OPEN_ORDER,
  CONFIG_ORDER_NUMBER,
} from './const';

const BASE_RESOURCE = {
  perRequest: LIMIT_MAX,
  throwErrors: false,
  type: 'okapi',
};

export const LOCATIONS = {
  ...BASE_RESOURCE,
  path: LOCATIONS_API,
  params: {
    query: 'cql.allRecords=1 sortby name',
  },
  records: 'locations',
  throwErrors: false,
};

export const ORDER = {
  ...BASE_RESOURCE,
  path: ORDER_DETAIL_API,
  POST: {
    path: ORDERS_API,
  },
};

export const LINE = {
  type: 'okapi',
  path: LINE_DETAIL_API,
  throwErrors: false,
};

export const IDENTIFIER_TYPES = {
  ...BASE_RESOURCE,
  path: IDENTIFIER_TYPES_API,
  params: {
    query: 'cql.allRecords=1 sortby name',
  },
  records: 'identifierTypes',
};

export const MATERIAL_TYPES = {
  ...BASE_RESOURCE,
  path: MATERIAL_TYPE_API,
  params: {
    query: 'cql.allRecords=1 sortby name',
  },
  records: 'mtypes',
};

export const VENDORS = {
  ...BASE_RESOURCE,
  path: VENDORS_API,
  GET: {
    params: {
      query: 'cql.allRecords=1 sortby name',
    },
  },
  records: 'organizations',
};

export const LINES_LIMIT = {
  ...BASE_RESOURCE,
  records: 'settings',
  path: ORDERS_STORAGE_SETTINGS_API,
  GET: {
    params: {
      query: `key=="${CONFIG_LINES_LIMIT}"`,
    },
  },
};

export const FUND = fundsManifest;

export const USERS = {
  ...BASE_RESOURCE,
  path: USERS_API,
  params: {
    query: 'cql.allRecords=1 sortby personal.firstName personal.lastName',
  },
  records: 'users',
};

export const CONTRIBUTOR_NAME_TYPES = {
  ...BASE_RESOURCE,
  path: CONTRIBUTOR_NAME_TYPES_API,
  params: {
    query: 'cql.allRecords=1 sortby name',
  },
  records: 'contributorNameTypes',
};

export const CREATE_INVENTORY = {
  ...BASE_RESOURCE,
  path: ORDERS_STORAGE_SETTINGS_API,
  records: 'settings',
  GET: {
    params: {
      query: `key=="${CONFIG_CREATE_INVENTORY}"`,
    },
  },
};

export const ORDER_NUMBER_SETTING = {
  ...BASE_RESOURCE,
  path: ORDERS_STORAGE_SETTINGS_API,
  records: 'settings',
  GET: {
    params: {
      query: `key=="${CONFIG_ORDER_NUMBER}"`,
    },
  },
};

export const APPROVALS_SETTING = {
  ...BASE_RESOURCE,
  path: ORDERS_STORAGE_SETTINGS_API,
  records: 'settings',
  GET: {
    params: {
      query: `key=="${CONFIG_APPROVALS}"`,
    },
  },
};

export const ORDER_TEMPLATES = {
  ...BASE_RESOURCE,
  path: ORDER_TEMPLATES_API,
  records: 'orderTemplates',
  GET: {
    params: {
      query: 'cql.allRecords=1 sortby templateName',
    },
  },
};

export const ORDER_TEMPLATE = {
  ...BASE_RESOURCE,
  path: ORDER_TEMPLATE_DETAIL_API,
  POST: {
    path: ORDER_TEMPLATES_API,
  },
};

export const ORDER_INVOICES = {
  ...BASE_RESOURCE,
  path: ORDER_INVOICE_RELNS_API,
  records: 'orderInvoiceRelationships',
};

export const INVOICES = {
  ...BASE_RESOURCE,
  path: INVOICES_API,
  records: 'invoices',
};

export const INVOICE_LINES = {
  ...BASE_RESOURCE,
  path: INVOICE_LINES_API,
  records: 'invoiceLines',
};

export const ACQUISITIONS_UNITS = {
  ...BASE_RESOURCE,
  path: ACQUISITIONS_UNITS_API,
  records: 'acquisitionsUnits',
};

export const VALIDATE_ISBN = {
  ...BASE_RESOURCE,
  accumulate: true,
  fetch: false,
  path: ISBN_VALIDATOR,
};

export const CONVERT_TO_ISBN13 = {
  ...BASE_RESOURCE,
  accumulate: true,
  fetch: false,
  path: ISBN_CONVERT_TO_13,
};

export const OPEN_ORDER_SETTING = {
  ...BASE_RESOURCE,
  path: ORDERS_STORAGE_SETTINGS_API,
  records: 'settings',
  GET: {
    params: {
      query: `key=="${CONFIG_OPEN_ORDER}"`,
    },
  },
};

export const ORDER_LINES = {
  ...BASE_RESOURCE,
  accumulate: true,
  fetch: false,
  path: LINES_API,
  records: 'poLines',
};

export const ORDERS = {
  ...BASE_RESOURCE,
  accumulate: true,
  fetch: false,
  path: ORDERS_API,
  records: 'purchaseOrders',
};

export const ORDER_NUMBER = {
  ...baseManifest,
  accumulate: true,
  fetch: false,
  path: ORDER_NUMBER_API,
  clientGeneratePk: false,
  POST: {
    path: ORDER_NUMBER_VALIDATE_API,
  },
};

export const HOLDINGS = {
  ...baseManifest,
  accumulate: true,
  fetch: false,
  path: HOLDINGS_API,
  records: 'holdingsRecords',
};

export const ORGANIZATION_TYPES = {
  ...baseManifest,
  accumulate: true,
  fetch: false,
  path: ORGANIZATION_TYPES_API,
  records: 'organizationTypes',
};
