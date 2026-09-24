import { QueryClient, QueryClientProvider } from 'react-query';

import { renderHook, waitFor } from '@folio/jest-config-stripes/testing-library/react';
import { useInstanceHoldingsQuery } from '@folio/stripes-acq-components';

import { useFundsById } from '../useFundsById';
import { useIsFundsRestrictedByLocationIds } from './useIsFundsRestrictedByLocationIds';

jest.mock('@folio/stripes-acq-components', () => ({
  ...jest.requireActual('@folio/stripes-acq-components'),
  useCentralOrderingContext: jest.fn(() => ({})),
  useInstanceHoldingsQuery: jest.fn(),
}));
jest.mock('../useFundsById', () => ({
  useFundsById: jest.fn(),
}));

const queryClient = new QueryClient();

const wrapper = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    {children}
  </QueryClientProvider>
);

const restrictedFund = {
  'id': 'e3f68402-5570-4839-a54a-cecd5fd799e5',
  'name': 'Location restricted',
  'restrictByLocations': true,
  'locations': [
    { locationId: '53cf956f-c1df-410b-8bea-27f712cca7c0' },
    { locationId: '184aae84-a5bf-4c6a-85ba-4a7c73026cd5' },
  ],
};

const fundDistribution = [{ fundId: restrictedFund.id, ...restrictedFund }];

const holdingData = {
  'id': '53cf956f-c1df-410b-8bea-27f712cca7c0',
  'permanentLocationId': restrictedFund.locations[0].locationId,
};

describe('useIsFundsRestrictedByLocationIds', () => {
  beforeEach(() => {
    useFundsById
      .mockClear()
      .mockReturnValue({
        funds: [restrictedFund],
        isLoading: false,
      });
    useInstanceHoldingsQuery
      .mockClear()
      .mockReturnValue({
        isLoading: false,
        holdings: [],
      });
  });

  it('should return hasLocationRestrictedFund as true', async () => {
    const line = {
      fundDistribution,
      locations: [{ locationId: 'testId' }],
    };

    const { result } = renderHook(() => useIsFundsRestrictedByLocationIds(line), { wrapper });

    await waitFor(() => expect(result.current.isLoading).toBeFalsy());

    expect(result.current.hasLocationRestrictedFund).toBe(true);
  });

  it('should return hasLocationRestrictedFund as false', async () => {
    const line = {
      fundDistribution,
      locations: restrictedFund.locations.map(({ id, ...rest }) => ({
        locationId: id,
        ...rest,
      })),
    };

    const { result } = renderHook(() => useIsFundsRestrictedByLocationIds(line), { wrapper });

    await waitFor(() => expect(result.current.isLoading).toBeFalsy());

    expect(result.current.hasLocationRestrictedFund).toBe(false);
  });

  it('should return hasLocationRestrictedFund as false with holdingIds', async () => {
    useInstanceHoldingsQuery.mockClear().mockReturnValue({
      isLoading: false,
      holdings: [holdingData],
    });

    const line = {
      fundDistribution,
      locations: [{ holdingId: holdingData.id, ...holdingData }],
    };

    const { result } = renderHook(() => useIsFundsRestrictedByLocationIds(line), { wrapper });

    await waitFor(() => expect(result.current.isLoading).toBeFalsy());

    expect(result.current.hasLocationRestrictedFund).toBe(false);
  });

  it('should return hasLocationRestrictedFund as true with holdingIds', async () => {
    useInstanceHoldingsQuery.mockClear().mockReturnValue({
      isLoading: false,
      holdings: [{ ...holdingData, permanentLocationId: 'wrongId' }],
    });

    const line = {
      fundDistribution,
      locations: [{ holdingId: holdingData.id, ...holdingData }],
    };

    const { result } = renderHook(() => useIsFundsRestrictedByLocationIds(line), { wrapper });

    await waitFor(() => expect(result.current.isLoading).toBeFalsy());

    expect(result.current.hasLocationRestrictedFund).toBe(true);
  });

  it('should include fundIds from paymentTerms', async () => {
    const paymentFundId = 'payment-fund-id';

    const line = {
      fundDistribution,
      paymentTerms: {
        fiscalYearDistributions: [
          { fundDistributions: [{ fundId: paymentFundId }] },
        ],
      },
      locations: [{ locationId: 'testId' }],
    };

    const { result } = renderHook(() => useIsFundsRestrictedByLocationIds(line), { wrapper });

    await waitFor(() => expect(result.current.isLoading).toBeFalsy());

    // first arg to useFundsById is fundIds array — ensure it contains both sources
    expect(useFundsById).toHaveBeenCalled();
    const calledFundIds = useFundsById.mock.calls[0][0];

    expect(calledFundIds).toEqual(expect.arrayContaining([restrictedFund.id, paymentFundId]));
  });
});
