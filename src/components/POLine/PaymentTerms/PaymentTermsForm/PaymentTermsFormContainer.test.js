import { MemoryRouter } from 'react-router-dom';

import {
  act,
  render,
  screen,
} from '@folio/jest-config-stripes/testing-library/react';
import { useStripes } from '@folio/stripes/core';
import stripesFinalForm from '@folio/stripes/final-form';
import {
  calculateFundDistributionAmountsAndTotal,
  useFunds,
} from '@folio/stripes-acq-components';

import { isWorkflowStatusNotPending } from '../../../PurchaseOrder/util';
import { useExpenseClassChange } from '../../hooks';
import {
  usePaymentTermsFiscalYears,
  useStartingFiscalYearChangeHandler,
  useStartingFiscalYears,
} from '../hooks';
import { PaymentTermsForm } from './PaymentTermsForm';
import { PaymentTermsFormContainer } from './PaymentTermsFormContainer';

jest.mock('@folio/stripes-acq-components', () => ({
  ...jest.requireActual('@folio/stripes-acq-components'),
  calculateFundDistributionAmountsAndTotal: jest.fn(() => ({ amounts: {} })),
  useFunds: jest.fn(() => ({ funds: [] })),
}));

jest.mock('../../../../common/hooks', () => ({
  ...jest.requireActual('../../../../common/hooks'),
  useFundDistributionValidation: jest.fn(() => ({ validateFundDistributionTotal: jest.fn() })),
}));

jest.mock('../../../PurchaseOrder/util', () => ({
  isWorkflowStatusNotPending: jest.fn(() => false),
}));

jest.mock('../../hooks', () => ({
  ...jest.requireActual('../../hooks'),
  useExpenseClassChange: jest.fn(() => ({
    isLoading: false,
    renderModal: jest.fn(() => null),
    onExpenseClassChange: jest.fn(),
  })),
}));

jest.mock('../hooks', () => ({
  usePaymentTermsFiscalYears: jest.fn(() => ({ isFetching: false })),
  useStartingFiscalYearChangeHandler: jest.fn(() => ({
    handleChange: jest.fn(() => Promise.resolve({ fiscalYears: [] })),
    isLoading: false,
  })),
  useStartingFiscalYears: jest.fn(() => ({ fiscalYears: [], isFetching: false })),
}));

jest.mock('./PaymentTermsForm', () => ({
  PaymentTermsForm: jest.fn(() => 'PaymentTermsForm'),
}));

const pendingOrder = { workflowStatus: 'Pending' };
const openOrder = { workflowStatus: 'Open' };

// eslint-disable-next-line react/prop-types
const FormWrapper = stripesFinalForm({})(({ children }) => <>{children}</>);

const renderComponent = (props = {}, initialFormValues = {}) => render(
  <MemoryRouter>
    <FormWrapper
      onSubmit={() => {}}
      initialValues={{
        paymentTerms: {
          startingFiscalYearId: 'fy1',
          fiscalYearDistributions: [],
          totalPrice: 100,
        },
        ...initialFormValues,
      }}
    >
      <PaymentTermsFormContainer filterFunds={jest.fn(f => f)} {...props} />
    </FormWrapper>
  </MemoryRouter>,
);

const getFormProps = () => PaymentTermsForm.mock.calls.at(-1)[0];

describe('PaymentTermsFormContainer', () => {
  afterEach(() => {
    jest.clearAllMocks();
    // Reset any mockImplementation that would persist across tests and cause re-render loops
    usePaymentTermsFiscalYears.mockReturnValue({ isFetching: false });
  });

  it('should render PaymentTermsForm', () => {
    renderComponent({ order: pendingOrder });

    expect(screen.getByText('PaymentTermsForm')).toBeInTheDocument();
  });

  it('should pass disabled=false and isNonInteractive=false for a Pending order', () => {
    isWorkflowStatusNotPending.mockReturnValue(false);
    renderComponent({ order: pendingOrder });

    expect(getFormProps().disabled).toBe(false);
    expect(getFormProps().isNonInteractive).toBe(false);
  });

  it('should pass disabled=true and isNonInteractive=true for a non-Pending order', () => {
    isWorkflowStatusNotPending.mockReturnValue(true);
    renderComponent({ order: openOrder });

    expect(getFormProps().disabled).toBe(true);
    expect(getFormProps().isNonInteractive).toBe(true);
  });

  it('should pass disabled=false when order prop is not provided', () => {
    renderComponent();

    expect(getFormProps().disabled).toBe(false);
  });

  it('should use stripes.currency as fallback when POLine currency is not set', () => {
    useStripes.mockReturnValue({ currency: 'GBP' });
    renderComponent({ order: pendingOrder }, { currency: undefined });

    expect(calculateFundDistributionAmountsAndTotal).toHaveBeenCalledWith(
      expect.anything(),
      expect.anything(),
      'GBP',
    );
  });

  it('should pass isLoading=true when any data is still fetching', () => {
    useStartingFiscalYears.mockReturnValue({ fiscalYears: [], isFetching: true });
    renderComponent({ order: pendingOrder });

    expect(getFormProps().isLoading).toBe(true);
  });

  it('should pass isLoading=false when all data is loaded', () => {
    useStartingFiscalYears.mockReturnValue({ fiscalYears: [], isFetching: false });
    usePaymentTermsFiscalYears.mockReturnValue({ isFetching: false });
    useStartingFiscalYearChangeHandler.mockReturnValue({ handleChange: jest.fn(), isLoading: false });
    useExpenseClassChange.mockReturnValue({
      isLoading: false,
      renderModal: jest.fn(() => null),
      onExpenseClassChange: jest.fn(),
    });
    useFunds.mockReturnValue({ funds: [], isLoading: false });

    renderComponent({ order: pendingOrder });

    expect(getFormProps().isLoading).toBe(false);
  });

  it('should call usePaymentTermsFiscalYears with onSuccess callback', () => {
    renderComponent({ order: pendingOrder });

    expect(usePaymentTermsFiscalYears).toHaveBeenCalled();
    expect(usePaymentTermsFiscalYears.mock.calls[0][1]).toHaveProperty('onSuccess', expect.any(Function));
  });

  it('should call handleStartingFiscalYearChange when onStartingFYChange is invoked', async () => {
    const handleChange = jest.fn(() => Promise.resolve({ fiscalYears: [] }));

    useStartingFiscalYearChangeHandler.mockReturnValue({ handleChange, isLoading: false });

    renderComponent({ order: pendingOrder });

    await act(async () => {
      await getFormProps().onStartingFYChange('fy2');
    });

    expect(handleChange).toHaveBeenCalledWith('fy2');
  });
});
