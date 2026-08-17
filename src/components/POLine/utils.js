import {
  INVENTORY_RECORDS_TYPE,
  ORDER_FORMATS,
  PAYMENT_STATUS,
  RECEIPT_STATUS,
} from '@folio/stripes-acq-components';

import { POL_FORM_FIELDS } from '../../common/constants';
import {
  isWorkflowStatusClosed,
  isWorkflowStatusOpen,
} from '../PurchaseOrder/util';

export const isOrderLineCancelled = (line) => (
  (
    line.paymentStatus === PAYMENT_STATUS.cancelled && line.receiptStatus === RECEIPT_STATUS.cancelled
  ) ||
  (
    line.paymentStatus === PAYMENT_STATUS.cancelled &&
    (line.receiptStatus === RECEIPT_STATUS.fullyReceived || line.receiptStatus === RECEIPT_STATUS.receiptNotRequired)
  ) ||
  (
    line.receiptStatus === RECEIPT_STATUS.cancelled &&
    (line.paymentStatus === PAYMENT_STATUS.fullyPaid || line.paymentStatus === PAYMENT_STATUS.paymentNotRequired)
  )
);

export const isCancelableLine = (line, order) => (
  (isWorkflowStatusClosed(order) || isWorkflowStatusOpen(order)) &&
  !(
    ((
      line.receiptStatus === RECEIPT_STATUS.fullyReceived ||
      line.receiptStatus === RECEIPT_STATUS.receiptNotRequired
    ) &&
    (
      line.paymentStatus === PAYMENT_STATUS.fullyPaid ||
      line.paymentStatus === PAYMENT_STATUS.paymentNotRequired
    )) ||
    (
      line.receiptStatus === RECEIPT_STATUS.cancelled ||
      line.paymentStatus === PAYMENT_STATUS.cancelled
    )
  )
);

export const setPaymentStatus = (status) => (
  status === PAYMENT_STATUS.fullyPaid || status === PAYMENT_STATUS.paymentNotRequired
    ? status
    : PAYMENT_STATUS.cancelled
);

export const setReceiptStatus = (status) => (
  status === RECEIPT_STATUS.fullyReceived || status === RECEIPT_STATUS.receiptNotRequired
    ? status
    : RECEIPT_STATUS.cancelled
);

export const getCancelledLine = (line) => ({
  ...line,
  receiptStatus: setReceiptStatus(line.receiptStatus),
  paymentStatus: setPaymentStatus(line.paymentStatus),
});

export const getCreateInventory = (line) => {
  switch (line.orderFormat) {
    case ORDER_FORMATS.electronicResource: return line.eresource.createInventory;
    case ORDER_FORMATS.physicalResource:
    case ORDER_FORMATS.other: return line.physical.createInventory;
    case ORDER_FORMATS.PEMix: {
      const eresource = line.eresource.createInventory;
      const physical = line.physical.createInventory;

      if (
        (eresource === INVENTORY_RECORDS_TYPE.none || eresource === INVENTORY_RECORDS_TYPE.instance) &&
        (physical === INVENTORY_RECORDS_TYPE.none || physical === INVENTORY_RECORDS_TYPE.instance)
      ) return INVENTORY_RECORDS_TYPE.none;

      if (
        (eresource === INVENTORY_RECORDS_TYPE.instanceAndHolding || eresource === INVENTORY_RECORDS_TYPE.all) ||
        (physical === INVENTORY_RECORDS_TYPE.instanceAndHolding || physical === INVENTORY_RECORDS_TYPE.all)
      ) return INVENTORY_RECORDS_TYPE.instanceAndHolding;

      return undefined;
    }
    default: return undefined;
  }
};

