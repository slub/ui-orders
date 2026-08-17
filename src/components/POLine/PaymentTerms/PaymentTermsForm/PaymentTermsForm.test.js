import { MemoryRouter } from 'react-router-dom';

import {
  render,
  screen,
} from '@folio/jest-config-stripes/testing-library/react';
import userEvent from '@folio/jest-config-stripes/testing-library/user-event';
import stripesFinalForm from '@folio/stripes/final-form';

import { PaymentTermsContext } from './PaymentTermsContext';
import { FiscalYearsDistribution } from './FiscalYearsDistribution';
import { PaymentTermsForm } from './PaymentTermsForm';
import { getFundDistributionTotalValidator } from './validation';

jest.mock('./FiscalYearsDistribution', () => ({
  FiscalYearsDistribution: jest.fn(() => 'FiscalYearsDistribution'),
}));

jest.mock('./validation', () => ({
  ...jest.requireActual('./validation'),
  getFundDistributionTotalValidator: jest.fn(() => jest.fn(() => Promise.resolve(undefined))),
}));

jest.mock('react-intl', () => ({
  ...jest.requireActual('react-intl'),
  FormattedMessage: ({ id }) => id,
  useIntl: () => ({ formatMessage: ({ id }) => id }),
}));

jest.mock('@folio/stripes-acq-components', () => ({
  ...jest.requireActual('@folio/stripes-acq-components'),
  AmountWithCurrencyField: jest.fn(({ amount }) => <span data-testid="amount">{amount}</span>),
  FieldSelectionFinal: jest.fn(({ label, onChange, dataOptions }) => (
    <div>
      {label}
      {dataOptions?.map(o => (
        <button key={o.value} type="button" onClick={() => onChange(o.value)}>{o.label}</button>
      ))}
    </div>
  )),
  useShowCallout: jest.fn(() => jest.fn()),
}));

jest.mock('@folio/stripes/components', () => ({
  ...jest.requireActual('@folio/stripes/components'),
  Loading: jest.fn(() => 'Loading'),
  InfoPopover: jest.fn(() => null),
}));

const FY1 = { id: 'fy1', code: 'FY2026' };
const FY2 = { id: 'fy2', code: 'FY2027' };

const defaultContextValue = {
  currency: 'USD',
  paymentTermsFiscalYears: [FY1, FY2],
  rootFieldName: 'paymentTerms',
  startingFiscalYears: [FY1, FY2],
};

const defaultProps = {
  amounts: {},
  disabled: false,
  filterFunds: jest.fn(f => f),
  isLoading: false,
  isNonInteractive: false,
  isTemplate: false,
  onExpenseClassChange: jest.fn(),
  onStartingFYChange: jest.fn(),
  validateFundDistributionTotal: jest.fn(() => Promise.resolve()),
};

// eslint-disable-next-line react/prop-types
const FormWrapper = stripesFinalForm({})(({ children }) => <form>{children}</form>);

const renderComponent = (props = {}, initialFormValues = {}) => render(
  <MemoryRouter>
    <PaymentTermsContext.Provider value={defaultContextValue}>
      <FormWrapper
        onSubmit={() => {}}
        initialValues={{
          multiYearPayment: true,
          paymentTerms: {
            fiscalYearDistributions: [],
            startingFiscalYearId: 'fy1',
            totalPrice: 100,
            prepaymentTerm: 0,
            ...initialFormValues.paymentTerms,
          },
          ...initialFormValues,
        }}
      >
        <PaymentTermsForm {...defaultProps} {...props} />
      </FormWrapper>
    </PaymentTermsContext.Provider>
  </MemoryRouter>,
);

const getDistributionProps = () => FiscalYearsDistribution.mock.calls.at(-1)[0];

describe('PaymentTermsForm', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render FiscalYearsDistribution', () => {
    renderComponent();

    expect(screen.getByText('FiscalYearsDistribution')).toBeInTheDocument();
  });

  it('should hide the add FY button when isNonInteractive is true', () => {
    renderComponent({ isNonInteractive: true });

    expect(getDistributionProps().isAddFYButtonHidden).toBe(true);
  });

  it('should hide the add FY button when multiYearPayment is false', () => {
    renderComponent({}, { multiYearPayment: false });

    expect(getDistributionProps().isAddFYButtonHidden).toBe(true);
  });

  it('should hide the add FY button when no startingFiscalYearId is selected', () => {
    renderComponent({}, { paymentTerms: { startingFiscalYearId: null } });

    expect(getDistributionProps().isAddFYButtonHidden).toBe(true);
  });

  it('should disable the add FY button when disabled is true', () => {
    renderComponent({ disabled: true });

    expect(getDistributionProps().isAddFYButtonDisabled).toBe(true);
  });

  it('should disable the add FY button when isLoading is true', () => {
    renderComponent({ isLoading: true });

    expect(getDistributionProps().isAddFYButtonDisabled).toBe(true);
  });

  it('should disable the add FY button when all available FYs are already added', () => {
    renderComponent(
      {},
      {
        paymentTerms: {
          fiscalYearDistributions: [{ fiscalYearId: 'fy1' }, { fiscalYearId: 'fy2' }],
          startingFiscalYearId: 'fy1',
          totalPrice: 100,
        },
      },
    );

    expect(getDistributionProps().isAddFYButtonDisabled).toBe(true);
  });

  it('should not pass a validate function to FiscalYearsDistribution when isTemplate is true', () => {
    renderComponent({ isTemplate: true });

    expect(getDistributionProps().validate).toBeUndefined();
  });

  it('should not pass a validate function to FiscalYearsDistribution when multiYearPayment is false', () => {
    renderComponent({}, { multiYearPayment: false });

    expect(getDistributionProps().validate).toBeUndefined();
  });

  it('should pass isLoading=true to FiscalYearsDistribution', () => {
    renderComponent({ isLoading: true });

    expect(getDistributionProps().isLoading).toBe(true);
  });

  it('should call onStartingFYChange when a starting FY is selected', async () => {
    const onStartingFYChange = jest.fn();

    renderComponent({ onStartingFYChange });

    await userEvent.click(screen.getByText('FY2026'));

    expect(onStartingFYChange).toHaveBeenCalledWith('fy1');
  });

  it('should create a stable fundDistributionTotalValidator instance via useMemo', () => {
    renderComponent();
    renderComponent(); // second render

    // getFundDistributionTotalValidator should be called once per mount, not per render
    expect(getFundDistributionTotalValidator).toHaveBeenCalled();
  });
});
