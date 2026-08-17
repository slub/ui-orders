import { renderHook } from '@folio/jest-config-stripes/testing-library/react';
import { useShowCallout } from '@folio/stripes-acq-components';

import showUpdateOrderError from '../../../components/Utils/order/showUpdateOrderError';
import useHandleOrderUpdateError from './useHandleOrderUpdateError';

jest.mock('@folio/stripes-acq-components', () => ({
  ...jest.requireActual('@folio/stripes-acq-components'),
  useShowCallout: jest.fn(),
}));
jest.mock('../../../components/Utils/order/showUpdateOrderError', () => jest.fn());

const mutator = {
  GET: jest.fn().mockResolvedValue({ name: 'name' }),
};

const getMockResponse = (code = 'inactiveExpenseClass', key = 'expenseClassId') => ({
  clone: () => ({
    json: () => ({
      errors: [{
        code,
        parameters: [{
          key,
          value: 'value',
        }],
      }],
    }),
  }),
});

const getInvalidResponse = () => ({
  clone: () => ({
    json: () => {
      throw new Error('Invalid response');
    },
  }),
});

describe('useHandleOrderUpdateError', () => {
  const sendCallout = jest.fn();

  beforeEach(() => {
    mutator.GET.mockClear();
    showUpdateOrderError.mockClear();
    useShowCallout.mockReturnValue(sendCallout);
  });

  it('should return order update error handler', () => {
    const { result } = renderHook(() => useHandleOrderUpdateError(mutator));

    expect(result.current[0]).toBeInstanceOf(Function);
  });

  it('should handle error response with \'inactiveExpenseClass\' error code', async () => {
    const { result } = renderHook(() => useHandleOrderUpdateError(mutator));

    try {
      await result.current[0](getMockResponse);

      expect(mutator.GET).toHaveBeenCalled();
    } catch (e) {
      expect(e.message).toEqual('Order update error');
    }
  });

  it('should handle response with another error code', async () => {
    const { result } = renderHook(() => useHandleOrderUpdateError(mutator));
    const openModal = jest.fn();
    const onNoBudgetForFiscalYear = jest.fn();

    try {
      await result.current[0](getMockResponse('genericError'), {
        openModal,
        genericCode: 'custom.error',
        actionType: 'onNoBudgetForFiscalYear',
        onNoBudgetForFiscalYear,
      });

      expect(showUpdateOrderError).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({
        openModal,
        genericCode: 'custom.error',
        actionType: 'onNoBudgetForFiscalYear',
        onNoBudgetForFiscalYear,
      }));
    } catch (e) {
      expect(e.message).toEqual('Order update error');
    }
  });

  it('should forward all options when response parsing fails', async () => {
    const { result } = renderHook(() => useHandleOrderUpdateError(mutator));
    const openModal = jest.fn();
    const toggleDeletePieces = jest.fn();

    try {
      await result.current[0](getInvalidResponse(), {
        openModal,
        genericCode: 'custom.error',
        toggleDeletePieces,
        actionType: 'approve',
      });
    } catch (e) {
      expect(e.message).toEqual('Order update error');
    }

    expect(showUpdateOrderError).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({
      openModal,
      genericCode: 'custom.error',
      toggleDeletePieces,
      actionType: 'approve',
    }));
  });
});
