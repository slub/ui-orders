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
 * Outside any loop, top-level `order`, `orderLine`, `organization`
 * sub-objects let the same dotted tokens resolve at root level.
 *
 * Ship-to / bill-to are plain strings because FOLIO stores tenant
 * addresses as a single pre-formatted text field selected via a
 * dropdown per order.
 */

const organization = {
  name: 'Schweitzer Fachinformationen',
  primaryAddress: {
    addressLine1: 'Hauptstraße 1',
    city: 'Berlin',
    zipCode: '10115',
    country: 'Germany',
  },
};

const orderAFields = {
  poNumber: '10037',
  orderDate: '2026-04-15',
  createdBy: 'Max Mustermann',
  shipTo: 'Branch Library of Humanities\n10 Philosopher Lane\n01234 Booktown',
  billTo: 'University Library - Acquisitions\n456 Campus Road\n01234 Booktown',
};

const orderBFields = {
  poNumber: '10038',
  orderDate: '2026-04-22',
  createdBy: 'Anna Schmidt',
  shipTo: 'Science Library\n25 Laboratory Drive\n01234 Booktown',
  billTo: 'University Library - Acquisitions\n456 Campus Road\n01234 Booktown',
};

const lineA1Fields = {
  poLineNumber: '10037-1',
  title: 'Introduction to Library Science',
  publicationDate: '2024',
  edition: '3rd ed.',
  productIdentifier: '978-3-11-069137-8',
  productIdentifierType: 'ISBN',
  listUnitPrice: '45.00',
  listUnitPriceElectronic: '',
  quantityPhysical: '2',
  quantityElectronic: '0',
  quantity: '2',
  estimatedPrice: '90.00 EUR',
  currency: 'EUR',
};

const lineA2Fields = {
  poLineNumber: '10037-2',
  title: 'Advanced Cataloging Techniques',
  publicationDate: '2025',
  edition: '1st ed.',
  productIdentifier: '978-3-540-77974-2',
  productIdentifierType: 'ISBN',
  listUnitPrice: '59.95',
  listUnitPriceElectronic: '',
  quantityPhysical: '1',
  quantityElectronic: '0',
  quantity: '1',
  estimatedPrice: '59.95 EUR',
  currency: 'EUR',
};

const lineB1Fields = {
  poLineNumber: '10038-1',
  title: 'Digital Preservation Handbook',
  publicationDate: '2023',
  edition: '2nd ed.',
  productIdentifier: '978-1-138-23456-7',
  productIdentifierType: 'ISBN',
  listUnitPrice: '72.50',
  listUnitPriceElectronic: '65.00',
  quantityPhysical: '1',
  quantityElectronic: '1',
  quantity: '2',
  estimatedPrice: '137.50 EUR',
  currency: 'EUR',
};

const lineB2Fields = {
  poLineNumber: '10038-2',
  title: 'Open Access Publishing',
  publicationDate: '2025',
  edition: '1st ed.',
  productIdentifier: '978-1-108-12345-6',
  productIdentifierType: 'ISBN',
  listUnitPrice: '59.95',
  listUnitPriceElectronic: '',
  quantityPhysical: '1',
  quantityElectronic: '0',
  quantity: '1',
  estimatedPrice: '59.95 EUR',
  currency: 'EUR',
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
  order: orderAFields,
  orderLine: lineA1Fields,
  orders: [orderA, orderB],
};
