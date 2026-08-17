import {
  render,
  screen,
} from '@folio/jest-config-stripes/testing-library/react';

import { usePaymentTermsFiscalYears } from '../hooks';
import { PaymentTermsView } from './PaymentTermsView';
import { PaymentTermsViewContainer } from './PaymentTermsViewContainer';

jest.mock('../hooks', () => ({
  usePaymentTermsFiscalYears: jest.fn(() => ({ fiscalYears: [], isFetching: false })),
}));

jest.mock('./PaymentTermsView', () => ({
  PaymentTermsView: jest.fn(() => 'PaymentTermsView'),
}));

jest.mock('@folio/stripes/components', () => ({
  ...jest.requireActual('@folio/stripes/components'),
  Loading: jest.fn(() => <span data-testid="loading">Loading</span>),
}));

const defaultPaymentTerms = {
  startingFiscalYearId: 'fy1',
  totalPrice: 500,
  fiscalYearDistributions: [],
};

const renderComponent = (props = {}) => render(
  <PaymentTermsViewContainer
    currency="USD"
    paymentTerms={defaultPaymentTerms}
    {...props}
  />,
);

const getViewProps = () => PaymentTermsView.mock.calls.at(-1)[0];

describe('PaymentTermsViewContainer', () => {
  afterEach(() => {
    jest.clearAllMocks();
    usePaymentTermsFiscalYears.mockReturnValue({ fiscalYears: [], isFetching: false });
  });

  it('should render PaymentTermsView when not fetching', () => {
    renderComponent();

    expect(screen.getByText('PaymentTermsView')).toBeInTheDocument();
  });

  it('should show Loading while fetching', () => {
    usePaymentTermsFiscalYears.mockReturnValue({ fiscalYears: [], isFetching: true });
    renderComponent();

    expect(screen.getByTestId('loading')).toBeInTheDocument();
    expect(screen.queryByText('PaymentTermsView')).not.toBeInTheDocument();
  });

  it('should pass currency, hiddenFields, and paymentTerms to PaymentTermsView', () => {
    const hiddenFields = { totalPrice: true };

    renderComponent({ hiddenFields });

    expect(getViewProps().currency).toBe('USD');
    expect(getViewProps().hiddenFields).toBe(hiddenFields);
    expect(getViewProps().paymentTerms).toBe(defaultPaymentTerms);
  });

  it('should pass a fiscalYearsMap built from fetched fiscal years', () => {
    const fy = { id: 'fy1', code: 'FY2026' };

    usePaymentTermsFiscalYears.mockReturnValue({ fiscalYears: [fy], isFetching: false });
    renderComponent();

    const { fiscalYearsMap } = getViewProps();

    expect(fiscalYearsMap.get('fy1')).toBe(fy);
  });

  it('should call usePaymentTermsFiscalYears with startingFiscalYearId', () => {
    renderComponent();

    expect(usePaymentTermsFiscalYears).toHaveBeenCalledWith('fy1');
  });

  it('should call usePaymentTermsFiscalYears with undefined when startingFiscalYearId is absent', () => {
    renderComponent({ paymentTerms: { fiscalYearDistributions: [] } });

    expect(usePaymentTermsFiscalYears).toHaveBeenCalledWith(undefined);
  });
});
