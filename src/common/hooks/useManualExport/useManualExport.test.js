import { QueryClient, QueryClientProvider } from 'react-query';

import { renderHook } from '@folio/jest-config-stripes/testing-library/react';
import { useOkapiKy } from '@folio/stripes/core';

import { useManualExport } from './useManualExport';

const queryClient = new QueryClient();
const wrapper = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    {children}
  </QueryClientProvider>
);

const exportEntries = [
  { integrationConfigId: 'config-1', poLineIds: ['line-1', 'line-2'] },
  { integrationConfigId: 'config-2', poLineIds: ['line-3'] },
];

describe('useManualExport', () => {
  const kyMock = {
    post: jest.fn(() => ({
      json: () => Promise.resolve({ jobId: 'job-1' }),
    })),
  };

  beforeEach(() => {
    kyMock.post.mockClear();
    useOkapiKy
      .mockClear()
      .mockReturnValue(kyMock);
  });

  it('should send one request per export configuration', async () => {
    const { result } = renderHook(() => useManualExport(), { wrapper });

    await result.current.manualExport(exportEntries);

    expect(kyMock.post).toHaveBeenCalledTimes(exportEntries.length);
    expect(kyMock.post).toHaveBeenCalledWith(
      'data-export-spring/configs/config-1/execute',
      { json: { poLineIds: ['line-1', 'line-2'] } },
    );
  });

  it('should return the job id per export configuration', async () => {
    const { result } = renderHook(() => useManualExport(), { wrapper });

    const results = await result.current.manualExport(exportEntries);

    expect(results).toEqual([
      expect.objectContaining({ integrationConfigId: 'config-1', isSuccess: true, jobId: 'job-1' }),
      expect.objectContaining({ integrationConfigId: 'config-2', isSuccess: true, jobId: 'job-1' }),
    ]);
  });

  it('should keep remaining configurations when one of them fails', async () => {
    const error = new Error('Conflict');

    kyMock.post
      .mockImplementationOnce(() => ({ json: () => Promise.reject(error) }))
      .mockImplementationOnce(() => ({ json: () => Promise.resolve({ jobId: 'job-2' }) }));

    const { result } = renderHook(() => useManualExport(), { wrapper });

    const results = await result.current.manualExport(exportEntries);

    expect(kyMock.post).toHaveBeenCalledTimes(exportEntries.length);
    expect(results[0]).toEqual(expect.objectContaining({
      integrationConfigId: 'config-1',
      isSuccess: false,
      error,
    }));
    expect(results[1]).toEqual(expect.objectContaining({
      integrationConfigId: 'config-2',
      isSuccess: true,
      jobId: 'job-2',
    }));
  });
});
