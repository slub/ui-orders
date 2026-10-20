/**
 * Sample context sent to mod-template-engine for the preview of claim email
 * templates. There is no context mapper for claims in mod-data-export-worker
 * yet; this is the frontend's proposal for it (one email per vendor with the
 * pieces to claim), to be replaced by the mapper's payload once it exists.
 *
 * Nesting: `pieces[]` holds one entry per piece, each wrapping the piece
 * itself (`piece`), its title (`title`), its order line (`orderLine`) and its
 * order (`order`). The order line carries the `vendorDetail.referenceNumbers`
 * loop. `piece.claimStage` is the stage of the current claim; a piece without
 * `lastClaimDate` is being claimed for the first time.
 */

const organization = {
  name: 'Periodicals Supply Ltd.',
  primaryAddress: {
    addressLine1: '12 Serials Street',
    city: 'Booktown',
    zipCode: '01234',
    // ISO 3166-1 alpha-3 code, not a display name.
    country: 'GBR',
  },
};

const orderA = {
  poNumber: '10041',
};

const orderB = {
  poNumber: '10038',
};

const serialOrderLine = {
  poLineNumber: '10041-1',
  titleOrPackage: 'Journal of Library Science',
  vendorDetail: {
    vendorAccount: 'ACC-55123',
    referenceNumbers: [
      { refNumber: 'SUB-77821', refNumberType: 'Vendor subscription reference number' },
      { refNumber: 'VT-4410', refNumberType: 'Vendor title number' },
    ],
  },
};

const monographOrderLine = {
  poLineNumber: '10038-1',
  titleOrPackage: 'Digital Preservation Handbook',
  vendorDetail: {
    vendorAccount: 'ACC-55123',
    referenceNumbers: [
      { refNumber: 'VO-2026-0918', refNumberType: 'Vendor order reference number' },
    ],
  },
};

const serialTitle = {
  title: 'Journal of Library Science',
};

const monographTitle = {
  title: 'Digital Preservation Handbook',
};

const pieceA1 = {
  piece: {
    displaySummary: 'v.48:no.2 (2026:Apr.)',
    enumeration: 'vol. 48, no. 2',
    chronology: 'April 2026',
    receiptDate: '2026-04-15T00:00:00.000+00:00',
    claimStage: 2,
    lastClaimDate: '2026-05-06T08:30:00.000+00:00',
    externalNote: 'Issue not received, please resend.',
  },
  title: serialTitle,
  orderLine: serialOrderLine,
  order: orderA,
};

const pieceA2 = {
  piece: {
    displaySummary: 'v.48:no.3 (2026:May)',
    enumeration: 'vol. 48, no. 3',
    chronology: 'May 2026',
    receiptDate: '2026-05-15T00:00:00.000+00:00',
    claimStage: 1,
  },
  title: serialTitle,
  orderLine: serialOrderLine,
  order: orderA,
};

const pieceB1 = {
  piece: {
    displaySummary: 'Copy 1',
    receiptDate: '2026-03-30T00:00:00.000+00:00',
    claimStage: 3,
    lastClaimDate: '2026-05-20T09:12:00.000+00:00',
    externalNote: 'Rush order for a course reserve.',
  },
  title: monographTitle,
  orderLine: monographOrderLine,
  order: orderB,
};

export const CLAIM_SAMPLE_PREVIEW_CONTEXT = {
  createdAt: '2026-06-03T07:45:21.512Z',
  organization,
  pieces: [pieceA1, pieceA2, pieceB1],
};
