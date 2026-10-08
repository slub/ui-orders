/**
 * Constants for Email Templates
 *
 * The backend (mod-template-engine) renders with Handlebars. Token strings
 * map onto the context payload documented in MODEXPW-635:
 * - Simple tokens:     {{organization.name}}
 * - Loops (sections):  {{#orders}}…{{/orders}}
 * - Nested loops:      {{#orderLines}}…{{#orderLine.contributors}}…
 *
 * Tokens inside a loop section resolve relative to that section, so the
 * inner-loop sections (contributors, product IDs, funds) use short token
 * names (e.g. `contributor`) and must be placed inside the order-line loop.
 */

export const EMAIL_TEMPLATE_CATEGORY = 'OrderEmail';
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

export const ORDER_EMAIL_TOKENS = {
  [TOKEN_SECTIONS.GENERAL]: [
    {
      token: 'createdAt',
      previewValue: '2026-03-30T16:22:13.284Z',
    },
  ],
  [TOKEN_SECTIONS.ORGANIZATION]: [
    {
      token: 'organization.name',
      previewValue: 'Schweitzer Fachinformationen',
    },
    {
      token: 'organization.primaryAddress.addressLine1',
      previewValue: 'Hagenauer Straße 47',
    },
    {
      token: 'organization.primaryAddress.city',
      previewValue: 'Wiesbaden',
    },
    {
      token: 'organization.primaryAddress.zipCode',
      previewValue: '65203',
    },
    {
      token: 'organization.primaryAddress.country',
      previewValue: 'DEU',
    },
  ],
  [TOKEN_SECTIONS.ORDER]: [
    {
      token: 'order.poNumber',
      previewValue: '10037',
    },
    {
      token: 'order.orderType',
      previewValue: 'One-Time',
    },
    {
      token: 'order.metadata.createdByUser.fullName',
      previewValue: 'Max Mustermann',
    },
    {
      // The payload separates address lines with \n, so the template has to
      // pass them through {{nl2br …}} to keep them on separate lines in the
      // HTML mail. Kept identical to samplePreviewContext.js.
      token: 'order.shipTo.address',
      previewValue: 'Branch Library of Humanities\n10 Philosopher Lane\n01234 Booktown',
    },
    {
      token: 'order.billTo.address',
      previewValue: 'University Library - Acquisitions\n456 Campus Road\n01234 Booktown',
    },
  ],
  [TOKEN_SECTIONS.ORDER_LINES]: [
    {
      token: 'orderLine.poLineNumber',
      previewValue: '10037-1',
    },
    {
      token: 'orderLine.titleOrPackage',
      previewValue: 'Introduction to Library Science',
    },
    {
      token: 'orderLine.publisher',
      previewValue: 'De Gruyter Saur',
    },
    {
      token: 'orderLine.publicationDate',
      previewValue: '2024',
    },
    {
      token: 'orderLine.edition',
      previewValue: '3rd ed.',
    },
    {
      token: 'orderLine.rush',
      previewValue: 'false',
    },
    {
      token: 'orderLine.cost.listUnitPrice',
      previewValue: '45.00',
    },
    {
      token: 'orderLine.cost.listUnitPriceElectronic',
      previewValue: '0.00',
    },
    {
      token: 'orderLine.cost.quantityPhysical',
      previewValue: '2',
    },
    {
      token: 'orderLine.cost.quantityElectronic',
      previewValue: '0',
    },
    {
      token: 'orderLine.cost.poLineEstimatedPrice',
      previewValue: '90.00',
    },
    {
      token: 'orderLine.cost.currency',
      previewValue: 'EUR',
    },
    {
      token: 'orderLine.vendorDetail.instructions',
      previewValue: 'Please confirm the delivery date.',
    },
  ],
  [TOKEN_SECTIONS.CONTRIBUTORS]: [
    {
      token: 'contributor',
      previewValue: 'Mustermann, Max',
    },
    {
      token: 'contributorNameType.name',
      previewValue: 'Personal name',
    },
  ],
  [TOKEN_SECTIONS.PRODUCT_IDS]: [
    {
      token: 'productId',
      previewValue: '978-3-11-069137-8',
    },
    {
      token: 'qualifier',
      previewValue: 'paperback',
    },
    {
      token: 'productIdType.name',
      previewValue: 'ISBN',
    },
  ],
  [TOKEN_SECTIONS.FUNDS]: [
    {
      token: 'code',
      previewValue: 'LIB-GEN',
    },
  ],
};
