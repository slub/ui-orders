import { useForm } from 'react-final-form';
import { MemoryRouter } from 'react-router-dom';

import {
  act,
  render,
  screen,
} from '@folio/jest-config-stripes/testing-library/react';
import userEvent from '@folio/jest-config-stripes/testing-library/user-event';
import stripesFinalForm from '@folio/stripes/final-form';

import OngoingOrderForm from './OngoingOrderForm';

jest.mock('react-final-form', () => ({
  ...jest.requireActual('react-final-form'),
  useForm: jest.fn(),
}));

const defaultProps = {
  formValues: {},
  initialValues: {},
};

// eslint-disable-next-line react/prop-types
const FormWrapper = stripesFinalForm({})(({ children }) => <form>{children}</form>);

const renderOngoingOrderForm = (props = {}) => render(
  <MemoryRouter>
    <FormWrapper
      initialValues={props.initialValues}
      onSubmit={() => jest.fn()}
    >
      <OngoingOrderForm
        {...defaultProps}
        {...props}
      />
    </FormWrapper>
  </MemoryRouter>,
);

describe('OngoingOrderForm', () => {
  beforeEach(() => {
    useForm.mockReturnValue({
      change: jest.fn(),
      getState: jest.fn(() => ({ values: {} })),
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render \'OngoingOrderForm\' field', () => {
    renderOngoingOrderForm();

    expect(screen.getByText('ui-orders.poLine.renewalNote')).toBeInTheDocument();
    expect(screen.getByText('ui-orders.poLine.multiYearPayment')).toBeInTheDocument();
  });

  it('should initialize payment terms total price from po line estimated price when multi-year payment is enabled', async () => {
    const change = jest.fn();

    useForm.mockReturnValue({
      change,
      getState: jest.fn(() => ({
        values: {
          cost: {
            listUnitPrice: 245,
            quantityPhysical: 1,
            currency: 'USD',
          },
        },
      })),
    });

    renderOngoingOrderForm();

    await act(async () => {
      await userEvent.click(screen.getByRole('checkbox'));
    });

    expect(change).toHaveBeenCalledWith('multiYearPayment', true);
    expect(change).toHaveBeenCalledWith('paymentTerms.totalPrice', 245);
  });

  it('should clear payment terms when multi-year payment is disabled', async () => {
    const change = jest.fn();

    useForm.mockReturnValue({
      change,
      getState: jest.fn(() => ({ values: { multiYearPayment: true, paymentTerms: { totalPrice: 245 } } })),
    });

    renderOngoingOrderForm({
      initialValues: { multiYearPayment: true, paymentTerms: { totalPrice: 245 } },
    });

    await userEvent.click(screen.getByRole('checkbox'));

    expect(change).toHaveBeenCalledWith('multiYearPayment', false);
    expect(change).toHaveBeenCalledWith('paymentTerms', undefined);
  });
});
