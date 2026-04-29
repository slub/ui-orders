/**
 * Sample data sent to mod-template-engine when rendering the preview.
 *
 * Shape is nested (mustache-friendly), with two orders and two order lines
 * per order so loop iteration is visible in the preview.
 *
 * Token-Picker still inserts dotted placeholders like {{order.poNumber}}.
 * As long as the user wraps tokens in their loop tags
 * ({{#orders}}...{{/orders}}, {{#orderLines}}...{{/orderLines}}),
 * mustache will resolve {{poNumber}} inside the order section etc.
 *
 * The flat dotted-key tokens (e.g. {{vendor.name}}) outside of any loop
 * still resolve because each section also has its data exposed at the
 * top level.
 */

const sampleOrderLineA1 = {
  poLineNumber: 'PO-2026-001234-1',
  title: 'Introduction to Library Science',
  contributors: 'Mustermann, Max; Schmidt, Anna',
  publisher: 'De Gruyter',
  publicationPlace: 'Berlin',
  publicationDate: '2024',
  edition: '3rd ed.',
  productIdentifier: '978-3-11-069137-8',
  productIdentifierType: 'ISBN',
  materialType: 'Book',
  listUnitPrice: '45.00',
  listUnitPriceElectronic: '',
  quantityPhysical: '2',
  quantityElectronic: '0',
  quantity: '2',
  estimatedPrice: '90.00 EUR',
  currency: 'EUR',
  fundCodes: 'HIST, GERM',
  noteTitle: 'Lieferhinweis',
  noteDetails: 'Bitte Rechnung in Kopie an Fachabteilung',
  noteType: 'General note',
  vendorRefNumber: 'SCHW-REF-98765',
  instructions: 'Hardcover preferred',
};

const sampleOrderLineA2 = {
  poLineNumber: 'PO-2026-001234-2',
  title: 'Advanced Cataloging Techniques',
  contributors: 'Becker, Lara',
  publisher: 'Springer',
  publicationPlace: 'Heidelberg',
  publicationDate: '2025',
  edition: '1st ed.',
  productIdentifier: '978-3-540-77974-2',
  productIdentifierType: 'ISBN',
  materialType: 'Book',
  listUnitPrice: '59.95',
  listUnitPriceElectronic: '',
  quantityPhysical: '1',
  quantityElectronic: '0',
  quantity: '1',
  estimatedPrice: '59.95 EUR',
  currency: 'EUR',
  fundCodes: 'HIST',
  noteTitle: '',
  noteDetails: '',
  noteType: '',
  vendorRefNumber: 'SCHW-REF-98770',
  instructions: '',
};

const sampleOrderLineB1 = {
  poLineNumber: 'PO-2026-001235-1',
  title: 'Digital Preservation Handbook',
  contributors: 'Weber, Julia; Krause, Tim',
  publisher: 'Routledge',
  publicationPlace: 'London',
  publicationDate: '2023',
  edition: '2nd ed.',
  productIdentifier: '978-1-138-23456-7',
  productIdentifierType: 'ISBN',
  materialType: 'Book',
  listUnitPrice: '72.50',
  listUnitPriceElectronic: '65.00',
  quantityPhysical: '1',
  quantityElectronic: '1',
  quantity: '2',
  estimatedPrice: '137.50 EUR',
  currency: 'EUR',
  fundCodes: 'INFO',
  noteTitle: '',
  noteDetails: '',
  noteType: '',
  vendorRefNumber: 'SCHW-REF-98801',
  instructions: 'Express delivery',
};

const orderA = {
  poNumber: 'PO-2026-001234',
  orderDate: '2026-04-15',
  orderType: 'One-Time',
  createdBy: 'Max Mustermann',
  totalEstimatedPrice: '149.95 EUR',
  shipTo: 'Main Library, 123 Library Street, 01234 Booktown',
  billTo: 'University Library, Accounting Dept., 456 Campus Road, 01234 Booktown',
  note: 'Please confirm delivery date.',
  orderLines: [sampleOrderLineA1, sampleOrderLineA2],
};

const orderB = {
  poNumber: 'PO-2026-001235',
  orderDate: '2026-04-22',
  orderType: 'Ongoing',
  createdBy: 'Anna Schmidt',
  totalEstimatedPrice: '137.50 EUR',
  shipTo: 'Main Library, 123 Library Street, 01234 Booktown',
  billTo: 'University Library, Accounting Dept., 456 Campus Road, 01234 Booktown',
  note: '',
  orderLines: [sampleOrderLineB1],
};

export const SAMPLE_PREVIEW_CONTEXT = {
  vendor: {
    name: 'Schweitzer Fachinformationen',
    code: 'SCHW',
    contactEmail: 'orders@schweitzer-online.de',
    accountNumber: 'BIB-2026-4711',
  },
  library: {
    name: 'University Library',
    address: '456 Campus Road, 01234 Booktown',
  },
  order: orderA,
  orderLine: sampleOrderLineA1,
  orders: [orderA, orderB],
};
