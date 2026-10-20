import {
  LINES_API,
  ORDERS_API,
} from '@folio/stripes-acq-components';

export const AUDIT_ACQ_EVENTS_API = 'audit-data/acquisition';
export const CLAIM_SEQUENCES_API = 'orders-storage/claim-sequences';
export const INSTANCE_STATUSES_API = 'instance-statuses';
export const INSTANCE_TYPES_API = 'instance-types';
export const INVOICES_API = 'invoice/invoices';
export const INVOICE_LINES_API = 'invoice/invoice-lines';
export const REASONS_FOR_CLOSURE_API = 'orders/configuration/reasons-for-closure';
export const ROUTING_LIST_API = 'orders/routing-lists';
export const TEMPLATES_API = 'templates';
export const TITLES_API = 'orders/titles';
export const UPDATE_ENCUMBRANCES_API = `${ORDERS_API}/:{id}/re-encumber`;
export const USER_ADDRESS_TYPES_API = 'addresstypes';
export const VALIDATE_PO_LINE_FUND_DISTRIBUTION_API = `${LINES_API}/fund-distributions/validate`;
