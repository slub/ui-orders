import {
  Form,
  useForm,
} from 'react-final-form';
import { QueryClient, QueryClientProvider } from 'react-query';

import { act, renderHook } from '@folio/jest-config-stripes/testing-library/react';
import { useOkapiKy } from '@folio/stripes/core';

import { useToggleAutomaticExport } from './useToggleAutomaticExport';

const acquisitionMethod = 'acq-method-id';
const vendorAccount = '12345';
const lineValues = {
  acquisitionMethod,
  vendorDetail: { vendorAccount },
};

const kyGet = jest.fn();

const renderUseToggleAutomaticExport = (initialValues) => {
  const queryClient = new QueryClient();
  // eslint-disable-next-line react/prop-types
  const wrapper = ({ children }) => (
    <QueryClientProvider client={queryClient}>
      <Form
        onSubmit={jest.fn()}
        initialValues={initialValues}
        render={() => children}
      />
    </QueryClientProvider>
  );

  return renderHook(() => ({
    form: useForm(),
    toggleAutomaticExport: useToggleAutomaticExport('vendor-id'),
  }), { wrapper });
};

const mockConfigs = (configs) => kyGet.mockReturnValue({ json: () => Promise.resolve({ configs }) });

const getAutomaticExport = (result) => result.current.form.getState().values.automaticExport;

describe('useToggleAutomaticExport', () => {
  beforeEach(() => {
    kyGet.mockClear();
    mockConfigs([{ id: 'config-id' }]);
    useOkapiKy.mockClear().mockReturnValue({ get: kyGet });
  });

  it('should check automatic export when a scheduled integration applies', async () => {
    const { result } = renderUseToggleAutomaticExport({ ...lineValues, automaticExport: false });

    await act(() => result.current.toggleAutomaticExport({ acquisitionMethod, vendorAccount }));

    expect(getAutomaticExport(result)).toBe(true);
    expect(kyGet).toHaveBeenCalledWith('data-export-spring/effective-configs', expect.objectContaining({
      searchParams: expect.objectContaining({
        vendorId: 'vendor-id',
        acquisitionMethod,
        vendorAccount,
        scheduled: true,
      }),
    }));
  });

  it('should uncheck automatic export when no scheduled integration applies', async () => {
    mockConfigs([]);

    const { result } = renderUseToggleAutomaticExport({ ...lineValues, automaticExport: true });

    await act(() => result.current.toggleAutomaticExport({ acquisitionMethod, vendorAccount }));

    expect(getAutomaticExport(result)).toBe(false);
  });

  it('should uncheck automatic export without an acquisition method', async () => {
    const { result } = renderUseToggleAutomaticExport({ automaticExport: true });

    await act(() => result.current.toggleAutomaticExport({ acquisitionMethod: undefined, vendorAccount }));

    expect(getAutomaticExport(result)).toBe(false);
    expect(kyGet).not.toHaveBeenCalled();
  });

  it('should keep the value when the backend does not provide the endpoint', async () => {
    kyGet.mockReturnValue({ json: () => Promise.reject(new Error('Not Found')) });

    const { result } = renderUseToggleAutomaticExport({ ...lineValues, automaticExport: true });

    await act(() => result.current.toggleAutomaticExport({ acquisitionMethod, vendorAccount }));

    expect(getAutomaticExport(result)).toBe(true);
  });

  it('should ignore an answer for values the form no longer has', async () => {
    mockConfigs([]);

    const { result } = renderUseToggleAutomaticExport({
      ...lineValues,
      acquisitionMethod: 'other-acq-method-id',
      automaticExport: true,
    });

    await act(() => result.current.toggleAutomaticExport({ acquisitionMethod, vendorAccount }));

    expect(getAutomaticExport(result)).toBe(true);
  });
});
