import { tokensReducer } from '@folio/stripes-template-editor';

import {
  ORDER_EMAIL_TOKENS,
  TOKEN_SECTIONS,
} from './constants';
import { SAMPLE_PREVIEW_CONTEXT } from './samplePreviewContext';

describe('ORDER_EMAIL_TOKENS', () => {
  it('should define every token section', () => {
    expect(Object.keys(ORDER_EMAIL_TOKENS).sort()).toEqual(Object.values(TOKEN_SECTIONS).sort());
  });

  it('should resolve every token against the sample preview context', () => {
    Object.values(ORDER_EMAIL_TOKENS).flat().forEach(({ token, previewValue }) => {
      expect(typeof previewValue).toBe('string');
      expect(previewValue).not.toBe('');
      expect(previewValue).not.toBe('undefined');
      expect(token).not.toBe('');
    });
  });

  it('should take the preview values from the sample preview context', () => {
    const previewFormat = tokensReducer(ORDER_EMAIL_TOKENS);
    const [firstOrder] = SAMPLE_PREVIEW_CONTEXT.orders;
    const [firstOrderLine] = firstOrder.orderLines;

    expect(previewFormat['organization.name']).toBe(SAMPLE_PREVIEW_CONTEXT.organization.name);
    expect(previewFormat['order.poNumber']).toBe(firstOrder.order.poNumber);
    expect(previewFormat['orderLine.poLineNumber']).toBe(firstOrderLine.orderLine.poLineNumber);
    expect(previewFormat['orderLine.rush']).toBe(String(firstOrderLine.orderLine.rush));
    expect(previewFormat.contributor).toBe(firstOrderLine.orderLine.contributors[0].contributor);
    expect(previewFormat.productId).toBe(firstOrderLine.orderLine.details.productIds[0].productId);
    expect(previewFormat.code).toBe(firstOrderLine.orderLine.fundDistribution[0].code);
  });
});
