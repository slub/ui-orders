import {
  render,
  screen,
} from '@folio/jest-config-stripes/testing-library/react';

import { AmountWithCurrencyField } from '@folio/stripes-acq-components';

import { PaymentTermsView } from './PaymentTermsView';

jest.mock('@folio/stripes-acq-components', () => ({
  ...jest.requireActual('@folio/stripes-acq-components'),
  AmountWithCurrencyField: jest.fn(({ amount, currency }) => (
    <span data-testid="amount">{currency} {amount}</span>
  )),
  FundDistributionView: jest.fn(({ fundDistributions }) => (
    <div data-testid="fund-dist">{fundDistributions?.length ?? 0} funds</div>
  )),
  IfVisible: jest.fn(({ visible, children }) => (visible !== false ? children : null)),
}));

jest.mock('react-intl', () => ({
  ...jest.requireActual('react-intl'),
  FormattedMessage: ({ id }) => id,
  useIntl: jest.fn(() => ({
    formatMessage: ({ id }, values) => (values ? `${id}:${JSON.stringify(values)}` : id),
  })),
}));

const FY1 = { id: 'fy1', code: 'FY2026' };
const FY2 = { id: 'fy2', code: 'FY2027' };

const defaultFiscalYearsMap = new Map([[FY1.id, FY1], [FY2.id, FY2]]);

const defaultPaymentTerms = {
  totalPrice: 1000,
  prepaymentTerm: 2,
  startingFiscalYearId: 'fy1',
  fiscalYearDistributions: [
    { fiscalYearId: 'fy1', fundDistributions: [{ fundId: 'f1', value: 50, distributionType: 'percentage' }] },
    { fiscalYearId: 'fy2', fundDistributions: [{ fundId: 'f2', value: 50, distributionType: 'percentage' }] },
  ],
};

const renderComponent = (props = {}) => render(
  <PaymentTermsView
    currency="USD"
    fiscalYearsMap={defaultFiscalYearsMap}
    paymentTerms={defaultPaymentTerms}
    {...props}
  />,
);

describe('PaymentTermsView', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render totalPrice via AmountWithCurrencyField', () => {
    renderComponent();

    expect(screen.getByTestId('amount').textContent).toBe('USD 1000');
  });

  it('should render prepaymentTerm', () => {
    renderComponent();

    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('should render starting FY code', () => {
    renderComponent();

    expect(screen.getByText('FY2026')).toBeInTheDocument();
  });

  it('should render a card and FundDistributionView for each fiscal year distribution', () => {
    renderComponent();

    expect(screen.getAllByTestId('fund-dist')).toHaveLength(2);
  });

  it('should include FY code and sequence number in each card label', () => {
    renderComponent();

    expect(screen.getByText(/FY2026.*1|1.*FY2026/)).toBeInTheDocument();
    expect(screen.getByText(/FY2027.*2|2.*FY2027/)).toBeInTheDocument();
  });

  it('should render no cards when fiscalYearDistributions is empty', () => {
    renderComponent({
      paymentTerms: { ...defaultPaymentTerms, fiscalYearDistributions: [] },
    });

    expect(screen.queryByTestId('fund-dist')).not.toBeInTheDocument();
  });

  it('should render NoValue for startingFiscalYearId not in map', () => {
    renderComponent({
      paymentTerms: { ...defaultPaymentTerms, startingFiscalYearId: 'unknown' },
    });

    // NoValue renders FormattedMessage with id="stripes-components.noValue.noValueSet"
    // which our mock renders as the key string
    expect(screen.getByText('stripes-components.noValue.noValueSet')).toBeInTheDocument();
  });

  it('should not render totalPrice field when hidden', () => {
    AmountWithCurrencyField.mockReturnValue(null);

    renderComponent({ hiddenFields: { totalPrice: true } });

    expect(screen.queryByTestId('amount')).not.toBeInTheDocument();
  });
});
