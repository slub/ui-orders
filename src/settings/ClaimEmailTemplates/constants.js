import {
  buildOrderEmailTokens,
  buildTokens,
  ORDER_TOKEN_SECTIONS,
  TOKEN_SECTIONS,
} from '../EmailTemplates/constants';
import { CLAIM_SAMPLE_PREVIEW_CONTEXT } from './samplePreviewContext';

/**
 * Tokens for the claim email templates. The context is the order email
 * context plus a `pieces[]` loop inside each order line (see
 * `samplePreviewContext.js`), so the order sections are reused and only the
 * pieces section is specific to claims. Tokens inside a loop section resolve
 * relative to that section, so the piece tokens only work inside the pieces
 * loop, which in turn sits inside the order lines loop.
 */

// Specific on purpose: print templates for claims may follow with their own scope.
export const CLAIM_TEMPLATE_SCOPE = 'claims-email';

export const CLAIM_TOKEN_SECTIONS = {
  ...TOKEN_SECTIONS,
  PIECES: 'pieces',
};

// Handlebars section name wrapped around inserted piece tokens.
export const PIECES_LOOP_TAG = 'orderLine.pieces';

// Preview values come from the last piece: it is the one claimed through a
// claim sequence, pieces claimed manually have no `claimSequence`.
const [firstOrderLine] = CLAIM_SAMPLE_PREVIEW_CONTEXT.orders[0].orderLines;
const sequencedPiece = firstOrderLine.orderLine.pieces.at(-1);

export const CLAIM_EMAIL_TOKENS = {
  ...buildOrderEmailTokens(CLAIM_SAMPLE_PREVIEW_CONTEXT),
  [CLAIM_TOKEN_SECTIONS.PIECES]: buildTokens(sequencedPiece, [
    'displaySummary',
    'enumeration',
    'chronology',
    'format',
    'receiptDate',
    'claimingInterval',
    'externalNote',
    'claimSequence.stage',
  ]),
};

const PIECES_SECTION = {
  key: CLAIM_TOKEN_SECTIONS.PIECES,
  headerId: 'ui-orders.settings.claimEmailTemplates.tokens.pieces',
  loop: { labelId: 'ui-orders.settings.claimEmailTemplates.tokens.multiplePieces', tag: PIECES_LOOP_TAG },
};

// Order sections with the pieces right after the order lines they belong to.
const orderLinesIndex = ORDER_TOKEN_SECTIONS.findIndex(({ key }) => key === TOKEN_SECTIONS.ORDER_LINES);

export const CLAIM_TOKEN_SECTIONS_LIST = [
  ...ORDER_TOKEN_SECTIONS.slice(0, orderLinesIndex + 1),
  PIECES_SECTION,
  ...ORDER_TOKEN_SECTIONS.slice(orderLinesIndex + 1),
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
