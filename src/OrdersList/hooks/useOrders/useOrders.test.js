import queryString from 'query-string';
import {
  QueryClient,
  QueryClientProvider,
} from 'react-query';
import { useLocation } from 'react-router';

import {
  renderHook,
  waitFor,
} from '@folio/jest-config-stripes/testing-library/react';
import {
  useOkapiKy,
  useStripes,
} from '@folio/stripes/core';
import {
  CUSTOM_FIELDS_FILTER,
  CUSTOM_FIELDS_TYPES,
} from '@folio/stripes-acq-components';
import { NO_DST_TIMEZONES } from '@folio/stripes-acq-components/test/jest/fixtures';

import { order } from 'fixtures';
import { FILTERS } from '../../constants';
import { useOrders } from './useOrders';

jest.mock('react-router', () => ({
  ...jest.requireActual('react-router'),
  useLocation: jest.fn(),
}));
jest.mock('@folio/stripes/core', () => ({
  ...jest.requireActual('@folio/stripes/core'),
  useNamespace: () => ['namespace'],
  useOkapiKy: jest.fn(),
  useStripes: jest.fn(),
}));

const orders = [order];

const queryClient = new QueryClient();
const wrapper = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    {children}
  </QueryClientProvider>
);

const renderTestHook = (...args) => renderHook(() => useOrders(...args), { wrapper });

