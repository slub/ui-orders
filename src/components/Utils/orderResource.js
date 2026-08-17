import { cloneDeep, omit } from 'lodash';

import {
  ORDER_TYPE,
  WORKFLOW_STATUS,
} from '../../common/constants';

const saveOrder = (order, mutator) => {
  let method = mutator.POST;

  delete order.vendorName;

  if (order.id) {
    method = mutator.PUT;
    delete order.poLines;
  }

  if (!order.metadata?.createdByUserId) delete order.metadata; // fix sample data

  return method(order);
};

export const getFullOrderNumber = ({ poNumberPrefix = '', poNumberSuffix = '', poNumber = '' } = {}) => (
  `${poNumberPrefix}${poNumber}${poNumberSuffix}`.trim()
);

export const updateOrderResource = (order, mutator, changedProps) => {
  const clonedOrder = cloneDeep(order);

  Object.assign(clonedOrder, changedProps);

  return saveOrder(clonedOrder, mutator);
};

export const createOrEditOrderResource = (orderFormValues, mutator) => {
  const clonedOrder = cloneDeep(orderFormValues);
  const isOngoingOrder = clonedOrder.orderType === ORDER_TYPE.ongoing;

  if (isOngoingOrder) {
    clonedOrder.ongoing = clonedOrder.ongoing || {};
  } else {
    delete clonedOrder.ongoing;
  }

  clonedOrder.poNumber = getFullOrderNumber(clonedOrder) || undefined;

  return saveOrder(clonedOrder, mutator);
};

export const reopenOrder = (order, mutator) => {
  return updateOrderResource(
    omit(order, ['closeReason', 'openedById']),
    mutator,
    { workflowStatus: WORKFLOW_STATUS.open },
  );
};

export const cloneOrder = async (order, mutator, orderNumberMutator, lines) => {
  const orderNumberResponse = await orderNumberMutator.GET();
  const poNumber = orderNumberResponse?.poNumber;

  if (!poNumber) throw new Error();

  const clonedOrder = {
    ...omit(
      order,
      [
        'id', 'adjustment', 'metadata', 'poNumber', 'workflowStatus',
        'poLines', 'approved', 'approvedById', 'approvalDate',
        'nextPolNumber', 'closeReason', 'openedById',
      ],
    ),
    poNumber,
  };

  clonedOrder.poNumber = getFullOrderNumber(clonedOrder);

  if (lines) {
    clonedOrder.poLines = lines.map(line => ({
      ...omit(line, ['id', 'purchaseOrderId', 'metadata', 'paymentStatus', 'receiptStatus', 'lastEDIExportDate']),
      fundDistribution: line.fundDistribution?.map(fund => omit(fund, ['encumbrance'])),
    }));
  }

  return saveOrder(clonedOrder, mutator);
};
