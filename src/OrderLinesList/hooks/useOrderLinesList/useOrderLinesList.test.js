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
import { FILTERS } from '@folio/plugin-find-po-line/FindPOLine/constants';
import {
  useOkapiKy,
  useStripes,
} from '@folio/stripes/core';
import {
  ALL_RECORDS_CQL,
  CUSTOM_FIELDS_FILTER,
  CUSTOM_FIELDS_TYPES,
  RECEIPT_STATUS,
} from '@folio/stripes-acq-components';
import { NO_DST_TIMEZONES } from '@folio/stripes-acq-components/test/jest/fixtures';

import { orderLine } from 'fixtures';
import { useOrderLinesList } from './useOrderLinesList';

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

const orderLines = [orderLine];

const queryClient = new QueryClient();
const wrapper = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    {children}
  </QueryClientProvider>
);

const renderTestHook = (...args) => renderHook(() => useOrderLinesList(...args), { wrapper });
const waitForLoading = (result) => waitFor(() => expect(result.current.isLoading).toBeFalsy());

describe('useOrderLinesList', () => {
  const getMock = jest.fn(() => ({
    json: () => ({
      poLines: orderLines,
      totalRecords: orderLines.length,
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

    await waitForLoading(result);

    expect(result.current).toEqual({
      orderLines: [],
      orderLinesCount: 0,
      isLoading: false,
      query: `(${ALL_RECORDS_CQL}) sortby metadata.updatedDate/sort.descending`,
    });
  });

  it('should call fetchReferences to load lines related data', async () => {
    useLocation.mockReturnValue({
      search: queryString.stringify({
        [FILTERS.RECEIPT_STATUS]: [RECEIPT_STATUS.pending],
      }),
    });

    const fetchReferences = jest.fn().mockReturnValue(Promise.resolve({}));

    const { result } = renderTestHook({
      pagination: { limit: 5, offset: 0, timestamp: 42 },
      fetchReferences,
    });

    await waitForLoading(result);

    expect(fetchReferences).toHaveBeenCalled();
  });

  it('should return fetched hydrated orders list', async () => {
    useLocation.mockReturnValue({
      search: queryString.stringify({
        [FILTERS.RECEIPT_STATUS]: [RECEIPT_STATUS.pending],
      }),
    });

    const fetchReferences = jest.fn().mockReturnValue(Promise.resolve({
      ordersMap: { [orderLine.purchaseOrderId]: { workflowStatus: 'Open' } },
    }));
    const { result } = renderTestHook({
      pagination: { limit: 5, offset: 0, timestamp: 42 },
      fetchReferences,
    });

    await waitForLoading(result);

    expect(result.current).toEqual({
      orderLines: [{ ...orderLine, orderWorkflow: 'Open' }],
      orderLinesCount: 1,
      isLoading: false,
      query: `(${FILTERS.RECEIPT_STATUS}=="${RECEIPT_STATUS.pending}") sortby metadata.updatedDate/sort.descending`,
    });
  });

  it('should not include the connected Tasks and Jobs pane layer in the CQL query', async () => {
    useLocation.mockReturnValue({
      search: queryString.stringify({
        layer: 'connected-tasks-jobs',
        [FILTERS.RECEIPT_STATUS]: [RECEIPT_STATUS.pending],
      }),
    });

    const fetchReferences = jest.fn().mockReturnValue(Promise.resolve({}));
    const { result } = renderTestHook({
      fetchReferences,
      pagination: { limit: 5, offset: 0, timestamp: 43 },
    });

    await waitForLoading(result);

    expect(getMock.mock.calls[0][1].searchParams.query).toBe(
      `(${FILTERS.RECEIPT_STATUS}=="${RECEIPT_STATUS.pending}") sortby metadata.updatedDate/sort.descending`,
    );
  });

  describe('Datetime filters', () => {
    const dateTimeConfig = {
      from: '2025-01-01',
      to: '2025-12-31',
    };

    const expectedResultsDict = {
      [NO_DST_TIMEZONES.AFRICA_DAKAR]: {
        start: '2025-01-01T00:00:00.000',
        end: '2025-12-31T23:59:59.999',
      },
      [NO_DST_TIMEZONES.AMERICA_BOGOTA]: {
        start: '2025-01-01T05:00:00.000',
        end: '2026-01-01T04:59:59.999',
      },
      [NO_DST_TIMEZONES.ASIA_DUBAI]: {
        start: '2024-12-31T20:00:00.000',
        end: '2025-12-31T19:59:59.999',
      },
      [NO_DST_TIMEZONES.ASIA_SHANGHAI]: {
        start: '2024-12-31T16:00:00.000',
        end: '2025-12-31T15:59:59.999',
      },
      [NO_DST_TIMEZONES.ASIA_TOKIO]: {
        start: '2024-12-31T15:00:00.000',
        end: '2025-12-31T14:59:59.999',
      },
      [NO_DST_TIMEZONES.EUROPE_MOSCOW]: {
        start: '2024-12-31T21:00:00.000',
        end: '2025-12-31T20:59:59.999',
      },
      [NO_DST_TIMEZONES.PACIFIC_TAHITI]: {
        start: '2025-01-01T10:00:00.000',
        end: '2026-01-01T09:59:59.999',
      },
      [NO_DST_TIMEZONES.UTC]: {
        start: '2025-01-01T00:00:00.000',
        end: '2025-12-31T23:59:59.999',
      },
    };

    const datetimeFilters = [
      FILTERS.DATE_CREATED,
      FILTERS.DATE_UPDATED,
    ];

    const dateFiltersMap = {
      [FILTERS.EXPORT_DATE]: FILTERS.EXPORT_DATE,
      [FILTERS.EXPECTED_ACTIVATION_DATE]: `eresource.${FILTERS.EXPECTED_ACTIVATION_DATE}`,
      [FILTERS.SUBSCRIPTION_FROM]: `details.${FILTERS.SUBSCRIPTION_FROM}`,
      [FILTERS.SUBSCRIPTION_TO]: `details.${FILTERS.SUBSCRIPTION_TO}`,
      [FILTERS.ACTUAL_RECEIPT_DATE]: FILTERS.ACTUAL_RECEIPT_DATE,
      [FILTERS.EXPECTED_RECEIPT_DATE]: `physical.${FILTERS.EXPECTED_RECEIPT_DATE}`,
      [FILTERS.RECEIPT_DUE]: `physical.${FILTERS.RECEIPT_DUE}`,
      [FILTERS.CLAIM_SENT]: FILTERS.CLAIM_SENT,
    };

    describe.each(Object.values(datetimeFilters))('Datetime range filter: %s', (filter) => {
      it.each(Object.keys(expectedResultsDict))('should properly apply filter for the timezone - %s', async (timezone) => {
        const search = queryString.stringify({
          [filter]: [dateTimeConfig.from, dateTimeConfig.to].join(':'),
        });

        useLocation.mockReturnValue({ search });
        useStripes.mockReturnValue({ timezone });

        const { start, end } = expectedResultsDict[timezone];
        const fetchReferences = jest.fn().mockReturnValue(Promise.resolve({}));

        const { result } = renderTestHook({
          fetchReferences,
          pagination: { limit: 5, offset: 0, timestamp: 42 },
        });

        await waitForLoading(result);

        expect(getMock.mock.calls[0][1].searchParams.query).toContain(`(${filter}>="${start}" and ${filter}<="${end}")`);
      });
    });

    describe.each(Object.keys(dateFiltersMap))('Date range filter: %s', (filter) => {
      it.each(Object.keys(expectedResultsDict))('should properly apply filter for the timezone - %s', async (timezone) => {
        const search = queryString.stringify({
          [filter]: [dateTimeConfig.from, dateTimeConfig.to].join(':'),
        });
        const fetchReferences = jest.fn().mockReturnValue(Promise.resolve({}));

        useLocation.mockReturnValue({ search });
        useStripes.mockReturnValue({ timezone });

        const { result } = renderTestHook({
          fetchReferences,
          pagination: { limit: 5, offset: 0, timestamp: 42 },
        });

        await waitForLoading(result);

        expect(getMock.mock.calls[0][1].searchParams.query).toContain(`(${dateFiltersMap[filter]}>="${dateTimeConfig.from}T00:00:00.000" and ${dateFiltersMap[filter]}<="${dateTimeConfig.to}T23:59:59.999")`);
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

        const { result } = renderTestHook({
          customFields,
          fetchReferences,
          pagination: { limit: 5, offset: 0, timestamp: 42 },
        });

        await waitForLoading(result);

        expect(getMock.mock.calls[0][1].searchParams.query).toContain(`(${filter}>="${dateTimeConfig.from}T00:00:00.000" and ${filter}<="${dateTimeConfig.to}T23:59:59.999")`);
      });
    });
  });
});
