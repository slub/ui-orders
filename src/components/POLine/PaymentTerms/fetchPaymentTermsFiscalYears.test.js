import {
  CQLBuilder,
  fetchFiscalYearById,
  fetchFiscalYears,
  LIMIT_MAX,
} from '@folio/stripes-acq-components';

import { fetchPaymentTermsFiscalYears } from './fetchPaymentTermsFiscalYears';

jest.mock('@folio/stripes-acq-components', () => {
  const chain = {
    equal: jest.fn().mockReturnThis(),
    gte: jest.fn().mockReturnThis(),
    sortBy: jest.fn().mockReturnThis(),
    build: jest.fn(() => 'built-query'),
  };

  return {
    CQLBuilder: jest.fn(() => chain),
    fetchFiscalYearById: jest.fn(),
    fetchFiscalYears: jest.fn(),
    LIMIT_MAX: 2000,
  };
});

describe('fetchPaymentTermsFiscalYears', () => {
  const ky = { extend: jest.fn() };
  const signal = { aborted: false };

  beforeEach(() => {
    fetchFiscalYearById.mockReturnValue(jest.fn(() => Promise.resolve({
      series: 'series-1',
      periodStart: '2026-01-01T00:00:00.000+00:00',
    })));
    fetchFiscalYears.mockReturnValue(jest.fn(() => Promise.resolve({ fiscalYears: [] })));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch fiscal years for the starting fiscal year series from its period start', async () => {
    await fetchPaymentTermsFiscalYears(ky)('fy-1', { signal });

    expect(fetchFiscalYearById(ky)).toHaveBeenCalledWith('fy-1', { signal });
    expect(CQLBuilder).toHaveBeenCalled();
    expect(fetchFiscalYears(ky)).toHaveBeenCalledWith({
      searchParams: {
        limit: LIMIT_MAX,
        query: 'built-query',
      },
      signal,
    });
  });
});
