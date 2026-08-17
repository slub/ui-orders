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
import { EXPORT_DATE_INDEX } from './constants';

const EXPORTED_QUERY = {
  true: `${EXPORT_DATE_INDEX}=""`,
  false: `(cql.allRecords=1 NOT ${EXPORT_DATE_INDEX}="")`,
};

const SORTING_SEPARATOR = ' sortby ';

/**
 * Both checkboxes (or neither) mean "no restriction", like every other boolean
 * filter in the list.
 */
export const buildExportedQuery = (filterValue) => {
  const values = uniq([].concat(filterValue || []));

  if (values.length !== 1) return undefined;

  return EXPORTED_QUERY[values[0]];
};

/**
 * `connectQuery` puts the sorting last, so the clause has to be spliced in
 * ahead of it rather than appended to the finished query.
 */
export const applyExportedFilter = (query, filterValue) => {
  const clause = buildExportedQuery(filterValue);

  if (!query || !clause) return query;

  const sortingIndex = query.lastIndexOf(SORTING_SEPARATOR);

  if (sortingIndex === -1) return `${query} and ${clause}`;

  return `${query.slice(0, sortingIndex)} and ${clause}${query.slice(sortingIndex)}`;
};

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
