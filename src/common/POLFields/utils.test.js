import { POL_FORM_FIELDS } from '../constants';
import {
  getExportConfigLabel,
  isBinderyActiveDisabled,
} from './utils';

describe('getExportConfigLabel', () => {
  const buildConfig = (vendorEdiOrdersExportConfig) => ({
    exportTypeSpecificParameters: { vendorEdiOrdersExportConfig },
  });

  it('should return the name of the integration', () => {
    expect(getExportConfigLabel(buildConfig({ configName: 'testConfig' }))).toBe('testConfig');
  });

  it('should append the transmission method', () => {
    const config = buildConfig({ configName: 'testConfig', transmissionMethod: 'Email' });

    expect(getExportConfigLabel(config)).toBe('testConfig (Email)');
  });
});

describe('isBinderyActiveDisabled', () => {
  it('should return false if order format is not defined', () => {
    const values = {};
    const result = isBinderyActiveDisabled(values, {});

    expect(result).toBeFalsy();
  });

  it('should return true if order format is not "Physical Resource" or "Physical/Electronic Mix"', () => {
    const values = {
      [POL_FORM_FIELDS.orderFormat]: 'Other',
    };
    const result = isBinderyActiveDisabled(values, {});

    expect(result).toBeTruthy();
  });

  it('should return false if order format is "Physical Resource" and physical.createInventory is "Instance, Holding, Item"', () => {
    const values = {
      [POL_FORM_FIELDS.orderFormat]: 'Physical Resource',
      [POL_FORM_FIELDS.physicalCreateInventory]: 'Instance, Holding, Item',
    };
    const result = isBinderyActiveDisabled(values, {});

    expect(result).toBeFalsy();
  });

  it('should return true if order format is "Physical Resource" and physical.createInventory is not "Instance, Holding, Item"', () => {
    const values = {
      [POL_FORM_FIELDS.orderFormat]: 'Physical Resource',
      [POL_FORM_FIELDS.physicalCreateInventory]: 'Instance, Holding',
    };
    const result = isBinderyActiveDisabled(values, {});

    expect(result).toBeTruthy();
  });

  it('should return false if order is in pending status and physical.createInventory is not "Instance, Holding, Item"', () => {
    const values = {
      [POL_FORM_FIELDS.orderFormat]: 'Physical Resource',
      [POL_FORM_FIELDS.physicalCreateInventory]: 'Instance, Holding',
    };
    const order = { workflowStatus: 'Pending' };
    const result = isBinderyActiveDisabled(values, order);

    expect(result).toBeFalsy();
  });
});
