import { some } from 'lodash';

import {
  ORDER_STATUSES,
  RECEIPT_STATUS,
} from '@folio/stripes-acq-components';

const isLineAbleToBeReceived = (line = { cost: {} }) => {
  const isNotCheckin = !line.checkinItems;
  const hasQuantity = Boolean(line.cost.quantityPhysical || line.cost.quantityElectronic);
  const hasCorrectReceiptStatus = !([
    RECEIPT_STATUS.pending,
    RECEIPT_STATUS.receiptNotRequired,
  ].includes(line.receiptStatus));

  return isNotCheckin && hasQuantity && hasCorrectReceiptStatus;
};

export const isWorkflowStatusNotPending = (order) => {
  return order?.workflowStatus !== ORDER_STATUSES.pending;
};

export const isWorkflowStatusIsPending = (order) => {
  return order?.workflowStatus === ORDER_STATUSES.pending;
};

export const isWorkflowStatusOpen = (order) => {
  return order?.workflowStatus === ORDER_STATUSES.open;
};

export const isWorkflowStatusClosed = (order) => {
  return order?.workflowStatus === ORDER_STATUSES.closed;
};

export const isReceiveAvailableForLine = (line = {}, order = {}) => {
  const hasLineItemsToReceive = isLineAbleToBeReceived(line);

  return hasLineItemsToReceive && isWorkflowStatusNotPending(order);
};

export const isCheckInAvailableForLine = (line = {}, order = {}) => {
  return line.checkinItems && isWorkflowStatusNotPending(order);
};

export const isReceiveAvailableForOrder = (order = {}) => {
  const { poLines = [] } = order;
  const hasLineItemsToReceive = some(poLines, isLineAbleToBeReceived);

  return hasLineItemsToReceive && isWorkflowStatusNotPending(order);
};

export const isOpenAvailableForOrder = (isApprovalRequired, order = {}) => {
  const { approved, poLines = [] } = order;

  return isWorkflowStatusIsPending(order) && poLines.length > 0 && (approved || !isApprovalRequired);
};

export const isReopenAvailableForOrder = (order = {}) => {
  const { poLines = [] } = order;
  const hasLineItemsToReceive = some(poLines, isLineAbleToBeReceived);

  return hasLineItemsToReceive && isWorkflowStatusNotPending(order);
};

export const ifDisabledToChangePaymentInfo = (order = {}) => {
  return !(isWorkflowStatusIsPending(order) || isWorkflowStatusOpen(order));
};

export const getPoFieldsLabelMap = () => {
  return {
    'tags': 'stripes-acq-components.label.tags',
    'tags.tagList': 'stripes-acq-components.label.tags',
    'tags.tagList[\\d]': 'stripes-acq-components.label.tags',
    'template': 'ui-orders.settings.orderTemplates.editor.template.name',
    'approvedById': 'ui-orders.orderDetails.approvedBy',

    // PO details fields
    'poNumber': 'ui-orders.orderDetails.poNumber',
    'poNumberPrefix': 'ui-orders.orderDetails.orderNumberPrefix',
    'poNumberSuffix': 'ui-orders.orderDetails.orderNumberSuffix',
    'vendor': 'ui-orders.orderDetails.vendor',
    'orderType': 'ui-orders.orderDetails.orderType',
    'acqUnitIds': 'stripes-acq-components.label.acqUnits',
    'acqUnitIds[\\d]': 'stripes-acq-components.label.acqUnits',
    'approvalDate': 'ui-orders.orderDetails.approvalDate',
    'assignedTo': 'ui-orders.orderDetails.assignedTo',
    'billTo': 'ui-orders.orderDetails.billTo',
    'shipTo': 'ui-orders.orderDetails.shipTo',
    'manualPo': 'ui-orders.orderDetails.manualPO',
    'reEncumber': 'ui-orders.orderDetails.reEncumber',
    'dateOrdered': 'ui-orders.orderDetails.dateOpened',
    'fiscalYearId': 'ui-orders.orderDetails.yearOpened',
    'openedById': 'ui-orders.orderDetails.openedBy',
    'notes': 'ui-orders.orderDetails.note',
    'notes[\\d]': 'ui-orders.orderDetails.note',

    // Ongoing fields
    'ongoing': 'ui-orders.line.accordion.ongoingOrder',
    'ongoing.isSubscription': 'ui-orders.renewals.subscription',
    'ongoing.interval': 'ui-orders.renewals.renewalInterval',
    'ongoing.renewalDate': 'ui-orders.renewals.renewalDate',
    'ongoing.reviewPeriod': 'ui-orders.renewals.reviewPeriod',
    'ongoing.manualRenewal': 'ui-orders.renewals.manualRenewal',
    'ongoing.reviewDate': 'ui-orders.renewals.reviewDate',
    'ongoing.notes': 'ui-orders.renewals.notes',

    // Summary fields
    'totalItems': 'ui-orders.orderSummary.totalUnits',
    'approved': 'ui-orders.orderSummary.approved',
    'workflowStatus': 'ui-orders.orderSummary.workflowStatus',
    'totalEstimatedPrice': 'ui-orders.orderSummary.totalEstimatedPrice',
    'totalEncumbered': 'ui-orders.orderSummary.totalEncumbered',
    'totalExpended': 'ui-orders.orderSummary.totalExpended',
    'closeReason': 'ui-orders.orderSummary.closingReason',
    'closeReason.reason': 'ui-orders.orderSummary.closingReason',
    'closeReason.note': 'ui-orders.orderSummary.closingNote',
  };
};

/**
 * Filter deprecated options in a dropdown.
 * @param {object[]} records - array of json objects with { name, deprecated }
 * @param {string} initialSelectedValue - the value of the dropdown on initialization
 * @param {class} intl - class for internationalization
 * @param {string} deprecatedMessageId - intl message ID for labels
 * @returns {object[]} array of {label, value} pairs.
 */
export const filterDeprecatedOptions = (
  records,
  initialSelectedValue,
  intl,
  deprecatedMessageId,
) => records
  .filter(({ name, deprecated }) => !deprecated || name === initialSelectedValue)
  .map(({ name, deprecated }) => {
    return {
      label: deprecated
        ? intl.formatMessage({ id: deprecatedMessageId }, { name })
        : name,
      value: name,
    };
  });

/**
 * Calculate the options of a prefix to use in a dropdown.
 * https://github.com/folio-org/acq-models/blob/master/mod-orders-storage/schemas/prefix.json
 * @param {object[]} records - array of json objects (prefix) with { name, deprecated }
 * @param {string} initialSelectedValue - the value of the dropdown on initialization
 * @param {class} intl - class for internationalization
 * @returns {object[]} array of {label, value} pairs.
 */
export const getPrefixOptions = (
  records,
  initialSelectedValue,
  intl,
) => filterDeprecatedOptions(
  records,
  initialSelectedValue,
  intl,
  'ui-orders.orderDetails.prefix.deprecated',
);

/**
 * Calculate the options of a suffix to use in a dropdown.
 * https://github.com/folio-org/acq-models/blob/master/mod-orders-storage/schemas/suffix.json
 * @param {object[]} records - array of json objects (suffix) with { name, deprecated }
 * @param {string} initialSelectedValue - the value of the dropdown on initialization
 * @param {class} intl - class for internationalization
 * @returns {object[]} array of {label, value} pairs.
 */
export const getSuffixOptions = (
  records,
  initialSelectedValue,
  intl,
) => filterDeprecatedOptions(
  records,
  initialSelectedValue,
  intl,
  'ui-orders.orderDetails.suffix.deprecated',
);
