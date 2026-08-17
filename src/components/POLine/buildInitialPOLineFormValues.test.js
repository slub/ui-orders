import {
  INVENTORY_RECORDS_TYPE,
  sourceValues,
} from '@folio/stripes-acq-components';

import { PRODUCT_ID_TYPE } from '../../common/constants';
import { buildInitialPOLineFormValues } from './buildInitialPOLineFormValues';

const stripes = { currency: 'GBP' };

describe('buildInitialPOLineFormValues', () => {
  it('should return empty default when enabled is false', () => {
    const result = buildInitialPOLineFormValues({ enabled: false });

    expect(result).toEqual({});
  });

  it('should build values without template using vendor and createInventorySetting', () => {
    const vendor = {
      id: 'vendor-1',
      vendorCurrencies: ['EUR', 'USD', 'RUB'],
      claimingInterval: 'monthly',
      accounts: [{ accountNo: 'ACC-123' }],
      subscriptionInterval: 'P1M',
      discountPercent: 5,
    };

    const createInventorySetting = {
      eresource: INVENTORY_RECORDS_TYPE.instanceAndHolding,
      physical: INVENTORY_RECORDS_TYPE.all,
      other: INVENTORY_RECORDS_TYPE.none,
    };
    const order = { id: 'order-1' };
    const instance = { discoverySuppress: true };

    const result = buildInitialPOLineFormValues({
      enabled: true,
      createInventorySetting,
      vendor,
      stripes,
      order,
      instance,
      isCreateFromInstance: false,
    });

    expect(result).toEqual({
      checkinItems: false,
      claimingActive: false,
      claimingInterval: 'monthly',
      cost: {
        currency: 'RUB',
        discountType: 'percentage',
        discount: 5,
      },
      details: {
        subscriptionInterval: 'P1M',
      },
      eresource: {
        accessProvider: 'vendor-1',
        createInventory: 'Instance, Holding',
      },
      isPackage: false,
      locations: [],
      physical: {
        createInventory: 'Instance, Holding, Item',
        materialSupplier: 'vendor-1',
      },
      purchaseOrderId: 'order-1',
      source: sourceValues.user,
      suppressInstanceFromDiscovery: true,
      vendorDetail: {
        instructions: '',
        vendorAccount: 'ACC-123',
      },
    });
  });

  it('should merge inventoryDataToMerge when isCreateFromInstance is true (and forces isPackage=false)', () => {
    const result = buildInitialPOLineFormValues({
      enabled: true,
      isCreateFromInstance: true,
      instance: {
        contributors: [
          {
            name: 'contributor',
            contributorNameTypeId: 'cntbttype',
          },
        ],
        discoverySuppress: true,
        editions: ['ed-1', 'ed-2'],
        id: 'inst-1',
        identifiers: [
          {
            identifierTypeId: PRODUCT_ID_TYPE.isbn,
            value: '123456789',
          },
        ],
        publication: [
          {
            publisher: 'Test publisher',
            dateOfPublication: '2024',
          },
        ],
        title: 'Test instance',
      },
      identifierTypeOptions: [
        {
          label: PRODUCT_ID_TYPE.isbn,
          value: PRODUCT_ID_TYPE.isbn,
        },
      ],
      order: { id: 'ord-2' },
      stripes,
    });

    expect(result).toEqual({
      checkinItems: false,
      claimingActive: false,
      claimingInterval: undefined,
      contributors: [
        {
          contributor: 'contributor',
          contributorNameTypeId: 'cntbttype',
        },
      ],
      cost: {
        currency: 'GBP',
        discountType: 'percentage',
      },
      details: {
        productIds: [
          {
            productId: '123456789',
            productIdType: PRODUCT_ID_TYPE.isbn,
            qualifier: '',
          },
        ],
        subscriptionInterval: undefined,
      },
      edition: 'ed-1',
      eresource: {
        createInventory: undefined,
      },
      instanceId: 'inst-1',
      isPackage: false,
      locations: [],
      physical: {
        createInventory: undefined,
      },
      publicationDate: '2024',
      publisher: 'Test publisher',
      purchaseOrderId: 'ord-2',
      source: sourceValues.user,
      suppressInstanceFromDiscovery: true,
      titleOrPackage: 'Test instance',
      vendorDetail: {
        instructions: '',
        vendorAccount: '',
      },
    });
  });

  it('should build values from template and respects POL_TEMPLATE_FIELDS_LIST and customFields', () => {
    const template = {
      id: 'templ-1',
      fieldA: 'VALUE_A', // should be ignored
      customFields: { cf1: 'CF_VALUE' },
    };

    const customFields = [{ refId: 'cf1' }];

    const result = buildInitialPOLineFormValues({
      enabled: true,
      template,
      customFields,
      order: { id: 'ord-3' },
    });

    expect(result).toEqual({
      customFields: { cf1: 'CF_VALUE' },
      purchaseOrderId: 'ord-3',
      source: sourceValues.user,
    });
  });

  it('should keep a template acquisition method that is not deprecated', () => {
    const template = {
      id: 'templ-1',
      acquisitionMethod: 'acq-active',
    };

    const result = buildInitialPOLineFormValues({
      enabled: true,
      template,
      order: { id: 'ord-4' },
      acqMethods: [
        { id: 'acq-active', deprecated: false },
        { id: 'acq-deprecated', deprecated: true },
      ],
    });

    expect(result.acquisitionMethod).toBe('acq-active');
  });

  it('should clear a deprecated acquisition method coming from a template', () => {
    const template = {
      id: 'templ-1',
      acquisitionMethod: 'acq-deprecated',
    };

    const result = buildInitialPOLineFormValues({
      enabled: true,
      template,
      order: { id: 'ord-5' },
      acqMethods: [
        { id: 'acq-active', deprecated: false },
        { id: 'acq-deprecated', deprecated: true },
      ],
    });

    expect(result).toEqual({
      purchaseOrderId: 'ord-5',
      source: sourceValues.user,
    });
    expect(result.acquisitionMethod).toBeUndefined();
  });
});
