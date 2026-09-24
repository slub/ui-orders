import { FormattedMessage } from 'react-intl';

import { renderHook } from '@folio/jest-config-stripes/testing-library/react';
import { useShowCallout } from '@folio/stripes-acq-components';

import {
  ERROR_CODES,
  PO_UPDATE_ACTION_TYPES,
} from '../../constants';
import useHandleOrderUpdateError from './useHandleOrderUpdateError';

jest.mock('@folio/stripes-acq-components', () => ({
  ...jest.requireActual('@folio/stripes-acq-components'),
  useShowCallout: jest.fn(),
}));

const getMockResponse = (code = 'inactiveExpenseClass', parameters) => ({
  clone: () => ({
    json: () => ({
      errors: [{
        code,
        parameters,
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
    useShowCallout.mockReturnValue(sendCallout);
  });

  it('should return order update error handler', () => {
    const { result } = renderHook(() => useHandleOrderUpdateError());

    expect(result.current[0]).toBeInstanceOf(Function);
  });

  it.each([
    [ERROR_CODES.vendorIsInactive],
    [ERROR_CODES.userHasNoPermission],
    [ERROR_CODES.vendorNotFound],
  ])('should handle error response with "%s" error code', async (errorCode) => {
    const { result } = renderHook(() => useHandleOrderUpdateError());
    const openModal = jest.fn();

    await result.current[0](getMockResponse(errorCode), { openModal });

    expect(openModal).toHaveBeenCalledWith([{ code: errorCode }]);
  });

  it.each([
    [ERROR_CODES.accessProviderIsInactive],
    [ERROR_CODES.accessProviderNotFound],
  ])('should handle error response with "%s" error code', async (errorCode) => {
    const { result } = renderHook(() => useHandleOrderUpdateError());
    const openModal = jest.fn();
    const poLineNumber = 'poLineNumberValue';

    await result.current[0](
      getMockResponse(errorCode, [{ key: 'poLineNumber', value: poLineNumber }]),
      { openModal },
    );

    expect(openModal).toHaveBeenCalledWith([{ code: errorCode, poLineNumber }]);
  });

  it(`should handle error response with '${ERROR_CODES.piecesNeedToBeDeleted}' error code`, async () => {
    const { result } = renderHook(() => useHandleOrderUpdateError());
    const toggleDeletePieces = jest.fn();

    await result.current[0](getMockResponse(ERROR_CODES.piecesNeedToBeDeleted), { toggleDeletePieces });

    expect(toggleDeletePieces).toHaveBeenCalled();
  });

  it.each([
    [ERROR_CODES.missingInstanceStatus, 'errorMessage.instanceStatusTypes', 'instanceStatusTypes'],
    [ERROR_CODES.missingInstanceType, 'errorMessage.resourcetypes', 'resourcetypes'],
    [ERROR_CODES.missingLoanType, 'errorMessage.loanTypes', 'loantypes'],
  ])('should handle error response with "%s" error code', async (errorCode, errorMessage, path) => {
    const { result } = renderHook(() => useHandleOrderUpdateError());

    await result.current[0](getMockResponse(errorCode, [{ value: errorMessage }]));

    expect(sendCallout).toHaveBeenCalledWith({
      message: (
        <FormattedMessage
          id={`ui-orders.errors.${errorCode}`}
          values={{ value: <a href={`/settings/inventory/${path}`}>{errorMessage}</a> }}
        />
      ),
      type: 'error',
      timeout: 0,
    });
  });

  it(`should handle error response with '${ERROR_CODES.inactiveExpenseClass}' error code`, async () => {
    const { result } = renderHook(() => useHandleOrderUpdateError());

    await result.current[0](
      getMockResponse(ERROR_CODES.inactiveExpenseClass, [
        { key: 'fundCode', value: 'fundCode' },
        { key: 'expenseClassName', value: 'expenseClassName' },
      ]),
    );

    expect(sendCallout).toHaveBeenCalledWith({
      messageId: 'ui-orders.errors.openOrder.inactiveExpenseClass',
      type: 'error',
      values: { expenseClass: 'expenseClassName' },
    });
  });

  it(`should handle error response with '${ERROR_CODES.budgetExpenseClassNotFound}' error code`, async () => {
    const { result } = renderHook(() => useHandleOrderUpdateError());

    await result.current[0](
      getMockResponse(ERROR_CODES.budgetExpenseClassNotFound, [
        { key: 'fundCode', value: 'fundCode' },
        { key: 'expenseClassName', value: 'expenseClassName' },
      ]),
    );

    expect(sendCallout).toHaveBeenCalledWith({
      messageId: 'ui-orders.errors.budgetExpenseClassNotFound',
      type: 'error',
      values: { fundCode: 'fundCode', expenseClassName: 'expenseClassName' },
    });
  });

  it(`should handle error response with '${ERROR_CODES.fundCannotBePaid}' error code`, async () => {
    const { result } = renderHook(() => useHandleOrderUpdateError());
    const fundCodes = '[fundCode]';

    await result.current[0](getMockResponse(ERROR_CODES.fundCannotBePaid, [{ key: 'finance.funds', value: fundCodes }]));

    expect(sendCallout).toHaveBeenCalledWith({
      messageId: 'ui-orders.errors.fundCannotBePaid',
      type: 'error',
      values: { fundCodes },
    });
  });

  it(`should handle error response with '${ERROR_CODES.fundLocationRestrictionViolation}' error code`, async () => {
    const { result } = renderHook(() => useHandleOrderUpdateError());
    const polNumber = 'poLineNumberValue';

    await result.current[0](getMockResponse(
      ERROR_CODES.fundLocationRestrictionViolation,
      [{ key: 'poLineNumber', value: polNumber }],
    ));

    expect(sendCallout).toHaveBeenCalledWith({
      messageId: 'ui-orders.errors.openOrder.fundLocationRestrictionViolation',
      type: 'error',
      values: { polNumber },
    });
  });

  it.each([
    [PO_UPDATE_ACTION_TYPES.APPROVE, true],
    [PO_UPDATE_ACTION_TYPES.CANCEL, true],
    [PO_UPDATE_ACTION_TYPES.CLOSE, true],
    [PO_UPDATE_ACTION_TYPES.OPEN, false],
    [PO_UPDATE_ACTION_TYPES.REOPEN, false],
    [PO_UPDATE_ACTION_TYPES.RE_ENCUMBER, true],
    [PO_UPDATE_ACTION_TYPES.UNOPEN, true],
  ])(`should handle error response with '${ERROR_CODES.budgetNotFoundForFiscalYear}' error code for action type '%s'`, async (actionType, includeActionType) => {
    const { result } = renderHook(() => useHandleOrderUpdateError());
    const fiscalYearCode = 'fiscalYearCodeValue';
    const fundCodes = 'fundCodesValue';

    await result.current[0](
      getMockResponse(
        ERROR_CODES.budgetNotFoundForFiscalYear,
        [
          { key: 'fiscalYearCode', value: fiscalYearCode },
          { key: 'fundCodes', value: fundCodes },
        ],
      ),
      { actionType },
    );

    expect(sendCallout).toHaveBeenCalledWith({
      messageId: `ui-orders.errors.${ERROR_CODES.budgetNotFoundForFiscalYear}${includeActionType ? `.${actionType}` : ''}`,
      type: 'error',
      values: {
        fiscalYearCode,
        fundCodes,
      },
    });
  });

  it('should handle response with another error code', async () => {
    const { result } = renderHook(() => useHandleOrderUpdateError());

    await result.current[0](getMockResponse('genericError'), { genericCode: 'custom.error' });

    expect(sendCallout).toHaveBeenCalledWith({
      message: <FormattedMessage id="ui-orders.errors.custom.error" />,
      type: 'error',
    });
  });

  it('should forward all options when response parsing fails', async () => {
    const { result } = renderHook(() => useHandleOrderUpdateError());
    const openModal = jest.fn();
    const toggleDeletePieces = jest.fn();

    await result.current[0](getInvalidResponse(), {
      openModal,
      genericCode: 'custom.error',
      toggleDeletePieces,
      actionType: 'approve',
    });

    expect(sendCallout).toHaveBeenCalledWith({
      message: <FormattedMessage id="ui-orders.errors.custom.error" />,
      type: 'error',
    });
  });
});
