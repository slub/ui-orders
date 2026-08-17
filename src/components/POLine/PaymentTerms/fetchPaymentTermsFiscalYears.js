import {
  CQLBuilder,
  fetchFiscalYearById,
  fetchFiscalYears,
  LIMIT_MAX,
} from '@folio/stripes-acq-components';

export const fetchPaymentTermsFiscalYears = (ky) => (startingFiscalYearId, { signal } = {}) => {
  return fetchFiscalYearById(ky)(startingFiscalYearId, { signal })
    .then((fiscalYear) => {
      // Payment terms can only span fiscal years from the same series, starting with the
      // selected FY and continuing forward in chronological order.
      const query = new CQLBuilder()
        .equal('series', fiscalYear.series)
        .gte('periodStart', fiscalYear.periodStart)
        .sortBy('periodStart')
        .build();

      return fetchFiscalYears(ky)({
        searchParams: {
          limit: LIMIT_MAX,
          query,
        },
        signal,
      });
    });
};
