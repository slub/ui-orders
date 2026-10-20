import { buildTokens } from '../EmailTemplates/constants';
import { CLAIM_SAMPLE_PREVIEW_CONTEXT } from './samplePreviewContext';

/**
 * Tokens for the claim email templates. They map onto the sample context in
 * `samplePreviewContext.js`, which is the frontend's proposal for the context
 * mapper of claims (none exists yet). Tokens inside a loop section resolve
 * relative to that section, so the reference numbers only work inside the
 * pieces loop.
 */

// Specific on purpose: print templates for claims may follow with their own scope.
export const CLAIM_TEMPLATE_SCOPE = 'claims-email';

export const CLAIM_TOKEN_SECTIONS = {
  GENERAL: 'general',
  ORGANIZATION: 'organization',
  PIECES: 'pieces',
  ORDER_LINE: 'orderLine',
  REFERENCE_NUMBERS: 'referenceNumbers',
};

// Handlebars section names wrapped around inserted tokens.
export const PIECES_LOOP_TAG = 'pieces';
export const REFERENCE_NUMBERS_LOOP_TAG = 'orderLine.vendorDetail.referenceNumbers';

const [firstPiece] = CLAIM_SAMPLE_PREVIEW_CONTEXT.pieces;

export const CLAIM_EMAIL_TOKENS = {
  [CLAIM_TOKEN_SECTIONS.GENERAL]: buildTokens(CLAIM_SAMPLE_PREVIEW_CONTEXT, [
    'createdAt',
  ]),
  [CLAIM_TOKEN_SECTIONS.ORGANIZATION]: buildTokens(CLAIM_SAMPLE_PREVIEW_CONTEXT, [
    'organization.name',
    'organization.primaryAddress.addressLine1',
    'organization.primaryAddress.city',
    'organization.primaryAddress.zipCode',
    'organization.primaryAddress.country',
  ]),
  [CLAIM_TOKEN_SECTIONS.PIECES]: buildTokens(firstPiece, [
    'piece.displaySummary',
    'piece.enumeration',
    'piece.chronology',
    'piece.receiptDate',
    'piece.claimStage',
    'piece.lastClaimDate',
    'piece.externalNote',
    'title.title',
  ]),
  // Order line and order of the piece, hence inside the pieces loop as well.
  [CLAIM_TOKEN_SECTIONS.ORDER_LINE]: buildTokens(firstPiece, [
    'order.poNumber',
    'orderLine.poLineNumber',
    'orderLine.titleOrPackage',
    'orderLine.vendorDetail.vendorAccount',
  ]),
  [CLAIM_TOKEN_SECTIONS.REFERENCE_NUMBERS]: buildTokens(firstPiece.orderLine.vendorDetail.referenceNumbers[0], [
    'refNumber',
    'refNumberType',
  ]),
};

export const CLAIM_TOKEN_SECTIONS_LIST = [
  {
    key: CLAIM_TOKEN_SECTIONS.GENERAL,
    headerId: 'ui-orders.settings.emailTemplates.tokens.general',
  },
  {
    key: CLAIM_TOKEN_SECTIONS.ORGANIZATION,
    headerId: 'ui-orders.settings.emailTemplates.tokens.organization',
  },
  {
    key: CLAIM_TOKEN_SECTIONS.PIECES,
    headerId: 'ui-orders.settings.claimEmailTemplates.tokens.pieces',
    loop: { labelId: 'ui-orders.settings.claimEmailTemplates.tokens.multiplePieces', tag: PIECES_LOOP_TAG },
  },
  {
    key: CLAIM_TOKEN_SECTIONS.ORDER_LINE,
    headerId: 'ui-orders.settings.claimEmailTemplates.tokens.orderLine',
  },
  {
    key: CLAIM_TOKEN_SECTIONS.REFERENCE_NUMBERS,
    headerId: 'ui-orders.settings.claimEmailTemplates.tokens.referenceNumbers',
    loop: {
      labelId: 'ui-orders.settings.claimEmailTemplates.tokens.multipleReferenceNumbers',
      tag: REFERENCE_NUMBERS_LOOP_TAG,
    },
  },
];

export const CLAIM_EMAIL_TEMPLATES_CONFIG = {
  scope: CLAIM_TEMPLATE_SCOPE,
  labelId: 'ui-orders.settings.claimEmailTemplates.label',
  entryLabelId: 'ui-orders.settings.claimEmailTemplates.entryLabel',
  newLabelId: 'ui-orders.settings.claimEmailTemplates.new',
  // TODO: dedicated claim-email-templates permissions. The order email
  // template permissions are reused while the PoC runs under Eureka, where
  // new permissions are not registered as capabilities automatically.
  permissions: {
    put: 'ui-orders.settings.email-templates.edit',
    post: 'ui-orders.settings.email-templates.create',
    delete: 'ui-orders.settings.email-templates.delete',
  },
  tokens: CLAIM_EMAIL_TOKENS,
  tokenSections: CLAIM_TOKEN_SECTIONS_LIST,
  loopsHelpId: 'ui-orders.settings.claimEmailTemplates.tokens.help.loops',
  previewContext: CLAIM_SAMPLE_PREVIEW_CONTEXT,
};
