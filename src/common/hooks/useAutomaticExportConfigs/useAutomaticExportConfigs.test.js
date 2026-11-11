import { QueryClient, QueryClientProvider } from 'react-query';

import { renderHook, waitFor } from '@folio/jest-config-stripes/testing-library/react';
import {
  useOkapiKy,
  useStripes,
} from '@folio/stripes/core';

import { useAutomaticExportConfigs } from './useAutomaticExportConfigs';

const configs = [{ id: 'config-id' }];
const criteria = {
  vendorId: 'vendor-id',
  acquisitionMethod: 'acq-method-id',
  vendorAccount: '12345',
};

const kyGet = jest.fn();

const renderUseAutomaticExportConfigs = (...args) => {
  // Like the client of stripes-core, which does not retry failed requests.
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  // eslint-disable-next-line react/prop-types
  const wrapper = ({ children }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );

  return {
    queryClient,
    ...renderHook(() => useAutomaticExportConfigs(...args), { wrapper }),
  };
};

describe('useAutomaticExportConfigs', () => {
  beforeEach(() => {
    kyGet.mockClear().mockReturnValue({ json: () => Promise.resolve({ configs }) });
    useOkapiKy.mockClear().mockReturnValue({ get: kyGet });
  });

  afterEach(() => {
    useStripes().hasPerm.mockReturnValue(true);
  });

  it('should fetch the scheduled ordering integrations that apply to the line', async () => {
    const { result } = renderUseAutomaticExportConfigs(criteria);

    await waitFor(() => expect(result.current.configs).toEqual(configs));

    expect(kyGet).toHaveBeenCalledWith('data-export-spring/effective-configs', expect.objectContaining({
      searchParams: {
        ...criteria,
        type: 'EDIFACT_ORDERS_EXPORT',
        scheduled: true,
      },
    }));
  });

  it('should send an empty vendor account for a line without an account number', async () => {
    const { result } = renderUseAutomaticExportConfigs({ ...criteria, vendorAccount: undefined });

    await waitFor(() => expect(result.current.configs).toEqual(configs));

    expect(kyGet.mock.calls[0][1].searchParams.vendorAccount).toBe('');
  });

  it('should match nothing without an acquisition method', () => {
    const { result } = renderUseAutomaticExportConfigs({ ...criteria, acquisitionMethod: undefined });

    expect(result.current.configs).toEqual([]);
    expect(kyGet).not.toHaveBeenCalled();
  });

  it('should have no answer when the lookup is switched off', () => {
    const { result } = renderUseAutomaticExportConfigs(criteria, { enabled: false });

    expect(result.current.configs).toBeUndefined();
    expect(kyGet).not.toHaveBeenCalled();
  });

  it('should have no answer without a vendor', () => {
    const { result } = renderUseAutomaticExportConfigs({ ...criteria, vendorId: undefined });

    expect(result.current.configs).toBeUndefined();
    expect(kyGet).not.toHaveBeenCalled();
  });

  it('should have no answer without the permission to read the integrations', () => {
    useStripes().hasPerm.mockImplementation((perm) => perm !== 'data-export.effective-configs.collection.get');

    const { result } = renderUseAutomaticExportConfigs(criteria);

    expect(result.current.configs).toBeUndefined();
    expect(kyGet).not.toHaveBeenCalled();
  });

  it('should have no answer when the backend does not provide the endpoint', async () => {
    kyGet.mockReturnValue({ json: () => Promise.reject(new Error('Not Found')) });

    const { queryClient, result } = renderUseAutomaticExportConfigs(criteria);

    await waitFor(() => expect(kyGet).toHaveBeenCalled());
    await waitFor(() => expect(queryClient.isFetching()).toBe(0));

    expect(result.current.configs).toBeUndefined();
  });
});
