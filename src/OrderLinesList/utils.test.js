import { ResponseErrorsContainer } from '@folio/stripes-acq-components';

import { ERROR_CODES } from '../common/constants';
import {
  applyExportedFilter,
  buildExportedQuery,
  fetchLinesOrders,
  handleOrderLinesListLoadingError,
} from './utils';

jest.mock('@folio/stripes-acq-components', () => ({
  ...jest.requireActual('@folio/stripes-acq-components'),
  ResponseErrorsContainer: {
    create: jest.fn(),
  },
}));

const lines = [
  {
    id: 'lineId1',
    purchaseOrderId: 'orderId1',
  },
  {
    id: 'lineId2',
    purchaseOrderId: 'orderId2',
  },
  {
    id: 'lineId3',
    purchaseOrderId: 'orderId2',
  },
];

describe('OrderLinesList utils', () => {
  describe('fetchLinesOrders', () => {
    const mutator = {
      GET: jest.fn(() => Promise.resolve([])),
    };

    beforeEach(() => {
      mutator.GET.mockClear();
    });

    it('should fetch unfetched orders', async () => {
      await fetchLinesOrders(mutator, lines, {});

      expect(mutator.GET).toHaveBeenCalled();
    });

    it('should not fetch already fetched orders', async () => {
      const fetchedOrdersMap = {
        orderId1: { id: 'orderId1' },
        orderId2: { id: 'orderId2' },
      };

      await fetchLinesOrders(mutator, lines, fetchedOrdersMap);

      expect(mutator.GET).not.toHaveBeenCalled();
    });

    it('should filter out duplicate order ids', async () => {
      await fetchLinesOrders(mutator, lines, {});

      expect(mutator.GET).toHaveBeenCalledTimes(1);
    });

    it('should handle lines without purchaseOrderId', async () => {
      const linesWithoutOrderId = [{ id: 'lineId1' }];

      await fetchLinesOrders(mutator, linesWithoutOrderId, {});

      expect(mutator.GET).not.toHaveBeenCalled();
    });

    it('should return resolved promise when all orders are already fetched', async () => {
      const fetchedOrdersMap = {
        orderId1: { id: 'orderId1' },
        orderId2: { id: 'orderId2' },
      };

      const result = await fetchLinesOrders(mutator, lines, fetchedOrdersMap);

      expect(result).toEqual([]);
    });
  });

  describe('handleOrderLinesListLoadingError', () => {
    const callout = {
      sendCallout: jest.fn(),
    };
    const intl = {
      formatMessage: jest.fn((msg) => msg.id),
    };

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should handle request too large error (414)', async () => {
      const error = { response: { status: 414 } };
      const handler = {
        handle: jest.fn(),
      };

      ResponseErrorsContainer.create.mockResolvedValue({ handler });

      await handleOrderLinesListLoadingError(error, callout, intl);

      expect(ResponseErrorsContainer.create).toHaveBeenCalledWith(error.response);
      expect(handler.handle).toHaveBeenCalledWith(
        expect.objectContaining({
          handle: expect.any(Function),
        }),
      );
    });

    it('should handle request too large error (431)', async () => {
      const error = { response: { status: 431 } };
      const handler = {
        handle: jest.fn(),
      };

      ResponseErrorsContainer.create.mockResolvedValue({ handler });

      await handleOrderLinesListLoadingError(error, callout, intl);

      expect(ResponseErrorsContainer.create).toHaveBeenCalledWith(error.response);
      expect(handler.handle).toHaveBeenCalledWith(
        expect.objectContaining({
          handle: expect.any(Function),
        }),
      );
    });

    it('should handle generic errors with default error code', async () => {
      const error = { response: { status: 500 } };
      const handler = {
        handle: jest.fn(),
      };

      ResponseErrorsContainer.create.mockResolvedValue({ handler });

      await handleOrderLinesListLoadingError(error, callout, intl);

      expect(ResponseErrorsContainer.create).toHaveBeenCalledWith(error.response);
      expect(handler.handle).toHaveBeenCalledWith(
        expect.objectContaining({
          handle: expect.any(Function),
        }),
      );
    });

    it('should use orderLinesNotLoaded as default error code', async () => {
      const error = { response: { status: 500 } };
      const handler = {
        handle: jest.fn((strategy) => {
          // Call the strategy to verify the error code
          const errorsContainer = {
            getError: () => ({ code: 'genericError' }),
          };

          strategy.handle(errorsContainer);
        }),
      };

      ResponseErrorsContainer.create.mockResolvedValue({ handler });

      await handleOrderLinesListLoadingError(error, callout, intl);

      expect(intl.formatMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          id: expect.stringContaining(ERROR_CODES.orderLinesNotLoaded),
        }),
      );
    });
  });
});

describe('buildExportedQuery', () => {
  it('should match lines that carry an export date', () => {
    expect(buildExportedQuery('true')).toBe('lastEDIExportDate=""');
  });

  it('should match lines without an export date', () => {
    expect(buildExportedQuery('false')).toBe('(cql.allRecords=1 NOT lastEDIExportDate="")');
  });

  it.each([
    ['no selection', undefined],
    ['both options selected', ['true', 'false']],
  ])('should not restrict the query for %s', (_, filterValue) => {
    expect(buildExportedQuery(filterValue)).toBeUndefined();
  });
});

describe('applyExportedFilter', () => {
  const query = '(cql.allRecords=1) sortby metadata.updatedDate/sort.descending';

  it('should splice the clause in ahead of the sorting', () => {
    expect(applyExportedFilter(query, 'true')).toBe(
      '(cql.allRecords=1) and lastEDIExportDate="" sortby metadata.updatedDate/sort.descending',
    );
  });

  it('should append the clause when the query is not sorted', () => {
    expect(applyExportedFilter('(cql.allRecords=1)', 'true')).toBe(
      '(cql.allRecords=1) and lastEDIExportDate=""',
    );
  });

  it('should leave the query untouched when the filter is not set', () => {
    expect(applyExportedFilter(query, undefined)).toBe(query);
  });

  it('should not build a query when the plugin did not build one', () => {
    expect(applyExportedFilter(undefined, 'true')).toBeUndefined();
  });
});
