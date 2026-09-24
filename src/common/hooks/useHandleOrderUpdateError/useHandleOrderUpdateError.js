import { useCallback, useMemo } from 'react';

import { useShowCallout } from '@folio/stripes-acq-components';

import { showUpdateOrderError } from '../../../components/Utils/order';

const useHandleOrderUpdateError = () => {
  const sendCallout = useShowCallout();

  // this is required to avoid huge refactoring of processing error messages for now
  const callout = useMemo(() => ({ sendCallout }), [sendCallout]);

  const handleErrorResponse = useCallback(async (response, options = {}) => {
    return showUpdateOrderError(response, { callout, ...options });
  }, [callout]);

  return [handleErrorResponse];
};

export default useHandleOrderUpdateError;
