import { useQuery } from 'react-query';

import { useOkapiKy } from '@folio/stripes/core';
import { fetchOrders } from '@folio/stripes-acq-components';

import { fetchOrderById } from '../../utils';

// tries to fetch order by get, if error comes from back-end - fetch from collection api
export const useOrder = (orderId, options = {}) => {
  const {
    enabled = true,
    fiscalYearId,
    tenantId,
    ...queryOptions
  } = options;

  const ky = useOkapiKy({ tenant: tenantId });

  const { data, ...rest } = useQuery({
    queryKey: ['ui-orders', 'order', orderId, fiscalYearId, tenantId],
    queryFn: async ({ signal }) => {
      try {
        const searchParams = fiscalYearId ? { fiscalYearId } : undefined;

        return fetchOrderById(ky)(orderId, { searchParams, signal });
      } catch {
        const searchParams = {
          query: `id==${orderId}`,
          ...(fiscalYearId ? { fiscalYearId } : {}),
        };

        const { purchaseOrders } = await fetchOrders(ky)({ searchParams, signal });

        return purchaseOrders[0] || {};
      }
    },
    enabled: enabled && Boolean(orderId),
    ...queryOptions,
  });

  return ({
    order: data,
    ...rest,
  });
};
