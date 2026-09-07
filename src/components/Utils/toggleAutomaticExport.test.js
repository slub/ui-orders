import { integrationConfig } from '../../../test/jest/fixtures';
import {
  getApplicableOrderingIntegrations,
  toggleAutomaticExport,
} from './toggleAutomaticExport';

const change = jest.fn();
const acquisitionMethod = integrationConfig
  .exportTypeSpecificParameters
  .vendorEdiOrdersExportConfig
  .ediConfig
  .defaultAcquisitionMethods[0];
const vendorAccount = integrationConfig
  .exportTypeSpecificParameters
  .vendorEdiOrdersExportConfig
  .ediConfig
  .accountNoList[0];
const args = {
  vendorAccount,
  acquisitionMethod,
  integrationConfigs: [integrationConfig],
  change,
};

const buildConfig = (type, vendorEdiOrdersExportConfig) => ({
  type,
  exportTypeSpecificParameters: { vendorEdiOrdersExportConfig },
});
const orderingConfig = (config) => buildConfig('EDIFACT_ORDERS_EXPORT', config);
const claimingConfig = (config) => buildConfig('CLAIMS', { integrationType: 'Claiming', ...config });

describe('toggleAutomaticExport', () => {
  beforeEach(() => {
    change.mockClear();
  });

  it('should set automatic export to checked', () => {
    toggleAutomaticExport(args);

    expect(change).toBeCalledWith('automaticExport', true);
  });

  it('should set automatic export to unchecked', () => {
    toggleAutomaticExport({
      ...args,
      vendorAccount: 'anotherAccount',
    });

    expect(change).toBeCalledWith('automaticExport', false);
  });

  it('should set automatic export to checked for default config', () => {
    toggleAutomaticExport({
      ...args,
      vendorAccount: null,
      integrationConfigs: [orderingConfig({
        isDefaultConfig: true,
        ediConfig: {
          defaultAcquisitionMethods: [acquisitionMethod],
        },
      })],
    });

    expect(change).toBeCalledWith('automaticExport', true);
  });

  it('should set automatic export to unchecked for default config', () => {
    toggleAutomaticExport({
      ...args,
      vendorAccount: null,
      integrationConfigs: [orderingConfig({
        isDefaultConfig: true,
      })],
    });

    expect(change).toBeCalledWith('automaticExport', false);
  });

  it('should set automatic export to checked for an account-less integration (matches all)', () => {
    toggleAutomaticExport({
      ...args,
      vendorAccount: 'anyAccount',
      integrationConfigs: [orderingConfig({
        ediConfig: {
          defaultAcquisitionMethods: [acquisitionMethod],
          accountNoList: [],
        },
      })],
    });

    expect(change).toBeCalledWith('automaticExport', true);
  });

  it('should set automatic export to unchecked when no acquisition method is selected', () => {
    toggleAutomaticExport({
      ...args,
      acquisitionMethod: undefined,
    });

    expect(change).toBeCalledWith('automaticExport', false);
  });

  it('should ignore a claiming integration even if account and acquisition method match', () => {
    toggleAutomaticExport({
      ...args,
      integrationConfigs: [claimingConfig({
        ediConfig: {
          defaultAcquisitionMethods: [acquisitionMethod],
          accountNoList: [vendorAccount],
        },
      })],
    });

    expect(change).toBeCalledWith('automaticExport', false);
  });
});

describe('getApplicableOrderingIntegrations', () => {
  it('should not let a claiming integration narrow the default ordering integration', () => {
    const defaultOrdering = orderingConfig({
      isDefaultConfig: true,
      ediConfig: {
        defaultAcquisitionMethods: [acquisitionMethod],
      },
    });
    const claiming = claimingConfig({
      ediConfig: {
        defaultAcquisitionMethods: [acquisitionMethod],
        accountNoList: [vendorAccount],
      },
    });

    const applicable = getApplicableOrderingIntegrations({
      vendorAccount,
      acquisitionMethod,
      integrationConfigs: [claiming, defaultOrdering],
    });

    expect(applicable).toEqual([defaultOrdering]);
  });
});
