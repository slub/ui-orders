import PropTypes from 'prop-types';
import { useCallback } from 'react';
import { useIntl } from 'react-intl';

import { stripesConnect } from '@folio/stripes/core';
import { useCustomFields } from '@folio/stripes/smart-components';
import {
  acqUnitsManifest,
  CUSTOM_FIELDS_ORDERS_BACKEND_NAME,
  RESULT_COUNT_INCREMENT,
  usePagination,
  useShowCallout,
} from '@folio/stripes-acq-components';

import { ENTITY_TYPE_PO_LINE } from '../common/constants';
import { LIST_IGNORED_QUERY_PARAMS } from '../utils';
import { ORDERS } from '../components/Utils/resources';

import { fetchOrderAcqUnits } from '../OrdersList/utils';
import { useOrderLinesList } from './hooks';
import OrderLinesList from './OrderLinesList';
import {
  fetchLinesOrders,
  handleOrderLinesListLoadingError,
} from './utils';

const resetData = () => { };

const OrderLinesListContainer = ({ mutator }) => {
  const intl = useIntl();
  const sendCallout = useShowCallout();

  const fetchReferences = useCallback(async (poLines) => {
    const lineOrders = await fetchLinesOrders(mutator.lineOrders, poLines, {});
    const acqUnits = await fetchOrderAcqUnits(mutator.orderAcqUnits, lineOrders, {});

    const ordersMap = lineOrders.reduce((acc, d) => {
      acc[d.id] = d;

      return acc;
    }, {});

    const acqUnitsMap = acqUnits.reduce((acc, unit) => {
      acc[unit.id] = unit;

      return acc;
    }, {});

    return { ordersMap, acqUnitsMap };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [customFields, isLoadingCustomFields] = useCustomFields(CUSTOM_FIELDS_ORDERS_BACKEND_NAME, ENTITY_TYPE_PO_LINE);
  const { pagination, changePage, refreshPage } = usePagination(
    { limit: RESULT_COUNT_INCREMENT, offset: 0 },
    { ignoredSearchParams: LIST_IGNORED_QUERY_PARAMS },
  );

  const {
    isLoading,
    orderLines,
    orderLinesCount,
    query,
  } = useOrderLinesList(
    {
      customFields,
      fetchReferences,
      pagination,
    },
    { onError: (error) => handleOrderLinesListLoadingError(error, { sendCallout }, intl) },
  );

  return (
    <OrderLinesList
      isLoading={isLoading || isLoadingCustomFields}
      orderLines={orderLines}
      orderLinesCount={orderLinesCount}
      pagination={pagination}
      onNeedMoreData={changePage}
      refreshList={refreshPage}
      resetData={resetData}
      linesQuery={query}
      customFields={customFields}
    />
  );
};

OrderLinesListContainer.manifest = Object.freeze({
  lineOrders: {
    ...ORDERS,
    fetch: false,
    accumulate: true,
  },
  orderAcqUnits: {
    ...acqUnitsManifest,
    fetch: false,
    accumulate: true,
  },
});

OrderLinesListContainer.propTypes = {
  mutator: PropTypes.object.isRequired,
};

export default stripesConnect(OrderLinesListContainer);
