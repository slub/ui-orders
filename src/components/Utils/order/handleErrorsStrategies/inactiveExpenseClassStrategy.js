export const inactiveExpenseClassStrategy = ({ callout }) => {
  const handle = (errorsContainer) => {
    const error = errorsContainer.getError();
    const expenseClassName = error.getParameter('expenseClassName');

    callout.sendCallout({
      messageId: `ui-orders.errors.openOrder.${error.code}`,
      type: 'error',
      values: { expenseClass: expenseClassName },
    });
  };

  return { handle };
};
