import queryString from 'query-string';
import { useQuery } from 'react-query';
import { useLocation } from 'react-router';

import {
  useNamespace,
  useOkapiKy,
  useStripes,
} from '@folio/stripes/core';
import {
  getFiltersCount,
  LINES_API,
  useLocaleDateFormat,
} from '@folio/stripes-acq-components';

import { getLinesQuery } from '@folio/plugin-find-po-line';

export const useOrderLinesList = (
  {
    customFields,
    fetchReferences,
    pagination,
  },
  options = {},
) => {
  const { enabled = true, ...queryOptions } = options;

  const ky = useOkapiKy();
  const [namespace] = useNamespace({ key: 'order-lines-list' });
  const { timezone } = useStripes();

  const { search } = useLocation();
  const localeDateFormat = useLocaleDateFormat();
  const queryParams = queryString.parse(search);
  const buildQuery = getLinesQuery(queryParams, ky, localeDateFormat, customFields);
  const filtersCount = getFiltersCount(queryParams);

  const { isFetching, data = {} } = useQuery(
    [namespace, pagination.timestamp, pagination.limit, pagination.offset],
    async ({ signal }) => {
      const query = await buildQuery({ timezone });

      if (!filtersCount || !query) {
        return { orderLines: [], orderLinesCount: 0, query };
      }

      const searchParams = {
        limit: pagination.limit,
        offset: pagination.offset,
        query,
      };

      const { poLines, totalRecords } = await ky.get(LINES_API, { searchParams, signal }).json();
      const { ordersMap = {}, acqUnitsMap = {} } = await fetchReferences(poLines);
      const orderLines = poLines.map(orderLine => ({
        ...orderLine,
        orderWorkflow: ordersMap[orderLine.purchaseOrderId]?.workflowStatus,
        acqUnit: ordersMap[orderLine.purchaseOrderId]?.acqUnitIds
          ?.map(unitId => acqUnitsMap[unitId]?.name)
          .filter(Boolean)
          .join(', '),
      }));

      return {
        orderLines,
        orderLinesCount: totalRecords,
        query,
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
  });
};
