import { tokensReducer } from '@folio/stripes-template-editor';

import {
  CLAIM_EMAIL_TEMPLATES_CONFIG,
  CLAIM_EMAIL_TOKENS,
  CLAIM_TOKEN_SECTIONS,
  CLAIM_TOKEN_SECTIONS_LIST,
} from './constants';
import { CLAIM_SAMPLE_PREVIEW_CONTEXT } from './samplePreviewContext';

describe('CLAIM_EMAIL_TOKENS', () => {
  it('should define every token section', () => {
    expect(Object.keys(CLAIM_EMAIL_TOKENS).sort()).toEqual(Object.values(CLAIM_TOKEN_SECTIONS).sort());
    expect(CLAIM_TOKEN_SECTIONS_LIST.map(({ key }) => key).sort()).toEqual(Object.values(CLAIM_TOKEN_SECTIONS).sort());
  });

  it('should resolve every token against the sample preview context', () => {
    Object.values(CLAIM_EMAIL_TOKENS).flat().forEach(({ token, previewValue }) => {
      expect(typeof previewValue).toBe('string');
      expect(previewValue).not.toBe('');
      expect(previewValue).not.toBe('undefined');
      expect(token).not.toBe('');
    });
  });

  it('should take the preview values from the sample preview context', () => {
    const previewFormat = tokensReducer(CLAIM_EMAIL_TOKENS);
    const [firstPiece] = CLAIM_SAMPLE_PREVIEW_CONTEXT.pieces;

    expect(previewFormat['organization.name']).toBe(CLAIM_SAMPLE_PREVIEW_CONTEXT.organization.name);
    expect(previewFormat['piece.claimStage']).toBe(String(firstPiece.piece.claimStage));
    expect(previewFormat['orderLine.poLineNumber']).toBe(firstPiece.orderLine.poLineNumber);
    expect(previewFormat['order.poNumber']).toBe(firstPiece.order.poNumber);
    expect(previewFormat.refNumber).toBe(firstPiece.orderLine.vendorDetail.referenceNumbers[0].refNumber);
  });

  it('should separate the claim templates from the order templates by scope', () => {
    expect(CLAIM_EMAIL_TEMPLATES_CONFIG.scope).toBe('claims-email');
    expect(CLAIM_EMAIL_TEMPLATES_CONFIG.previewContext).toBe(CLAIM_SAMPLE_PREVIEW_CONTEXT);
  });
});
