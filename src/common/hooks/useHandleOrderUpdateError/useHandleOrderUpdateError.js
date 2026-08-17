import { useCallback, useMemo } from 'react';

import {
  EXPENSE_CLASSES_API,
  useShowCallout,
} from '@folio/stripes-acq-components';

import { showUpdateOrderError } from '../../../components/Utils/order';

const useHandleOrderUpdateError = (mutatorExpenseClass) => {
  const mutator = useMemo(() => mutatorExpenseClass, [mutatorExpenseClass]);
  const sendCallout = useShowCallout();

  // this is required to avoid huge refactoring of processing error messages for now
  const callout = useMemo(() => ({ sendCallout }), [sendCallout]);

  const handleErrorResponse = useCallback(async (response, options = {}) => {
    try {
      const { errors } = await response.clone().json();
      const errorCode = errors?.[0]?.code;

      if (errorCode === 'inactiveExpenseClass') {
        const expenseClassId = errors?.[0]?.parameters?.find(({ key }) => key === 'expenseClassId')?.value;

        if (expenseClassId) {
          const { name } = await mutator.GET({ path: `${EXPENSE_CLASSES_API}/${expenseClassId}` });
          const values = { expenseClass: name };

          sendCallout({
            messageId: 'ui-orders.errors.openOrder.inactiveExpenseClass',
            type: 'error',
            values,
          });
        }
      } else {
        await showUpdateOrderError(response, { callout, ...options });
      }
    } catch {
      await showUpdateOrderError(response, { callout, ...options });
    }
    throw new Error('Order update error');
  }, [callout, mutator, sendCallout]);

  return [handleErrorResponse];
};

export default useHandleOrderUpdateError;
