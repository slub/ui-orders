import { useQuery } from 'react-query';

import {
  useNamespace,
  useOkapiKy,
} from '@folio/stripes/core';

import { fetchPaymentTermsFiscalYears } from '../fetchPaymentTermsFiscalYears';

const DEFAULT_DATA = [];

export const usePaymentTermsFiscalYears = (startingFiscalYearId, options = {}) => {
  const {
    enabled = true,
    ...queryOptions
  } = options;

  const ky = useOkapiKy();
  const [namespace] = useNamespace('payment-terms-distribution-fiscal-years');

  const {
    data,
    isFetching,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: [namespace, startingFiscalYearId],
    queryFn: ({ signal }) => fetchPaymentTermsFiscalYears(ky)(startingFiscalYearId, { signal }),
    // Distribution FYs are only meaningful once a starting FY has been selected.
    enabled: Boolean(enabled && startingFiscalYearId),
    ...queryOptions,
  });

  return {
    fiscalYears: data?.fiscalYears ?? DEFAULT_DATA,
    isFetching,
    isLoading,
    refetch,
  };
};
