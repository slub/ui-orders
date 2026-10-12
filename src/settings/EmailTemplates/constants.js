/**
 * Tokens map onto the context payload mod-data-export-worker builds for the
 * email export (MODEXPW-635) and mod-template-engine renders with Handlebars.
 * Tokens inside a loop section resolve relative to that section, so the
 * inner-loop sections (contributors, product IDs, funds) use short token
 * names (e.g. `contributor`) and only work inside the order-line loop.
 */

export const TEMPLATE_SCOPE = 'orders';

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

// The preview values only feed the regex preview of the editor, which is the
// fallback of the backend-rendered preview.
const buildTokens = (previewValues) => Object.entries(previewValues)
  .map(([token, previewValue]) => ({ token, previewValue }));

export const ORDER_EMAIL_TOKENS = {
  [TOKEN_SECTIONS.GENERAL]: buildTokens({
    createdAt: '2026-03-30T16:22:13.284Z',
  }),
  [TOKEN_SECTIONS.ORGANIZATION]: buildTokens({
    'organization.name': 'Schweitzer Fachinformationen',
    'organization.primaryAddress.addressLine1': 'Hagenauer Straße 47',
    'organization.primaryAddress.city': 'Wiesbaden',
    'organization.primaryAddress.zipCode': '65203',
    'organization.primaryAddress.country': 'DEU',
  }),
  [TOKEN_SECTIONS.ORDER]: buildTokens({
    'order.poNumber': '10037',
    'order.orderType': 'One-Time',
    'order.metadata.createdByUser.fullName': 'Max Mustermann',
    // Address lines are separated with \n, see samplePreviewContext.js.
    'order.shipTo.address': 'Branch Library of Humanities\n10 Philosopher Lane\n01234 Booktown',
    'order.billTo.address': 'University Library - Acquisitions\n456 Campus Road\n01234 Booktown',
  }),
  [TOKEN_SECTIONS.ORDER_LINES]: buildTokens({
    'orderLine.poLineNumber': '10037-1',
    'orderLine.titleOrPackage': 'Introduction to Library Science',
    'orderLine.publisher': 'De Gruyter Saur',
    'orderLine.publicationDate': '2024',
    'orderLine.edition': '3rd ed.',
    'orderLine.rush': 'false',
    'orderLine.cost.listUnitPrice': '45.00',
    'orderLine.cost.listUnitPriceElectronic': '0.00',
    'orderLine.cost.quantityPhysical': '2',
    'orderLine.cost.quantityElectronic': '0',
    'orderLine.cost.poLineEstimatedPrice': '90.00',
    'orderLine.cost.currency': 'EUR',
    'orderLine.vendorDetail.instructions': 'Please confirm the delivery date.',
  }),
  [TOKEN_SECTIONS.CONTRIBUTORS]: buildTokens({
    contributor: 'Mustermann, Max',
    'contributorNameType.name': 'Personal name',
  }),
  [TOKEN_SECTIONS.PRODUCT_IDS]: buildTokens({
    productId: '978-3-11-069137-8',
    qualifier: 'paperback',
    'productIdType.name': 'ISBN',
  }),
  [TOKEN_SECTIONS.FUNDS]: buildTokens({
    code: 'LIB-GEN',
  }),
};
