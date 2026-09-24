import { useQuery } from 'react-query';
import { useLocation } from 'react-router';

import {
  useNamespace,
  useOkapiKy,
  useStripes,
} from '@folio/stripes/core';
import { getFullName } from '@folio/stripes/util';
import {
  getFiltersCount,
  ORDERS_API,
} from '@folio/stripes-acq-components';

import { useBuildQuery } from '../useBuildQuery';
import { getQueryParams } from '../../../utils';

export const useOrders = (
  {
    customFields,
    fetchReferences,
    pagination,
  },
  options = {},
) => {
  const { enabled = true, ...queryOptions } = options;

  const ky = useOkapiKy();
  const [namespace] = useNamespace({ key: 'orders-list' });
  const { timezone } = useStripes();
  const { search } = useLocation();
  const buildQuery = useBuildQuery(customFields);

  const queryParams = getQueryParams(search);
  const query = buildQuery(queryParams, { timezone });
  const filtersCount = getFiltersCount(queryParams);

  const searchParams = {
    query,
    limit: pagination.limit,
    offset: pagination.offset,
  };

  const { isFetching, data = {} } = useQuery(
    [namespace, pagination.timestamp, pagination.limit, pagination.offset],
    async ({ signal }) => {
      if (!filtersCount) {
        return { orders: [], ordersCount: 0 };
      }

      const { purchaseOrders, totalRecords } = await ky.get(ORDERS_API, { searchParams, signal }).json();
      const { usersMap = {}, vendorsMap = {}, acqUnitsMap = {} } = await fetchReferences(purchaseOrders);
      const orders = purchaseOrders.map(order => ({
        ...order,
        vendorCode: vendorsMap[order.vendor]?.code,
        acquisitionsUnit: order.acqUnitIds?.map(unitId => acqUnitsMap[unitId]?.name).filter(Boolean).join(', '),
        assignedTo: getFullName(usersMap[order.assignedTo]),
      }));

      return {
        orders,
        ordersCount: totalRecords,
      };
    },
    {
      enabled: enabled && Boolean(pagination.timestamp),
      keepPreviousData: true,
      ...queryOptions,
    },
  );

  return ({
    ...data,
    isLoading: isFetching,
    query,
  });
};
