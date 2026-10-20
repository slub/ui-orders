import { get } from 'lodash';

import { SAMPLE_PREVIEW_CONTEXT } from './samplePreviewContext';

/**
 * Tokens map onto the context payload mod-data-export-worker builds for the
 * email export (MODEXPW-635) and mod-template-engine renders with Handlebars.
 * Tokens inside a loop section resolve relative to that section, so the
 * inner-loop sections (contributors, product IDs, funds) use short token
 * names (e.g. `contributor`) and only work inside the order-line loop.
 */

export const TEMPLATE_SCOPE = 'orders-email';

export const TOKEN_SECTIONS = {
  GENERAL: 'general',
  ORGANIZATION: 'organization',
  ORDER: 'order',
  ORDER_LINES: 'orderLines',
  CONTRIBUTORS: 'contributors',
  PRODUCT_IDS: 'productIds',
  FUNDS: 'funds',
};

// Handlebars section names wrapped around inserted tokens.
export const ORDERS_LOOP_TAG = 'orders';
export const ORDER_LINES_LOOP_TAG = 'orderLines';
export const CONTRIBUTORS_LOOP_TAG = 'orderLine.contributors';
export const PRODUCT_IDS_LOOP_TAG = 'orderLine.details.productIds';
export const FUND_DISTRIBUTION_LOOP_TAG = 'orderLine.fundDistribution';

// The preview values feed the regex preview of the editor, which is the
// fallback of the backend-rendered preview. They come from the first item
// of each loop in the sample context, so both previews show the same data.
// The regex preview only inserts strings and numbers, hence the String().
const [firstOrder] = SAMPLE_PREVIEW_CONTEXT.orders;
const [firstOrderLine] = firstOrder.orderLines;

const buildTokens = (base, tokens) => tokens.map((token) => ({
  token,
  previewValue: String(get(base, token)),
}));

export const ORDER_EMAIL_TOKENS = {
  [TOKEN_SECTIONS.GENERAL]: buildTokens(SAMPLE_PREVIEW_CONTEXT, [
    'createdAt',
  ]),
  [TOKEN_SECTIONS.ORGANIZATION]: buildTokens(SAMPLE_PREVIEW_CONTEXT, [
    'organization.name',
    'organization.primaryAddress.addressLine1',
    'organization.primaryAddress.city',
    'organization.primaryAddress.zipCode',
    'organization.primaryAddress.country',
  ]),
  [TOKEN_SECTIONS.ORDER]: buildTokens(firstOrder, [
    'order.poNumber',
    'order.orderType',
    'order.metadata.createdByUser.fullName',
    'order.shipTo.address',
    'order.billTo.address',
  ]),
  [TOKEN_SECTIONS.ORDER_LINES]: buildTokens(firstOrderLine, [
    'orderLine.poLineNumber',
    'orderLine.titleOrPackage',
    'orderLine.publisher',
    'orderLine.publicationDate',
    'orderLine.edition',
    'orderLine.rush',
    'orderLine.cost.listUnitPrice',
    'orderLine.cost.listUnitPriceElectronic',
    'orderLine.cost.quantityPhysical',
    'orderLine.cost.quantityElectronic',
    'orderLine.cost.poLineEstimatedPrice',
    'orderLine.cost.currency',
    'orderLine.vendorDetail.instructions',
  ]),
  [TOKEN_SECTIONS.CONTRIBUTORS]: buildTokens(firstOrderLine.orderLine.contributors[0], [
    'contributor',
    'contributorNameType.name',
  ]),
  [TOKEN_SECTIONS.PRODUCT_IDS]: buildTokens(firstOrderLine.orderLine.details.productIds[0], [
    'productId',
    'qualifier',
    'productIdType.name',
  ]),
  [TOKEN_SECTIONS.FUNDS]: buildTokens(firstOrderLine.orderLine.fundDistribution[0], [
    'code',
  ]),
};
