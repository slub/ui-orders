/**
 * Sample data sent to mod-template-engine when rendering the preview.
 *
 * Structure follows the FOLIO notice-template convention used by
 * mod-circulation: each loop element wraps its fields in a sub-object
 * named after the dotted-token prefix the user inserts via the
 * Token-Picker.
 *
 * For example, {{order.poNumber}} inside {{#orders}}...{{/orders}} only
 * resolves correctly if every element of `orders[]` has an `order` sub-
 * object containing `poNumber`. Same for {{orderLine.title}} inside
 * {{#orderLines}}...{{/orderLines}}.
 *
 * Outside any loop, top-level `order`, `orderLine`, `organization`,
 * `library` sub-objects let the same dotted tokens resolve at root
 * level.
 *
 * Ship-to / bill-to are plain strings because FOLIO stores tenant
 * addresses as a single pre-formatted text field selected via a
 * dropdown per order.
 */

const organization = {
  name: 'Schweitzer Fachinformationen',
  code: 'SCHW',
  contactEmail: 'orders@schweitzer-online.de',
  address: {
    addressLine1: 'Hauptstraße 1',
    city: 'Berlin',
    zipCode: '10115',
    country: 'Germany',
  },
  accountNumber: 'BIB-2026-4711',
};

const library = {
  name: 'Main Library',
  address: {
    addressLine1: '100 University Avenue',
    city: 'Auckland',
    zipCode: '1010',
    country: 'New Zealand',
  },
};

const orderAFields = {
  poNumber: '10037',
  orderDate: '2026-04-15',
  orderType: 'One-Time',
  createdBy: 'Max Mustermann',
  totalEstimatedPrice: '149.95 EUR',
  shipTo: 'Branch Library of Humanities\n10 Philosopher Lane\n01234 Booktown',
  billTo: 'University Library - Acquisitions\n456 Campus Road\n01234 Booktown',
  note: 'Please confirm delivery date.',
};

const orderBFields = {
  poNumber: '10038',
  orderDate: '2026-04-22',
  orderType: 'Ongoing',
  createdBy: 'Anna Schmidt',
  totalEstimatedPrice: '197.45 EUR',
  shipTo: 'Science Library\n25 Laboratory Drive\n01234 Booktown',
  billTo: 'University Library - Acquisitions\n456 Campus Road\n01234 Booktown',
  note: '',
};

const lineA1Fields = {
  poLineNumber: '10037-1',
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
  vendorRefNumber: 'V-98765',
  instructions: 'Hardcover preferred',
};

const lineA2Fields = {
  poLineNumber: '10037-2',
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
  vendorRefNumber: 'V-98770',
  instructions: '',
};

const lineB1Fields = {
  poLineNumber: '10038-1',
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
  vendorRefNumber: 'V-98801',
  instructions: 'Express delivery',
};

const lineB2Fields = {
  poLineNumber: '10038-2',
  title: 'Open Access Publishing',
  contributors: 'Hofmann, Lisa',
  publisher: 'Cambridge University Press',
  publicationPlace: 'Cambridge',
  publicationDate: '2025',
  edition: '1st ed.',
  productIdentifier: '978-1-108-12345-6',
  productIdentifierType: 'ISBN',
  materialType: 'Book',
  listUnitPrice: '59.95',
  listUnitPriceElectronic: '',
  quantityPhysical: '1',
  quantityElectronic: '0',
  quantity: '1',
  estimatedPrice: '59.95 EUR',
  currency: 'EUR',
  fundCodes: 'INFO',
  noteTitle: '',
  noteDetails: '',
  noteType: '',
  vendorRefNumber: 'V-98810',
  instructions: '',
};

const orderA = {
  order: orderAFields,
  orderLines: [
    { orderLine: lineA1Fields },
    { orderLine: lineA2Fields },
  ],
};

const orderB = {
  order: orderBFields,
  orderLines: [
    { orderLine: lineB1Fields },
    { orderLine: lineB2Fields },
  ],
};

export const SAMPLE_PREVIEW_CONTEXT = {
  organization,
  library,
  order: orderAFields,
  orderLine: lineA1Fields,
  orders: [orderA, orderB],
};
