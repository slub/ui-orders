import { useForm } from 'react-final-form';

import { renderHook } from '@folio/jest-config-stripes/testing-library/react';

import { useAccordionStatus } from '../../../../common/hooks';
import calculateEstimatedPrice from '../../calculateEstimatedPrice';
import { useMultiYearPaymentChange } from './useMultiYearPaymentChange';

jest.mock('react-final-form', () => ({
  useForm: jest.fn(),
}));

jest.mock('../../../../common/hooks', () => ({
  useAccordionStatus: jest.fn(),
}));

jest.mock('../../calculateEstimatedPrice', () => jest.fn());

describe('useMultiYearPaymentChange', () => {
  const change = jest.fn();
  const getState = jest.fn();
  const triggerAccordion = jest.fn();
  const accordionStatusRef = { current: {} };

  beforeEach(() => {
    jest.clearAllMocks();
    useForm.mockReturnValue({ change, getState });
    useAccordionStatus.mockReturnValue({ triggerAccordion });
    getState.mockReturnValue({ values: { cost: { listUnitPrice: 12 } } });
    calculateEstimatedPrice.mockReturnValue(42);
  });

  it('sets multi-year payment and initializes payment terms when checked', () => {
    const { result } = renderHook(() => useMultiYearPaymentChange(accordionStatusRef));

    result.current.onChange({ target: { checked: true } });

    expect(change).toHaveBeenNthCalledWith(1, 'multiYearPayment', true);
    expect(triggerAccordion).toHaveBeenCalledWith('paymentTerms');
    expect(calculateEstimatedPrice).toHaveBeenCalledWith({ cost: { listUnitPrice: 12 } });
    expect(change).toHaveBeenNthCalledWith(2, 'paymentTerms.totalPrice', 42);
  });

  it('sets multi-year payment and clears payment terms when unchecked', () => {
    const { result } = renderHook(() => useMultiYearPaymentChange(accordionStatusRef));

    result.current.onChange({ target: { checked: false } });

    expect(change).toHaveBeenCalledWith('multiYearPayment', false);
    expect(change).toHaveBeenCalledWith('paymentTerms', undefined);
    expect(triggerAccordion).not.toHaveBeenCalled();
    expect(getState).not.toHaveBeenCalled();
    expect(calculateEstimatedPrice).not.toHaveBeenCalled();
  });

  it('coerces a truthy checked value to true', () => {
    const { result } = renderHook(() => useMultiYearPaymentChange(accordionStatusRef));

    result.current.onChange({ target: { checked: 1 } });

    expect(change).toHaveBeenCalledWith('multiYearPayment', true);
  });
});
