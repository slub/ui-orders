import {
  ERROR_CODES,
  PO_UPDATE_ACTION_TYPES,
} from '../../../../common/constants';

export const noBudgetForFiscalYearStrategy = ({ actionType, callout }) => {
  const handle = (errorsContainer) => {
    let fundCodes;
    const error = errorsContainer.getError();
    const fiscalYearCode = error.getParameter('fiscalYearCode');

    try {
      fundCodes = JSON.parse(error.getParameter('fundCodes')).join(', ');
    } catch {
      fundCodes = error.getParameter('fundCodes');
    }

    // Initially this error code was used only for opening order, but now it can be used for other actions as well, so we need to handle it properly
    const messageIdSuffix = (actionType && ![
      PO_UPDATE_ACTION_TYPES.OPEN,
      PO_UPDATE_ACTION_TYPES.REOPEN,
    ].includes(actionType))
      ? `.${actionType}`
      : '';

    callout.sendCallout({
      messageId: `ui-orders.errors.${ERROR_CODES[error.code]}${messageIdSuffix}`,
      type: 'error',
      values: {
        fiscalYearCode,
        fundCodes,
      },
    });
  };

  return { handle };
};
