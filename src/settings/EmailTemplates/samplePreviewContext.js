/**
 * Sample data sent to mod-template-engine when rendering the preview.
 *
 * The shape mirrors the real context payload the backend builds for the
 * EDIFACT email export (see MODEXPW-635). The backend now renders with
 * Handlebars, so the preview is only faithful when this sample matches the
 * production payload exactly.
 *
 * Nesting (load-bearing):
 * - `orders[]` wraps each order in an `order` sub-object and an `orderLines`
 *   array; each order line wraps its fields in an `orderLine` sub-object.
 *   So `{{#orders}}{{order.poNumber}}{{#orderLines}}{{orderLine.poLineNumber}}…`.
 * - Order lines carry their own loops: `orderLine.contributors[]`,
 *   `orderLine.details.productIds[]`, `orderLine.fundDistribution[]`.
 *
 * There are deliberately no top-level `order` / `orderLine` fallbacks: the
 * real payload has none, so tokens placed outside their loop render empty -
 * which is the correct, faithful behaviour.
 *
 * `shipTo` / `billTo` are objects `{ id, address }`. The address is a
 * pre-formatted multi-line string separated by \n, verified against a real
 * export on 2026-08-06. Since the mail is always HTML, those \n collapse into
 * spaces unless the template converts them: {{nl2br order.shipTo.address}}.
 * Triple braces would silently produce a single-line address.
 */

const organization = {
  name: 'Schweitzer Fachinformationen',
  primaryAddress: {
    addressLine1: 'Hagenauer Straße 47',
    city: 'Wiesbaden',
    zipCode: '65203',
    // The payload carries the raw ISO 3166-1 alpha-3 code, not a display name.
    country: 'DEU',
  },
};

const orderAFields = {
  poNumber: '10037',
  orderType: 'One-Time',
  metadata: {
    createdByUser: {
      id: '6e3f5d2a-1c4b-4e8a-9f7d-2b1a0c8e4d11',
      firstName: 'Max',
      lastName: 'Mustermann',
      fullName: 'Max Mustermann',
    },
  },
  shipTo: {
    id: 'b1d2c3e4-5f60-4a71-8b92-0c1d2e3f4a50',
    address: 'Branch Library of Humanities\n10 Philosopher Lane\n01234 Booktown',
  },
  billTo: {
    id: 'a0b1c2d3-4e5f-4061-9a82-1b2c3d4e5f60',
    address: 'University Library - Acquisitions\n456 Campus Road\n01234 Booktown',
  },
};

const orderBFields = {
  poNumber: '10038',
  orderType: 'Ongoing',
  metadata: {
    createdByUser: {
      id: '7f4e6c3b-2d5a-4f9b-8e6d-3c2b1a9f5e22',
      firstName: 'Anna',
      lastName: 'Schmidt',
      fullName: 'Anna Schmidt',
    },
  },
  shipTo: {
    id: 'c2d3e4f5-6071-4b82-9c03-1d2e3f4a5b61',
    address: 'Science Library\n25 Laboratory Drive\n01234 Booktown',
  },
  billTo: {
    id: 'a0b1c2d3-4e5f-4061-9a82-1b2c3d4e5f60',
    address: 'University Library - Acquisitions\n456 Campus Road\n01234 Booktown',
  },
};

const personalNameType = {
  id: '2b94c631-fca9-4892-a730-03ee529ffe27',
  name: 'Personal name',
};

const corporateNameType = {
  id: '2e48e713-17f3-4c13-a9f8-23845bb210aa',
  name: 'Corporate name',
};

const isbnType = {
  id: '8261054f-be78-422d-bd51-4ed9f33c3422',
  name: 'ISBN',
};

const doiType = {
  id: 'a4a739e2-3b4f-4a52-9e8d-1c6b0f7a2d34',
  name: 'DOI',
};

const oclcType = {
  id: '439bfbae-75bc-4f74-9fc7-b2a2d47ce3ef',
  name: 'OCLC',
};

const issnType = {
  id: '913300b2-03ed-469a-8179-c1092c991227',
  name: 'ISSN',
};

