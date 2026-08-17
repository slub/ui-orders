import { FormSpy } from 'react-final-form';
import { MemoryRouter } from 'react-router-dom';

import {
  render,
  screen,
} from '@folio/jest-config-stripes/testing-library/react';
import stripesFinalForm from '@folio/stripes/final-form';

import { PaymentTermsContext } from '../PaymentTermsContext';
import { FiscalYearsDistribution } from './FiscalYearsDistribution';
import { FiscalYearsDistributionTerm } from './FiscalYearsDistributionTerm';

jest.mock('./FiscalYearsDistributionTerm', () => ({
  FiscalYearsDistributionTerm: jest.fn(({ label }) => <div data-testid="fy-term">{label}</div>),
}));

jest.mock('@folio/stripes/components', () => ({
  ...jest.requireActual('@folio/stripes/components'),
  Loading: jest.fn(() => <span data-testid="loading-spinner">Loading</span>),
}));

jest.mock('react-intl', () => ({
  ...jest.requireActual('react-intl'),
  FormattedMessage: ({ id }) => id,
  useIntl: () => ({ formatMessage: ({ id }, values) => (values ? `${id}:${JSON.stringify(values)}` : id) }),
}));

const FY1 = { id: 'fy1', code: 'FY2026' };
const FY2 = { id: 'fy2', code: 'FY2027' };

const defaultContextValue = {
  currency: 'USD',
  funds: [],
  paymentTermsFiscalYearsMap: new Map([[FY1.id, FY1], [FY2.id, FY2]]),
};

const FIELD_NAME = 'paymentTerms.fiscalYearDistributions';

const defaultProps = {
  amounts: {},
  filterFunds: jest.fn(f => f),
  hasValidationError: false,
  isAddFYButtonDisabled: false,
  isAddFYButtonHidden: false,
  isLoading: false,
  isNonInteractive: false,
  name: FIELD_NAME,
  onAddFiscalYear: jest.fn(),
  onExpenseClassChange: jest.fn(),
  onRemoveFiscalYear: jest.fn(),
  totalAmount: 100,
  validate: jest.fn(),
};

const FormWrapper = stripesFinalForm({})(({ children }) => <>{children}</>);

const renderComponent = (props = {}, distributions = []) => render(
  <MemoryRouter>
    <PaymentTermsContext.Provider value={defaultContextValue}>
      <FormWrapper
        onSubmit={() => {}}
        initialValues={{ paymentTerms: { fiscalYearDistributions: distributions } }}
      >
        <FiscalYearsDistribution {...defaultProps} {...props} />
        <FormSpy subscription={{ errors: true }}>
          {({ errors }) => <div data-testid="form-errors">{JSON.stringify(errors)}</div>}
        </FormSpy>
      </FormWrapper>
    </PaymentTermsContext.Provider>
  </MemoryRouter>,
);

describe('FiscalYearsDistribution', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render Loading when isLoading is true', () => {
    renderComponent({ isLoading: true });

    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  it('should not render FieldArray when isLoading is true', () => {
    renderComponent({ isLoading: true });

    expect(screen.queryByTestId('fy-term')).not.toBeInTheDocument();
  });

  it('should register hidden error field in form state when hasValidationError is true', () => {
    renderComponent({ hasValidationError: true });

    // The hidden Field registers an error entry; react-final-form nests it by dot-path:
    // 'paymentTerms.fiscalYearDistributions-error' → errors.paymentTerms['fiscalYearDistributions-error']
    const errors = JSON.parse(screen.getByTestId('form-errors').textContent);

    expect(errors?.paymentTerms?.['fiscalYearDistributions-error']).toBeTruthy();
  });

  it('should not register hidden error field when hasValidationError is false', () => {
    renderComponent({ hasValidationError: false });

    const errors = JSON.parse(screen.getByTestId('form-errors').textContent);

    expect(errors?.paymentTerms?.['fiscalYearDistributions-error']).toBeUndefined();
  });

  it('should render a FiscalYearsDistributionTerm for each distribution entry', () => {
    const distributions = [
      { fiscalYearId: 'fy1', fundDistributions: [] },
      { fiscalYearId: 'fy2', fundDistributions: [] },
    ];

    renderComponent({}, distributions);

    expect(screen.getAllByTestId('fy-term')).toHaveLength(2);
  });

  it('should show remove button only on the last term', () => {
    const distributions = [
      { fiscalYearId: 'fy1', fundDistributions: [] },
      { fiscalYearId: 'fy2', fundDistributions: [] },
    ];

    renderComponent({}, distributions);

    const calls = FiscalYearsDistributionTerm.mock.calls;

    expect(calls[0][0].showRemoveButton).toBe(false);
    expect(calls[1][0].showRemoveButton).toBe(true);
  });
});

describe('getFyAmounts (offset computation)', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should remap global amounts to per-FY local indices', () => {
    const distributions = [
      { fiscalYearId: 'fy1', fundDistributions: [{ fundId: 'f1' }, { fundId: 'f2' }] },
      { fiscalYearId: 'fy2', fundDistributions: [{ fundId: 'f3' }] },
    ];
    // global: { 0: 10, 1: 20, 2: 30 } → FY1 gets { 0: 10, 1: 20 }, FY2 gets { 0: 30 }
    const amounts = { 0: 10, 1: 20, 2: 30 };

    renderComponent({ amounts }, distributions);

    const calls = FiscalYearsDistributionTerm.mock.calls;

    expect(calls[0][0].amounts).toEqual({ 0: 10, 1: 20 }); // FY1
    expect(calls[1][0].amounts).toEqual({ 0: 30 });          // FY2
  });

  it('should handle FY entries with no fund distributions by using zero offset', () => {
    const distributions = [
      { fiscalYearId: 'fy1', fundDistributions: [] },
      { fiscalYearId: 'fy2', fundDistributions: [{ fundId: 'f1' }] },
    ];
    const amounts = { 0: 50 };

    renderComponent({ amounts }, distributions);

    const calls = FiscalYearsDistributionTerm.mock.calls;

    expect(calls[0][0].amounts).toEqual({});         // FY1 has no funds → empty slice
    expect(calls[1][0].amounts).toEqual({ 0: 50 });  // FY2 starts at global offset 0
  });

  it('should assign correct cross-field validateFieldsMap', () => {
    const distributions = [{ fiscalYearId: 'fy1', fundDistributions: [{ fundId: 'f1' }] }];

    renderComponent({}, distributions);

    const { validateFieldsMap } = FiscalYearsDistributionTerm.mock.calls[0][0];

    expect(validateFieldsMap.fundId).toEqual([]);
    expect(validateFieldsMap.expenseClassId).toEqual([]);
    expect(validateFieldsMap.distributionType).toEqual([FIELD_NAME]);
    expect(validateFieldsMap.value).toEqual([FIELD_NAME]);
  });
});
