import { MemoryRouter } from 'react-router-dom';

import {
  act,
  render,
  screen,
} from '@folio/jest-config-stripes/testing-library/react';
import userEvent from '@folio/jest-config-stripes/testing-library/user-event';
import stripesFinalForm from '@folio/stripes/final-form';

import OngoingOrderForm from './OngoingOrderForm';

const defaultProps = {
  formValues: {},
  initialValues: {},
  onMultiYearPaymentChange: jest.fn(),
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
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render \'OngoingOrderForm\' field', () => {
    renderOngoingOrderForm();

    expect(screen.getByText('ui-orders.poLine.renewalNote')).toBeInTheDocument();
    expect(screen.getByText('ui-orders.poLine.multiYearPayment')).toBeInTheDocument();
  });

  it('should call onMultiYearPaymentChange when multi-year payment is enabled', async () => {
    const onMultiYearPaymentChange = jest.fn();

    renderOngoingOrderForm({ onMultiYearPaymentChange });

    await act(async () => {
      await userEvent.click(screen.getByRole('checkbox'));
    });

    expect(onMultiYearPaymentChange).toHaveBeenCalledTimes(1);
  });

  it('should call onMultiYearPaymentChange when multi-year payment is disabled', async () => {
    const onMultiYearPaymentChange = jest.fn();

    renderOngoingOrderForm({
      initialValues: { multiYearPayment: true, paymentTerms: { totalPrice: 245 } },
      onMultiYearPaymentChange,
    });

    await act(async () => {
      await userEvent.click(screen.getByRole('checkbox'));
    });

    expect(onMultiYearPaymentChange).toHaveBeenCalledTimes(1);
  });
});
