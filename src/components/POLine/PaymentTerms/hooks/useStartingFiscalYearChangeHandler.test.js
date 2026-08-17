import {
  QueryClient,
  QueryClientProvider,
} from 'react-query';

import {
  act,
  renderHook,
} from '@folio/jest-config-stripes/testing-library/react';
import { useOkapiKy } from '@folio/stripes/core';

import { POL_FORM_FIELDS } from '../../../../common/constants';
import { fetchPaymentTermsFiscalYears } from '../fetchPaymentTermsFiscalYears';
import { useStartingFiscalYearChangeHandler } from './useStartingFiscalYearChangeHandler';

jest.mock('react-final-form', () => ({
  ...jest.requireActual('react-final-form'),
  useForm: jest.fn(),
}));

jest.mock('@folio/stripes/core', () => ({
  ...jest.requireActual('@folio/stripes/core'),
  useOkapiKy: jest.fn(),
}));

jest.mock('../fetchPaymentTermsFiscalYears', () => ({
  fetchPaymentTermsFiscalYears: jest.fn(),
}));

const { useForm } = jest.requireMock('react-final-form');

const queryClient = new QueryClient();

// eslint-disable-next-line react/prop-types
const wrapper = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    {children}
  </QueryClientProvider>
);

describe('useStartingFiscalYearChangeHandler', () => {
  const change = jest.fn();
  const ky = { extend: jest.fn() };

  beforeEach(() => {
    useForm.mockReturnValue({ change });
    useOkapiKy.mockReturnValue(ky);
    fetchPaymentTermsFiscalYears.mockReturnValue(jest.fn(() => Promise.resolve({ fiscalYears: [] })));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should reset payment terms fields and skip fetch when value is empty', async () => {
    const { result } = renderHook(() => useStartingFiscalYearChangeHandler(), { wrapper });

    await act(async () => {
      await result.current.handleChange('');
    });

    expect(change).toHaveBeenNthCalledWith(1, `${POL_FORM_FIELDS.paymentTerms}.prepaymentTerm`, undefined);
    expect(change).toHaveBeenNthCalledWith(2, `${POL_FORM_FIELDS.paymentTerms}.fiscalYearDistributions`, undefined);
    expect(change).toHaveBeenNthCalledWith(3, `${POL_FORM_FIELDS.paymentTerms}.startingFiscalYearId`, '');
    expect(fetchPaymentTermsFiscalYears).not.toHaveBeenCalled();
  });

  it('should prepopulate first two fiscal years after fetching payment terms fiscal years', async () => {
    const fiscalYears = [{ id: 'fy1' }, { id: 'fy2' }, { id: 'fy3' }];
    const fetchFiscalYears = jest.fn(() => Promise.resolve({ fiscalYears }));

    fetchPaymentTermsFiscalYears.mockReturnValue(fetchFiscalYears);

    const { result } = renderHook(() => useStartingFiscalYearChangeHandler(), { wrapper });

    await act(async () => {
      await result.current.handleChange('fy-start');
    });

    expect(fetchPaymentTermsFiscalYears).toHaveBeenCalledWith(ky);
    expect(fetchFiscalYears).toHaveBeenCalledWith('fy-start');
    expect(change).toHaveBeenNthCalledWith(1, `${POL_FORM_FIELDS.paymentTerms}.prepaymentTerm`, undefined);
    expect(change).toHaveBeenNthCalledWith(2, `${POL_FORM_FIELDS.paymentTerms}.fiscalYearDistributions`, undefined);
    expect(change).toHaveBeenNthCalledWith(3, `${POL_FORM_FIELDS.paymentTerms}.startingFiscalYearId`, 'fy-start');
    expect(change).toHaveBeenNthCalledWith(4, `${POL_FORM_FIELDS.paymentTerms}.prepaymentTerm`, 2);
    expect(change).toHaveBeenNthCalledWith(5, `${POL_FORM_FIELDS.paymentTerms}.fiscalYearDistributions`, [
      { fiscalYearId: 'fy1', fundDistributions: [] },
      { fiscalYearId: 'fy2', fundDistributions: [] },
    ]);
  });
});