describe('useOrders', () => {
  const getMock = jest.fn(() => ({
    json: () => ({
      purchaseOrders: orders,
      totalRecords: orders.length,
    }),
  }));

  beforeEach(() => {
    useLocation.mockReturnValue({ search: '' });
    useOkapiKy.mockReturnValue({ get: getMock });
    useStripes.mockReturnValue({ timezone: NO_DST_TIMEZONES.UTC });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return an empty list if there no filters were passed in the query', async () => {
    useLocation.mockReturnValue({ search: '' });

    const { result } = renderTestHook({
      pagination: { limit: 5, offset: 0, timestamp: 42 },
    });

    await waitFor(() => expect(result.current.isLoading).toBeFalsy());

    expect(result.current).toEqual({
      orders: [],
      ordersCount: 0,
      isLoading: false,
      query: '(cql.allRecords=1) sortby metadata.updatedDate/sort.descending',
    });
  });

  it('should call fetchReferences to load order related data', async () => {
    useLocation.mockReturnValue({
      search: queryString.stringify({ [FILTERS.STATUS]: ['Open', 'Pending'] }),
    });

    const fetchReferences = jest.fn().mockReturnValue(Promise.resolve({}));

    const { result } = renderTestHook({
      pagination: { limit: 5, offset: 0, timestamp: 42 },
      fetchReferences,
    });

    await waitFor(() => expect(result.current.isLoading).toBeFalsy());

    expect(fetchReferences).toHaveBeenCalled();
  });

  it('should return fetched hydreated orders list', async () => {
    useLocation.mockReturnValue({
      search: queryString.stringify({ [FILTERS.STATUS]: ['Open', 'Pending'] }),
    });

    const fetchReferences = jest.fn().mockReturnValue(Promise.resolve({
      vendorsMap: { [order.vendor]: { code: 'vendorCode' } },
      usersMap: { [order.assignedTo]: { personal: { lastName: 'testUser' } } },
      acqUnitsMap: { [order.acqUnitIds[0]]: { name: 'Main' } },
    }));

    const { result } = renderTestHook({
      pagination: { limit: 5, offset: 0, timestamp: 42 },
      fetchReferences,
    });

    await waitFor(() => expect(result.current.isLoading).toBeFalsy());

    expect(result.current).toEqual({
      orders: [{ ...order, vendorCode: 'vendorCode', acquisitionsUnit: 'Main', assignedTo: 'testUser  ' }],
      ordersCount: 1,
      isLoading: false,
      query: '(workflowStatus==("Open" or "Pending")) sortby metadata.updatedDate/sort.descending',
    });
  });

  it('should not include the connected Tasks and Jobs pane layer in the CQL query', async () => {
    useLocation.mockReturnValue({
      search: queryString.stringify({
        layer: 'connected-tasks-jobs',
        [FILTERS.STATUS]: ['Open', 'Pending'],
      }),
    });

    const fetchReferences = jest.fn().mockReturnValue(Promise.resolve({}));
    const { result } = renderTestHook({
      fetchReferences,
      pagination: { limit: 5, offset: 0, timestamp: 43 },
    });

    await waitFor(() => expect(result.current.isLoading).toBeFalsy());

    expect(getMock.mock.calls[0][1].searchParams.query).toBe(
      '(workflowStatus==("Open" or "Pending")) sortby metadata.updatedDate/sort.descending',
    );
  });

  describe('Datetime filters', () => {
    const dateTimeConfig = {
      from: '2000-01-01',
      to: '2009-12-31',
    };

    const expectedResultsDict = {
      [NO_DST_TIMEZONES.AFRICA_DAKAR]: {
        start: '2000-01-01T00:00:00.000',
        end: '2009-12-31T23:59:59.999',
      },
      [NO_DST_TIMEZONES.AMERICA_BOGOTA]: {
        start: '2000-01-01T05:00:00.000',
        end: '2010-01-01T04:59:59.999',
      },
      [NO_DST_TIMEZONES.ASIA_DUBAI]: {
        start: '1999-12-31T20:00:00.000',
        end: '2009-12-31T19:59:59.999',
      },
      [NO_DST_TIMEZONES.ASIA_SHANGHAI]: {
        start: '1999-12-31T16:00:00.000',
        end: '2009-12-31T15:59:59.999',
      },
      [NO_DST_TIMEZONES.ASIA_TOKIO]: {
        start: '1999-12-31T15:00:00.000',
        end: '2009-12-31T14:59:59.999',
      },
      [NO_DST_TIMEZONES.EUROPE_MOSCOW]: {
        start: '1999-12-31T21:00:00.000',
        end: '2009-12-31T20:59:59.999',
      },
      [NO_DST_TIMEZONES.PACIFIC_TAHITI]: {
        start: '2000-01-01T10:00:00.000',
        end: '2010-01-01T09:59:59.999',
      },
      [NO_DST_TIMEZONES.UTC]: {
        start: '2000-01-01T00:00:00.000',
        end: '2009-12-31T23:59:59.999',
      },
    };

    const datetimeFilters = [
      FILTERS.DATE_CREATED,
      FILTERS.DATE_ORDERED,
      FILTERS.DATE_UPDATED,
    ];

    const dateFilters = [
      FILTERS.RENEWAL_DATE,
    ];

    describe.each(Object.values(datetimeFilters))('Datetime range filter: %s', (filter) => {
      it.each(Object.keys(expectedResultsDict))('should properly apply filter for the timezone - %s', async (timezone) => {
        const search = queryString.stringify({
          [filter]: [dateTimeConfig.from, dateTimeConfig.to].join(':'),
        });

        useLocation.mockReturnValue({ search });
        useStripes.mockReturnValue({ timezone });

        const { start, end } = expectedResultsDict[timezone];

        renderTestHook({ pagination: { limit: 5, offset: 0, timestamp: 42 } });

        expect(getMock.mock.calls[0][1].searchParams.query).toContain(`(${filter}>="${start}" and ${filter}<="${end}")`);
      });
    });

    describe.each(Object.values(dateFilters))('Date range filter: %s', (filter) => {
      it.each(Object.keys(expectedResultsDict))('should properly apply filter for the timezone - %s', async (timezone) => {
        const search = queryString.stringify({
          [filter]: [dateTimeConfig.from, dateTimeConfig.to].join(':'),
        });

        useLocation.mockReturnValue({ search });
        useStripes.mockReturnValue({ timezone });

        renderTestHook({ pagination: { limit: 5, offset: 0, timestamp: 42 } });

        expect(getMock.mock.calls[0][1].searchParams.query).toContain(`(${filter}>="${dateTimeConfig.from}T00:00:00.000" and ${filter}<="${dateTimeConfig.to}T23:59:59.999")`);
      });
    });

    describe('Date range filters: Custom fields', () => {
      it.each(Object.keys(expectedResultsDict))('should properly apply filter for the timezone - %s', async (timezone) => {
        const customFields = [{
          refId: 'foo',
          type: CUSTOM_FIELDS_TYPES.DATE_PICKER,
        }];
        const filter = `${CUSTOM_FIELDS_FILTER}.${customFields[0].refId}`;
        const search = queryString.stringify({
          [filter]: [dateTimeConfig.from, dateTimeConfig.to].join(':'),
        });

        useLocation.mockReturnValue({ search });
        useStripes.mockReturnValue({ timezone });

        const fetchReferences = jest.fn().mockReturnValue(Promise.resolve({}));

        renderTestHook({
          customFields,
          fetchReferences,
          pagination: { limit: 5, offset: 0, timestamp: 42 },
        });

        expect(getMock.mock.calls[0][1].searchParams.query).toContain(`(${filter}>="${dateTimeConfig.from}T00:00:00.000" and ${filter}<="${dateTimeConfig.to}T23:59:59.999")`);
      });
    });
  });
});