export const getPoLineFieldsLabelMap = ({
  isPackage,
  orderFormat,
} = {}) => {
  const isNotMixedFormat = orderFormat !== ORDER_FORMATS.PEMix;

  return {
    'tags': 'stripes-acq-components.label.tags',
    'tags.tagList': 'stripes-acq-components.label.tags',
    'tags.tagList[\\d]': 'stripes-acq-components.label.tags',

    // Item details fields
    'instanceId': 'ui-orders.itemDetails.instanceId',
    'titleOrPackage': `ui-orders.itemDetails.${isPackage ? 'packageName' : 'title'}`,
    'details.receivingNote': 'ui-orders.itemDetails.receivingNote',
    'details.subscriptionFrom': 'ui-orders.itemDetails.subscriptionFrom',
    'details.subscriptionTo': 'ui-orders.itemDetails.subscriptionTo',
    'details.subscriptionInterval': 'ui-orders.itemDetails.subscriptionInterval',
    'details.isBinderyActive': 'ui-orders.poLine.isBinderyActive',
    'publicationDate': 'ui-orders.itemDetails.publicationDate',
    'publisher': 'ui-orders.itemDetails.publisher',
    'edition': 'ui-orders.itemDetails.edition',
    'isPackage': 'ui-orders.poLine.package',
    'packagePoLineId': 'ui-orders.itemDetails.linkPackage',
    'contributors[\\d]': 'ui-orders.itemDetails.contributors',
    'contributors[\\d].contributor': 'stripes-acq-components.label.contributor',
    'contributors[\\d].contributorNameTypeId': 'stripes-acq-components.label.contributorType',
    'details.productIds[\\d]': 'ui-orders.itemDetails.productIds',
    'details.productIds[\\d].productId': 'stripes-acq-components.label.productId',
    'details.productIds[\\d].productIdType': 'stripes-acq-components.label.productIdType',
    'details.productIds[\\d].qualifier': 'stripes-acq-components.label.qualifier',
    'description': 'ui-orders.itemDetails.internalNote',
    'suppressInstanceFromDiscovery': 'ui-orders.poLine.suppressFromDiscovery',

    // PO Line details fields
    'poLineNumber': 'ui-orders.poLine.number',
    'acquisitionMethod': 'ui-orders.poLine.acquisitionMethod',
    'automaticExport': 'ui-orders.poLine.automaticExport',
    'orderFormat': 'ui-orders.poLine.orderFormat',
    'metadata.createdByUserId': 'ui-orders.orderDetails.createdBy',
    'metadata.createdDate': 'ui-orders.poLine.createdOn',
    'metadata.updatedByUserId': 'ui-orders.versionHistory.updatedByUserId',
    'metadata.updatedDate': 'ui-orders.orderLineList.updatedDate',
    'receiptDate': 'ui-orders.poLine.receiptDate',
    'receiptStatus': 'ui-orders.poLine.receiptStatus',
    'paymentStatus': 'ui-orders.poLine.paymentStatus',
    'source': 'ui-orders.poLine.source',
    'donor': 'ui-orders.poLine.donor',
    'selector': 'ui-orders.poLine.selector',
    'requester': 'ui-orders.poLine.requester',
    'claimingActive': 'ui-orders.poLine.claimingActive',
    'claimingInterval': 'ui-orders.poLine.claimingInterval',
    'donorOrganizationIds': 'ui-orders.poLine.donorOrganizationIds',
    'donorOrganizationIds[\\d]': 'ui-orders.poLine.donorOrganizationIds',
    'cancellationRestriction': 'ui-orders.poLine.cancellationRestriction',
    'rush': 'ui-orders.poLine.rush',
    'collection': 'ui-orders.poLine.сollection',
    'checkinItems': 'ui-orders.poLine.receivingWorkflow',
    'cancellationRestrictionNote': 'ui-orders.poLine.cancellationRestrictionNote',
    'poLineDescription': 'ui-orders.poLine.poLineDescription',

    // Ongoing PO details fields
    'renewalNote': 'ui-orders.poLine.renewalNote',
    'multiYearPayment': 'ui-orders.poLine.multiYearPayment',

    // Payment terms fields
    'paymentTerms': 'ui-orders.line.accordion.paymentTerms',
    'paymentTerms.totalPrice': 'ui-orders.poLine.paymentTerms.totalPrice',
    'paymentTerms.prepaymentTerm': 'ui-orders.poLine.paymentTerms.prepaymentTerm',
    'paymentTerms.startingFiscalYearId': 'ui-orders.poLine.paymentTerms.startingFY',
    'paymentTerms.fiscalYearDistributions': 'ui-orders.line.accordion.paymentTerms',
    'paymentTerms.fiscalYearDistributions[\\d]': 'ui-orders.line.accordion.paymentTerms',
    'paymentTerms.fiscalYearDistributions[\\d].fiscalYearId': 'ui-orders.poLine.paymentTerms.startingFY',
    'paymentTerms.fiscalYearDistributions[\\d].fundDistributions': 'ui-orders.line.accordion.fund',
    'paymentTerms.fiscalYearDistributions[\\d].fundDistributions[\\d]': 'ui-orders.line.accordion.fund',
    'paymentTerms.fiscalYearDistributions[\\d].fundDistributions[\\d].fundId': 'stripes-acq-components.fundDistribution.name',
    'paymentTerms.fiscalYearDistributions[\\d].fundDistributions[\\d].code': 'stripes-acq-components.fundDistribution.name',
    'paymentTerms.fiscalYearDistributions[\\d].fundDistributions[\\d].expenseClassId': 'stripes-acq-components.fundDistribution.expenseClass',
    'paymentTerms.fiscalYearDistributions[\\d].fundDistributions[\\d].value': 'stripes-acq-components.fundDistribution.value',
    'paymentTerms.fiscalYearDistributions[\\d].fundDistributions[\\d].distributionType': 'stripes-acq-components.fundDistribution.value',
    'paymentTerms.fiscalYearDistributions[\\d].fundDistributions[\\d].encumbrance': 'stripes-acq-components.fundDistribution.currentEncumbrance',

    // Vendor details fields
    'vendorDetail.noteFromVendor': 'ui-orders.vendor.referenceNumbers',
    'vendorDetail.referenceNumbers': 'ui-orders.vendor.referenceNumbers',
    'vendorDetail.referenceNumbers[\\d]': 'ui-orders.vendor.referenceNumbers',
    'vendorDetail.referenceNumbers[\\d].refNumber': 'stripes-acq-components.referenceNumbers.refNumber',
    'vendorDetail.referenceNumbers[\\d].refNumberType': 'stripes-acq-components.referenceNumbers.refNumberType',
    'vendorDetail.instructions': 'ui-orders.vendor.instructions',
    'vendorDetail.vendorAccount': 'ui-orders.vendor.accountNumber',

    // Cost details
    'cost.listUnitPrice': `ui-orders.cost.${isPackage && isNotMixedFormat ? 'listPrice' : 'listPriceOfPhysical'}`,
    'cost.quantityPhysical': `ui-orders.cost.${isPackage && isNotMixedFormat ? 'quantity' : 'quantityPhysical'}`,
    'cost.currency': 'ui-orders.cost.currency',
    'cost.exchangeRate': 'stripes-acq-components.exchangeRate',
    'cost.listUnitPriceElectronic': `ui-orders.cost.${isPackage ? 'listPrice' : 'unitPriceOfElectronic'}`,
    'cost.quantityElectronic': `ui-orders.cost.${isPackage ? 'quantity' : 'quantityElectronic'}`,
    'cost.additionalCost': 'ui-orders.cost.additionalCost',
    'cost.discount': 'ui-orders.cost.discount',
    'cost.discountType': 'ui-orders.cost.discount',
    'cost.poLineEstimatedPrice': 'ui-orders.cost.estimatedPrice',
    'cost.fyroAdjustmentAmount': 'ui-orders.cost.rolloverAdjustment',

    // Fund distribution fields
    'fundDistribution': 'ui-orders.line.accordion.fund',
    'fundDistribution[\\d]': 'ui-orders.line.accordion.fund',
    'fundDistribution[\\d].fundId': 'stripes-acq-components.fundDistribution.name',
    'fundDistribution[\\d].code': 'stripes-acq-components.fundDistribution.name',
    'fundDistribution[\\d].expenseClassId': 'stripes-acq-components.fundDistribution.expenseClass',
    'fundDistribution[\\d].value': 'stripes-acq-components.fundDistribution.value',
    'fundDistribution[\\d].distributionType': 'stripes-acq-components.fundDistribution.value',
    'fundDistribution[\\d].encumbrance': 'stripes-acq-components.fundDistribution.currentEncumbrance',

    // Location fields
    'locations': 'ui-orders.line.accordion.location',
    'locations[\\d]': 'ui-orders.line.accordion.location',
    'locations[\\d].holdingId': 'ui-orders.location.holding',
    'locations[\\d].locationId': 'ui-orders.location.nameCode',
    'locations[\\d].tenantId': 'stripes-acq-components.consortia.affiliations.select.label',
    'locations[\\d].quantity': 'ui-orders.cost.quantity',
    'locations[\\d].quantityPhysical': 'ui-orders.location.quantityPhysical',
    'locations[\\d].quantityElectronic': 'ui-orders.location.quantityElectronic',
    'searchLocationIds[\\d]': 'searchLocationIds',

    // Physical resources fields
    'physical': 'ui-orders.line.accordion.physical',
    'physical.materialSupplier': 'ui-orders.physical.materialSupplier',
    'physical.receiptDue': 'ui-orders.physical.receiptDue',
    'physical.expectedReceiptDate': 'ui-orders.physical.expectedReceiptDate',
    'physical.volumes': 'ui-orders.physical.volumes',
    'physical.volumes[\\d]': 'ui-orders.physical.volumes',
    'physical.createInventory': 'ui-orders.physical.createInventory',
    'physical.materialType': 'ui-orders.poLine.materialType',

    // Eresource resources fields
    'eresource': 'ui-orders.line.accordion.eresource',
    'eresource.accessProvider': 'ui-orders.eresource.accessProvider',
    'eresource.activated': 'ui-orders.eresource.activationStatus',
    'eresource.activationDue': 'ui-orders.eresource.activationDue',
    'eresource.createInventory': 'ui-orders.eresource.createInventory',
    'eresource.materialType': 'ui-orders.poLine.materialType',
    'eresource.trial': 'ui-orders.eresource.trial',
    'eresource.expectedActivation': 'ui-orders.eresource.expectedActivation',
    'eresource.userLimit': 'ui-orders.eresource.userLimit',
    'eresource.resourceUrl': 'ui-orders.eresource.url',
  };
};

export const isSynchronizedReceivingWorkflow = (poLine) => {
  return poLine[POL_FORM_FIELDS.checkinItems] === false;
};

export const isIndependentReceivingWorkflow = (poLine) => {
  return poLine[POL_FORM_FIELDS.checkinItems] === true;
};

export const isReceiptNotRequired = (status) => status === RECEIPT_STATUS.receiptNotRequired;
