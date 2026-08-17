export const POL_FORM_FIELDS = {
  /* Item details */
  contributors: 'contributors',
  description: 'description',
  details: 'details',
  edition: 'edition',
  instanceId: 'instanceId',
  isAcknowledged: 'details.isAcknowledged',
  isPackage: 'isPackage',
  packagePoLineId: 'packagePoLineId',
  productIds: 'details.productIds',
  publicationDate: 'publicationDate',
  publisher: 'publisher',
  receivingNote: 'details.receivingNote',
  subscriptionFrom: 'details.subscriptionFrom',
  subscriptionInterval: 'details.subscriptionInterval',
  subscriptionTo: 'details.subscriptionTo',
  suppressInstanceFromDiscovery: 'suppressInstanceFromDiscovery',
  titleOrPackage: 'titleOrPackage',

  /* PO Line details */
  acquisitionMethod: 'acquisitionMethod',
  automaticExport: 'automaticExport',
  cancellationRestriction: 'cancellationRestriction',
  cancellationRestrictionNote: 'cancellationRestrictionNote',
  checkinItems: 'checkinItems',
  claimingActive: 'claimingActive',
  claimingInterval: 'claimingInterval',
  collection: 'collection',
  donor_DEPRECATED: 'donor',
  isBinderyActive: 'details.isBinderyActive',
  orderFormat: 'orderFormat',
  paymentStatus: 'paymentStatus',
  poLineDescription: 'poLineDescription',
  receiptDate: 'receiptDate',
  receiptStatus: 'receiptStatus',
  requester: 'requester',
  rush: 'rush',
  selector: 'selector',
  tagsList: 'tags.tagList',

  /* Donor information */
  donorOrganizationIds: 'donorOrganizationIds',

  /* Vendor */
  vendorDetailInstructions: 'vendorDetail.instructions',
  vendorDetailReferenceNumbers: 'vendorDetail.referenceNumbers',
  vendorDetailVendorAccount: 'vendorDetail.vendorAccount',

  /* Cost details */
  costListUnitPrice: 'cost.listUnitPrice',
  costListUnitPriceElectronic: 'cost.listUnitPriceElectronic',
  costQuantityElectronic: 'cost.quantityElectronic',
  costQuantityPhysical: 'cost.quantityPhysical',
  currency: 'cost.currency',
  discount: 'cost.discount',
  discountType: 'cost.discountType',

  /* E-resources details */
  eresource: 'eresource',
  eresourceAccessProvider: 'eresource.accessProvider',
  eresourceActivated: 'eresource.activated',
  eresourceActivationDue: 'eresource.activationDue',
  eresourceCreateInventory: 'eresource.createInventory',
  eresourceExpectedActivation: 'eresource.expectedActivation',
  eresourceResourceUrl: 'eresource.resourceUrl',
  eresourceMaterialType: 'eresource.materialType',
  eresourceTrial: 'eresource.trial',
  eresourceUserLimit: 'eresource.userLimit',

  /* Fund distribution */
  fundDistribution: 'fundDistribution',

  /* Location */
  locations: 'locations',

  /* Physical resource details */
  physical: 'physical',
  physicalCreateInventory: 'physical.createInventory',
  physicalExpectedReceiptDate: 'physical.expectedReceiptDate',
  physicalMaterialSupplier: 'physical.materialSupplier',
  physicalMaterialType: 'physical.materialType',
  physicalReceiptDue: 'physical.receiptDue',
  physicalVolumes: 'physical.volumes',

  /* Ongoing order details */
  renewalNote: 'renewalNote',
  multiYearPayment: 'multiYearPayment',

  /* Payment terms */
  paymentTerms: 'paymentTerms',
};

export const PO_LINE_FORM_FIELD_ARRAYS_TO_HYDRATE = [POL_FORM_FIELDS.locations];