const lineA1Fields = {
  poLineNumber: '10037-1',
  // Real titles carry the full statement of responsibility and run long.
  titleOrPackage: 'Introduction to library science : theory and practice / edited by Jane Roberts ; with contributions by the IFLA working group',
  publisher: 'De Gruyter Saur',
  publicationDate: '2024',
  edition: '3rd ed.',
  rush: false,
  contributors: [
    { contributor: 'Mustermann, Max', contributorNameType: personalNameType },
    { contributor: 'International Federation of Library Associations', contributorNameType: corporateNameType },
    { contributor: 'Schmidt, Anna', contributorNameType: personalNameType },
  ],
  details: {
    productIds: [
      // Qualifiers come straight from the catalogue record and often carry
      // list prices; many product IDs have none at all (the key is absent).
      { productId: '978-3-11-069137-8', qualifier: 'paperback : EUR 45.00 (DE), EUR 46.30 (AT)', productIdType: isbnType },
      { productId: '10.1515/9783110692009', productIdType: doiType },
    ],
  },
  cost: {
    listUnitPrice: '45.00',
    listUnitPriceElectronic: '0.00',
    quantityPhysical: 2,
    quantityElectronic: 0,
    poLineEstimatedPrice: '90.00',
    currency: 'EUR',
  },
  fundDistribution: [
    { code: 'LIB-GEN' },
    { code: 'HUM-2024' },
  ],
  vendorDetail: {
    instructions: 'Please confirm the delivery date.\nDeliver to the acquisitions desk.',
  },
};

const lineA2Fields = {
  poLineNumber: '10037-2',
  titleOrPackage: 'Advanced cataloging techniques',
  publisher: 'Facet Publishing',
  // Free-text field: brackets mark an inferred date, so it is not always a bare year.
  publicationDate: '[2025]',
  edition: '1st ed.',
  rush: true,
  contributors: [
    { contributor: 'Becker, Laura', contributorNameType: personalNameType },
  ],
  details: {
    productIds: [
      { productId: '978-3-540-77974-2', qualifier: 'hardcover', productIdType: isbnType },
    ],
  },
  cost: {
    listUnitPrice: '59.95',
    listUnitPriceElectronic: '0.00',
    quantityPhysical: 1,
    quantityElectronic: 0,
    poLineEstimatedPrice: '59.95',
    currency: 'EUR',
  },
  fundDistribution: [
    { code: 'LIB-GEN' },
  ],
  vendorDetail: {
    instructions: '',
  },
};

const lineB1Fields = {
  poLineNumber: '10038-1',
  titleOrPackage: 'Digital Preservation Handbook',
  publisher: 'Routledge',
  publicationDate: '2023',
  edition: '2nd ed.',
  rush: false,
  contributors: [
    { contributor: 'Owens, Trevor', contributorNameType: personalNameType },
    { contributor: 'Lee, Christopher', contributorNameType: personalNameType },
  ],
  details: {
    productIds: [
      { productId: '978-1-138-23456-7', qualifier: 'print', productIdType: isbnType },
      { productId: '2049-3630', productIdType: issnType },
      { productId: '1256789012', qualifier: 'online', productIdType: oclcType },
    ],
  },
  cost: {
    listUnitPrice: '72.50',
    listUnitPriceElectronic: '65.00',
    quantityPhysical: 1,
    quantityElectronic: 1,
    poLineEstimatedPrice: '137.50',
    currency: 'EUR',
  },
  fundDistribution: [
    { code: 'PRES-2024' },
  ],
  vendorDetail: {
    instructions: 'Standing order - renew annually.',
  },
};

const lineB2Fields = {
  poLineNumber: '10038-2',
  titleOrPackage: 'Open Access Publishing',
  publisher: 'Cambridge University Press',
  publicationDate: '2025',
  edition: '1st ed.',
  rush: false,
  contributors: [
    { contributor: 'Suber, Peter', contributorNameType: personalNameType },
  ],
  details: {
    productIds: [
      { productId: '978-1-108-12346-3', qualifier: 'ebook', productIdType: isbnType },
    ],
  },
  cost: {
    listUnitPrice: '0.00',
    listUnitPriceElectronic: '129.00',
    quantityPhysical: 0,
    quantityElectronic: 1,
    poLineEstimatedPrice: '129.00',
    currency: 'EUR',
  },
  fundDistribution: [
    { code: 'OA-FUND' },
  ],
  vendorDetail: {
    instructions: '',
  },
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
  createdAt: '2026-03-30T16:22:13.284Z',
  organization,
  orders: [orderA, orderB],
};
