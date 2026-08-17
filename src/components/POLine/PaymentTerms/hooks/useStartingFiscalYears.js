import { useQuery } from 'react-query';

import {
  useNamespace,
  useOkapiKy,
} from '@folio/stripes/core';
import {
  CQLBuilder,
  fetchFiscalYears,
  LIMIT_MAX,
} from '@folio/stripes-acq-components';

const DEFAULT_DATA = [];

const buildFiltersPart = (initialStartingFiscalYear) => {
  const builder = new CQLBuilder().gte('periodEnd', new Date().toISOString());

  return initialStartingFiscalYear
    // Keep the current value available even if it no longer matches the default "active FY" filter.
    ? builder.or().equal('id', initialStartingFiscalYear)
    : builder;
};

export const useStartingFiscalYears = (initialStartingFiscalYear) => {
  const ky = useOkapiKy();
  const [namespace] = useNamespace({ key: 'payment-terms-starting-fiscal-years' });

  const {
    data,
    isFetching,
    isLoading,
  } = useQuery({
    queryKey: [namespace, initialStartingFiscalYear],
    queryFn: ({ signal }) => {
      const query = buildFiltersPart(initialStartingFiscalYear)
        .sortByMultiple([
          { field: 'series', order: 'asc' },
          { field: 'periodStart', order: 'asc' },
        ])
        .build();

      return fetchFiscalYears(ky)({
        searchParams: {
          limit: LIMIT_MAX,
          query,
        },
        signal,
      });
    },
  });

  return {
    fiscalYears: data?.fiscalYears ?? DEFAULT_DATA,
    isFetching,
    isLoading,
  };
};
