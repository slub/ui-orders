/**
 * Sample context sent to mod-template-engine for the preview of claim email
 * templates. It is the backend's draft of the payload the claim export will
 * build (Markus, 2026-10-27): the order email context (see
 * `EmailTemplates/samplePreviewContext.js`) with a `pieces[]` loop inside
 * each order line. Kept verbatim so a template that works in the preview
 * works against the export as well; replace it when the payload changes.
 *
 * Pieces claimed through a claim sequence carry `claimSequence.stage`; pieces
 * claimed manually through the previous workflow have no `claimSequence` at
 * all and keep getting a new claim date instead. Templates tell the two apart
 * with Handlebars conditions inside the pieces loop.
 */

export const CLAIM_SAMPLE_PREVIEW_CONTEXT = {
  createdAt: '2027-04-16T09:41:07.123Z',
  organization: {
    name: 'GOBI Library Solutions',
    primaryAddress: {
      addressLine1: '1 Innovation Way',
      city: 'Contoocook',
      zipCode: '03229',
      country: 'USA',
    },
  },
  orders: [
    {
      order: {
        poNumber: '10042',
        orderType: 'Ongoing',
        metadata: {
          createdByUser: {
            id: '7a626480-284e-5b55-9cf2-db32f93956cf',
            firstName: 'John',
            lastName: 'Doe',
            fullName: 'John Doe',
          },
        },
        shipTo: {
          id: '11111111-1111-1111-1111-111111111111',
          address: 'SLUB Dresden, Zellescher Weg 18, 01069 Dresden',
        },
        billTo: {
          id: '22222222-2222-2222-2222-222222222222',
          address: 'Accounts Payable, PO Box 42, Springfield IL',
        },
        customFields: {
          order_channel: {
            name: 'Order channel',
            type: 'SINGLE_SELECT_DROPDOWN',
            value: { id: 'opt_1', label: 'Web' },
          },
        },
      },
      orderLines: [
        {
          orderLine: {
            poLineNumber: '10042-1',
            titleOrPackage: 'Bibliotheksforum Aktuell',
            publisher: 'FOLIO Press',
            publicationDate: '2027',
            edition: '',
            rush: false,
            contributors: [
              {
                contributor: 'Deutscher Bibliotheksverband',
                contributorNameType: {
                  id: '2e48e713-17f3-4c13-a9f8-23845bb210aa',
                  name: 'Corporate name',
                },
              },
            ],
            details: {
              productIds: [
                {
                  productId: '1234-5678',
                  qualifier: '',
                  productIdType: {
                    id: '913300b2-03ed-469a-8179-c1092c991227',
                    name: 'ISSN',
                  },
                },
              ],
            },
            cost: {
              listUnitPrice: '120.00',
              listUnitPriceElectronic: '0.00',
              quantityPhysical: 1,
              quantityElectronic: 0,
              poLineEstimatedPrice: '120.00',
              currency: 'EUR',
            },
            fundDistribution: [
              {
                code: 'SERIALS',
              },
            ],
            vendorDetail: {
              instructions: 'Deliver to loading dock, ring bell on arrival',
            },
            customFields: {
              binding: {
                name: 'Binding',
                type: 'SINGLE_SELECT_DROPDOWN',
                value: { id: 'opt_2', label: 'Paperback' },
              },
            },
            pieces: [
              {
                displaySummary: 'Heft 3/2027',
                enumeration: 'Jg. 12, Nr. 3',
                chronology: 'März 2027',
                format: 'Physical',
                receiptDate: '2027-03-01',
                claimingInterval: 14,
                externalNote: 'Second reminder – please deliver urgently',
              },
              {
                displaySummary: 'Heft 4/2027',
                enumeration: 'Jg. 12, Nr. 4',
                chronology: 'April 2027',
                format: 'Physical',
                receiptDate: '2027-04-01',
                claimingInterval: 21,
                externalNote: 'Please confirm delivery date',
                claimSequence: {
                  stage: 2,
                },
              },
            ],
          },
        },
      ],
    },
  ],
};
