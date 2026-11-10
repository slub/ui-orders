import { QueryClient, QueryClientProvider } from 'react-query';

import {
  renderHook,
  waitFor,
} from '@folio/jest-config-stripes/testing-library/react';
import { useOkapiKy } from '@folio/stripes/core';

import { useEffectiveExportConfigs } from './useEffectiveExportConfigs';

const API = 'data-export-spring/effective-configs';

const vendorId = 'vendor-id';
const poLines = [
  { id: 'line-1', acquisitionMethod: 'method-1', vendorDetail: { vendorAccount: 'account-1' } },
  { id: 'line-2', acquisitionMethod: 'method-1', vendorDetail: { vendorAccount: 'account-1' } },
  { id: 'line-3', acquisitionMethod: 'method-2' },
  { id: 'line-4' },
];

const renderTestHook = () => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const wrapper = ({ children }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );

  return renderHook(() => useEffectiveExportConfigs({ vendorId, poLines }), { wrapper });
};

describe('useEffectiveExportConfigs', () => {
  // `config-1` matches every lookup; only the first acquisition method is scheduled.
  const kyMock = {
    get: jest.fn((_url, { searchParams }) => ({
      json: () => Promise.resolve({
        configs: searchParams.scheduled && searchParams.acquisitionMethod !== 'method-1'
          ? []
          : [{ id: 'config-1' }],
      }),
    })),
  };

  beforeEach(() => {
    kyMock.get.mockClear();
    useOkapiKy
      .mockClear()
      .mockReturnValue(kyMock);
  });

  it('should look up each combination of acquisition method and vendor account once', async () => {
    const { result } = renderTestHook();

    await waitFor(() => expect(result.current.isFetching).toBe(false));

    // Two combinations, each with and without the `scheduled` filter.
    expect(kyMock.get).toHaveBeenCalledTimes(4);
    expect(kyMock.get).toHaveBeenCalledWith(API, expect.objectContaining({
      searchParams: {
        vendorId,
        type: 'EDIFACT_ORDERS_EXPORT',
        acquisitionMethod: 'method-1',
        vendorAccount: 'account-1',
      },
    }));
  });

  it('should send an empty vendor account for a line without one', async () => {
    const { result } = renderTestHook();

    await waitFor(() => expect(result.current.isFetching).toBe(false));

    expect(kyMock.get).toHaveBeenCalledWith(API, expect.objectContaining({
      searchParams: expect.objectContaining({ acquisitionMethod: 'method-2', vendorAccount: '' }),
    }));
  });

  it('should return the matching and the scheduled configs per PO line', async () => {
    const { result } = renderTestHook();

    await waitFor(() => expect(result.current.isFetching).toBe(false));

    expect(result.current.configsByLineId).toEqual({
      'line-1': { configs: [{ id: 'config-1' }], scheduledConfigIds: ['config-1'] },
      'line-2': { configs: [{ id: 'config-1' }], scheduledConfigIds: ['config-1'] },
      'line-3': { configs: [{ id: 'config-1' }], scheduledConfigIds: [] },
      'line-4': { configs: [], scheduledConfigIds: [] },
    });
  });

  it('should report a failed lookup', async () => {
    kyMock.get.mockImplementationOnce(() => ({ json: () => Promise.reject(new Error('Forbidden')) }));

    const { result } = renderTestHook();

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.configsByLineId['line-1']).toEqual({ configs: [], scheduledConfigIds: [] });
  });
});
