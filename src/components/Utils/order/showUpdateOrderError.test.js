import showUpdateOrderError from './showUpdateOrderError';

import { PO_UPDATE_ACTION_TYPES } from '../../../common/constants';

const getResponseMock = ({ code, message, parameters }) => {
  return {
    clone: jest.fn().mockReturnThis(),
    json: jest.fn().mockResolvedValue({
      errors: [{
        code,
        parameters,
        message,
      }],
    }),
    status: 400,
  };
};

const params = {
  response: getResponseMock({ code: 'genericError' }),
  callout: {
    sendCallout: jest.fn(),
  },
  openModal: jest.fn(),
};

const getOptions = (overrides = {}) => ({
  callout: params.callout,
  openModal: params.openModal,
  ...overrides,
});

describe('showUpdateOrderError', () => {
  beforeEach(() => {
    params.callout.sendCallout.mockClear();
    params.openModal.mockClear();
  });

  it('should handle error and open modal', async () => {
    const response = getResponseMock({ code: 'vendorIsInactive' });

    await showUpdateOrderError(response, getOptions());

    expect(params.openModal).toHaveBeenCalled();
  });

  it('should handle error and show message', async () => {
    const response = getResponseMock({ code: 'missingInstanceStatus' });

    await showUpdateOrderError(response, getOptions());

    expect(params.callout.sendCallout).toHaveBeenCalled();
  });

  it('should handle `fundLocationRestrictionViolation` error and show message', async () => {
    const response = getResponseMock({
      code: 'fundLocationRestrictionViolation',
      parameters: [{
        key: 'poLineNumber',
        value: 'value',
      }],
    });

    await showUpdateOrderError(response, getOptions());

    expect(params.callout.sendCallout).toHaveBeenCalled();
  });

  it('should handle `budgetExpenseClassNotFound` error and show message', async () => {
    const response = getResponseMock({
      code: 'budgetExpenseClassNotFound',
      parameters: [{
        key: 'fundCode',
        value: 'value',
      }, {
        key: 'expenseClassName',
        value: 'value',
      }],
    });

    await showUpdateOrderError(response, getOptions());

    expect(params.callout.sendCallout).toHaveBeenCalled();
  });

  it('should handle `budgetNotFoundForFiscalYear` error and show message', async () => {
    const response = getResponseMock({
      code: 'budgetNotFoundForFiscalYear',
      parameters: [{
        key: 'fundCodes',
        value: '[1,2]',
      }],
    });

    await showUpdateOrderError(response, getOptions());

    expect(params.callout.sendCallout).toHaveBeenCalled();
  });

  it('should append actionType suffix for `budgetNotFoundForFiscalYear` error', async () => {
    const response = getResponseMock({
      code: 'budgetNotFoundForFiscalYear',
      parameters: [{
        key: 'fundCodes',
        value: '["F1","F2"]',
      }, {
        key: 'fiscalYearCode',
        value: 'FY26',
      }],
    });

    await showUpdateOrderError(response, getOptions({
      actionType: PO_UPDATE_ACTION_TYPES.APPROVE,
    }));

    expect(params.callout.sendCallout).toHaveBeenCalledWith(expect.objectContaining({
      messageId: 'ui-orders.errors.budgetNotFoundForFiscalYear.approve',
      values: expect.objectContaining({
        fiscalYearCode: 'FY26',
        fundCodes: 'F1, F2',
      }),
    }));
  });

  it('should not append suffix for open action in `budgetNotFoundForFiscalYear` error', async () => {
    const response = getResponseMock({
      code: 'budgetNotFoundForFiscalYear',
      parameters: [{
        key: 'fundCodes',
        value: '["F1"]',
      }, {
        key: 'fiscalYearCode',
        value: 'FY26',
      }],
    });

    await showUpdateOrderError(response, getOptions({
      actionType: PO_UPDATE_ACTION_TYPES.OPEN,
    }));

    expect(params.callout.sendCallout).toHaveBeenCalledWith(expect.objectContaining({
      messageId: 'ui-orders.errors.budgetNotFoundForFiscalYear',
      values: expect.objectContaining({
        fiscalYearCode: 'FY26',
        fundCodes: 'F1',
      }),
    }));

    await showUpdateOrderError(params.response, getOptions());

    expect(params.callout.sendCallout).toHaveBeenCalled();
  });
});
