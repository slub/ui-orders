import {
  render,
  screen,
} from '@folio/jest-config-stripes/testing-library/react';

import { FundDistributionView } from '@folio/stripes-acq-components';

import { PaymentTermsVersionViewContent } from './PaymentTermsVersionViewContent';

jest.mock('@folio/stripes-acq-components', () => ({
  ...jest.requireActual('@folio/stripes-acq-components'),
  AmountWithCurrencyField: jest.fn(({ amount, currency }) => (
    <span data-testid="amount">{currency} {amount}</span>
  )),
  FundDistributionView: jest.fn(({ name }) => (
    <div data-testid="fund-dist">{name}</div>
  )),
}));

jest.mock('../../../../common/VersionView', () => ({
  VersionKeyValue: jest.fn(({ name, value }) => (
    <div data-testid={`version-kv-${name}`}>{value}</div>
  )),
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
  <PaymentTermsVersionViewContent
    currency="USD"
    fiscalYearsMap={defaultFiscalYearsMap}
    paymentTerms={defaultPaymentTerms}
    {...props}
  />,
);

describe('PaymentTermsVersionViewContent', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render totalPrice via AmountWithCurrencyField inside VersionKeyValue', () => {
    renderComponent();

    expect(screen.getByTestId('version-kv-paymentTerms.totalPrice')).toBeInTheDocument();
    expect(screen.getByTestId('amount').textContent).toBe('USD 1000');
  });

  it('should render prepaymentTerm inside VersionKeyValue with correct name', () => {
    renderComponent();

    const kvEl = screen.getByTestId('version-kv-paymentTerms.prepaymentTerm');

    expect(kvEl).toBeInTheDocument();
    expect(kvEl.textContent).toBe('2');
  });

  it('should render starting FY code inside VersionKeyValue', () => {
    renderComponent();

    const kvEl = screen.getByTestId('version-kv-paymentTerms.startingFiscalYearId');

    expect(kvEl).toBeInTheDocument();
    expect(kvEl.textContent).toBe('FY2026');
  });

  it('should render a FundDistributionView for each fiscal year distribution', () => {
    renderComponent();

    expect(screen.getAllByTestId('fund-dist')).toHaveLength(2);
  });

  it('should pass indexed name to each FundDistributionView', () => {
    renderComponent();

    const fundDistEls = screen.getAllByTestId('fund-dist');

    expect(fundDistEls[0].textContent).toBe('paymentTerms.fiscalYearDistributions[0].fundDistributions');
    expect(fundDistEls[1].textContent).toBe('paymentTerms.fiscalYearDistributions[1].fundDistributions');
  });

  it('should render no FundDistributionView cards when fiscalYearDistributions is empty', () => {
    renderComponent({
      paymentTerms: { ...defaultPaymentTerms, fiscalYearDistributions: [] },
    });

    expect(screen.queryByTestId('fund-dist')).not.toBeInTheDocument();
  });

  it('should render NoValue for startingFiscalYearId not in map', () => {
    renderComponent({
      paymentTerms: { ...defaultPaymentTerms, startingFiscalYearId: 'unknown' },
    });

    expect(screen.getByText('stripes-components.noValue.noValueSet')).toBeInTheDocument();
  });

  it('should pass totalPrice as totalAmount to FundDistributionView', () => {
    renderComponent();

    expect(FundDistributionView.mock.calls[0][0].totalAmount).toBe(1000);
  });
});
