import { useCallback } from 'react';
import { useForm } from 'react-final-form';

import { POL_FORM_FIELDS } from '../../../../common/constants';
import { useAccordionStatus } from '../../../../common/hooks';
import calculateEstimatedPrice from '../../calculateEstimatedPrice';
import { ACCORDION_ID } from '../../const';

export const useMultiYearPaymentChange = (accordionStatusRef) => {
  const {
    change,
    getState,
  } = useForm();

  const { triggerAccordion } = useAccordionStatus(accordionStatusRef);

  const onChange = useCallback((e) => {
    const value = Boolean(e.target.checked);

    change(POL_FORM_FIELDS.multiYearPayment, value);

    if (value) {
      triggerAccordion(ACCORDION_ID.paymentTerms);

      const poLineEstimatedPrice = calculateEstimatedPrice(getState().values);

      change(`${POL_FORM_FIELDS.paymentTerms}.totalPrice`, poLineEstimatedPrice);
    } else {
      change(POL_FORM_FIELDS.paymentTerms, undefined);
    }
  }, [change, getState, triggerAccordion]);

  return { onChange };
};
