import uniq from 'lodash/uniq';

import {
  batchFetch,
  ResponseErrorsContainer,
} from '@folio/stripes-acq-components';

import { ERROR_CODES } from '../common/constants';
import {
  genericErrorStrategy,
  isRequestTooLargeError,
  tooLargeRequestStrategy,
} from '../common/utils/errorHandling';

export const fetchLinesOrders = (mutator, lines, fetchedOrdersMap) => {
  const unfetched = lines
    .filter(({ purchaseOrderId }) => !fetchedOrdersMap[purchaseOrderId])
    .map(({ purchaseOrderId }) => purchaseOrderId)
    .filter(Boolean);

  const fetchPromise = unfetched.length
    ? batchFetch(mutator, uniq(unfetched))
    : Promise.resolve([]);

  return fetchPromise;
};

export const handleOrderLinesListLoadingError = async ({ response }, callout, intl) => {
  const { handler } = await ResponseErrorsContainer.create(response);

  if (isRequestTooLargeError(response)) {
    return handler.handle(tooLargeRequestStrategy({ callout }));
  }

  return handler.handle(genericErrorStrategy({
    callout,
    defaultErrorCode: ERROR_CODES.orderLinesNotLoaded,
    intl,
  }));
};
