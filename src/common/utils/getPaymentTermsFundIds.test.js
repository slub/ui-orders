import { getPaymentTermsFundIds } from './getPaymentTermsFundIds';

describe('getPaymentTermsFundIds', () => {
  test('returns empty array when paymentTerms is undefined', () => {
    expect(getPaymentTermsFundIds()).toEqual([]);
  });

  test('returns empty array when fiscalYearDistributions is missing', () => {
    expect(getPaymentTermsFundIds({})).toEqual([]);
  });

  test('flattens fundIds from fiscalYearDistributions', () => {
    const paymentTerms = {
      fiscalYearDistributions: [
        { fundDistributions: [{ fundId: 'f1' }, { fundId: 'f2' }] },
        { fundDistributions: [{ fundId: 'f3' }] },
      ],
    };

    expect(getPaymentTermsFundIds(paymentTerms)).toEqual(['f1', 'f2', 'f3']);
  });
});
