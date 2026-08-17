import { MemoryRouter } from 'react-router-dom';

import {
  render,
  screen,
} from '@folio/jest-config-stripes/testing-library/react';
import userEvent from '@folio/jest-config-stripes/testing-library/user-event';
import stripesFinalForm from '@folio/stripes/final-form';

import {
  FundDistributionFieldsFinalComponent,
  useFundDistributionHandlers,
} from '@folio/stripes-acq-components';

import { FiscalYearsDistributionTerm } from './FiscalYearsDistributionTerm';

jest.mock('@folio/stripes-acq-components', () => ({
  ...jest.requireActual('@folio/stripes-acq-components'),
  FundDistributionFieldsFinalComponent: jest.fn(() => 'FundDistributionFieldsFinalComponent'),
  useFundDistributionExpenseClasses: jest.fn(() => ({ expenseClassesByFundId: {} })),
  useFundDistributionHandlers: jest.fn(),
}));

jest.mock('react-intl', () => ({
  ...jest.requireActual('react-intl'),
  useIntl: jest.fn(() => ({
    formatMessage: ({ id }, values) => (values ? `${id} ${JSON.stringify(values)}` : id),
  })),
}));

const defaultHandlers = {
  onAdd: jest.fn(),
  onChangeToAmount: jest.fn(),
  onChangeToPercent: jest.fn(),
  onRemove: jest.fn(),
  onSelectFund: jest.fn(),
};

const defaultProps = {
  amounts: { 0: 50 },
  currency: 'USD',
  disabled: false,
  filterFunds: jest.fn(f => f),
  fiscalYearId: 'fy1',
  fundDistributions: [],
  funds: [],
  label: 'FY2026 (1)',
  name: 'paymentTerms.fiscalYearDistributions[0].fundDistributions',
  onExpenseClassChange: jest.fn(),
  onRemoveFiscalYear: jest.fn(),
  showRemoveButton: false,
  totalAmount: 100,
};

const FormWrapper = stripesFinalForm({})(({ children }) => <form>{children}</form>);

const renderComponent = (props = {}) => render(
  <MemoryRouter>
    <FormWrapper onSubmit={() => {}}>
      <FiscalYearsDistributionTerm {...defaultProps} {...props} />
    </FormWrapper>
  </MemoryRouter>,
);

describe('FiscalYearsDistributionTerm', () => {
  beforeEach(() => {
    useFundDistributionHandlers.mockReturnValue(defaultHandlers);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render FundDistributionFieldsFinalComponent with correct props', () => {
    renderComponent();

    expect(screen.getByText('FundDistributionFieldsFinalComponent')).toBeInTheDocument();
    expect(FundDistributionFieldsFinalComponent).toHaveBeenCalledWith(
      expect.objectContaining({
        amounts: defaultProps.amounts,
        currency: 'USD',
        disabled: false,
        expenseClassesByFundId: {},
        funds: [],
        hasValidationError: false,
        name: defaultProps.name,
        totalAmount: 100,
      }),
      expect.anything(),
    );
  });

  it('should not render the remove button when showRemoveButton is false', () => {
    renderComponent({ showRemoveButton: false });

    expect(screen.queryByRole('button', { name: /remove/i })).not.toBeInTheDocument();
  });

  it('should render the remove button when showRemoveButton is true', () => {
    renderComponent({ showRemoveButton: true });

    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('should call onRemoveFiscalYear when the remove button is clicked', async () => {
    const onRemoveFiscalYear = jest.fn();

    renderComponent({ showRemoveButton: true, onRemoveFiscalYear });

    await userEvent.click(screen.getByRole('button'));

    expect(onRemoveFiscalYear).toHaveBeenCalledTimes(1);
  });

  it('should pass onRemoveFundDistribution as onRemove when provided', () => {
    const onRemoveFundDistribution = jest.fn();

    renderComponent({ onRemoveFundDistribution });

    expect(FundDistributionFieldsFinalComponent).toHaveBeenCalledWith(
      expect.objectContaining({ onRemove: onRemoveFundDistribution }),
      expect.anything(),
    );
  });

  it('should fall back to default onRemove when onRemoveFundDistribution is not provided', () => {
    renderComponent({ onRemoveFundDistribution: undefined });

    expect(FundDistributionFieldsFinalComponent).toHaveBeenCalledWith(
      expect.objectContaining({ onRemove: defaultHandlers.onRemove }),
      expect.anything(),
    );
  });

  it('should pass fiscalYearId to useFundDistributionHandlers', () => {
    renderComponent({ fiscalYearId: 'fy-2027' });

    expect(useFundDistributionHandlers).toHaveBeenCalledWith(
      expect.objectContaining({ fiscalYearId: 'fy-2027' }),
    );
  });
});
