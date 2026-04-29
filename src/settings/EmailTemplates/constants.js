/**
 * Constants for Email Templates
 *
 * Token structure follows Mustache syntax:
 * - Simple tokens: {{vendor.name}}
 * - Loops: {{#orderLines}}...{{/orderLines}}
 *
 * Order line tokens are always rendered inside a loop.
 * The loop is handled by the TemplateEditor via loopConfig.
 */

export const EMAIL_TEMPLATE_CATEGORY = 'OrderEmail';
export const TEMPLATE_SCOPE = 'orders';

export const TOKEN_SECTIONS = {
  VENDOR: 'vendor',
  ORDER: 'order',
  ORDER_LINES: 'orderLines',
  LIBRARY: 'library',
};

export const ORDER_LINES_LOOP_TAG = 'orderLines';

// TODO: Finalize token list with backend team
export const ORDER_EMAIL_TOKENS = {
  [TOKEN_SECTIONS.VENDOR]: [
    {
      token: 'vendor.name',
      previewValue: 'Schweitzer Fachinformationen',
    },
    {
      token: 'vendor.code',
      previewValue: 'SCHW',
    },
    {
      token: 'vendor.contactEmail',
      previewValue: 'orders@schweitzer-online.de',
    },
    {
      token: 'vendor.accountNumber',
      previewValue: 'BIB-2024-4711',
    },
  ],
  [TOKEN_SECTIONS.ORDER]: [
    {
      token: 'order.poNumber',
      previewValue: 'PO-2024-001234',
    },
    {
      token: 'order.orderDate',
      previewValue: '2024-02-03',
    },
    {
      token: 'order.orderType',
      previewValue: 'One-Time',
    },
    {
      token: 'order.createdBy',
      previewValue: 'Max Mustermann',
    },
    {
      token: 'order.totalEstimatedPrice',
      previewValue: '1,234.56 EUR',
    },
    {
      token: 'order.shipTo',
      previewValue: 'Main Library, 123 Library Street, 01234 Booktown',
    },
    {
      token: 'order.billTo',
      previewValue: 'University Library, Accounting Dept., 456 Campus Road, 01234 Booktown',
    },
    {
      token: 'order.note',
      previewValue: 'Please confirm delivery date.',
    },
  ],
  [TOKEN_SECTIONS.ORDER_LINES]: [
    {
      token: 'orderLine.poLineNumber',
      previewValue: 'PO-2024-001234-1',
    },
    {
      token: 'orderLine.title',
      previewValue: 'Introduction to Library Science',
    },
    {
      token: 'orderLine.contributors',
      previewValue: 'Mustermann, Max; Schmidt, Anna',
    },
    {
      token: 'orderLine.publisher',
      previewValue: 'De Gruyter',
    },
    {
      token: 'orderLine.publicationPlace',
      previewValue: 'Berlin',
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
      token: 'orderLine.productIdentifier',
      previewValue: '978-3-11-069137-8',
    },
    {
      token: 'orderLine.productIdentifierType',
      previewValue: 'ISBN',
    },
    {
      token: 'orderLine.materialType',
      previewValue: 'Book',
    },
    {
      token: 'orderLine.listUnitPrice',
      previewValue: '45.00',
    },
    {
      token: 'orderLine.listUnitPriceElectronic',
      previewValue: '39.95',
    },
    {
      token: 'orderLine.quantityPhysical',
      previewValue: '2',
    },
    {
      token: 'orderLine.quantityElectronic',
      previewValue: '1',
    },
    {
      token: 'orderLine.quantity',
      previewValue: '3',
    },
    {
      token: 'orderLine.estimatedPrice',
      previewValue: '129.95 EUR',
    },
    {
      token: 'orderLine.currency',
      previewValue: 'EUR',
    },
    {
      token: 'orderLine.fundCodes',
      previewValue: 'HIST, GERM',
    },
    {
      token: 'orderLine.noteTitle',
      previewValue: 'Lieferhinweis',
    },
    {
      token: 'orderLine.noteDetails',
      previewValue: 'Bitte Rechnung in Kopie an Fachabteilung',
    },
    {
      token: 'orderLine.noteType',
      previewValue: 'General note',
    },
    {
      token: 'orderLine.vendorRefNumber',
      previewValue: 'SCHW-REF-98765',
    },
    {
      token: 'orderLine.instructions',
      previewValue: 'Hardcover preferred',
    },
  ],
  [TOKEN_SECTIONS.LIBRARY]: [
    {
      token: 'library.name',
      previewValue: 'University Library',
    },
    {
      token: 'library.address',
      previewValue: '456 Campus Road, 01234 Booktown',
    },
  ],
};
