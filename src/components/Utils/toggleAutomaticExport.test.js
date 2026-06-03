import { integrationConfig } from '../../../test/jest/fixtures';
import { toggleAutomaticExport } from './toggleAutomaticExport';

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
      integrationConfigs: [{
        exportTypeSpecificParameters: {
          vendorEdiOrdersExportConfig: {
            isDefaultConfig: true,
            ediConfig: {
              defaultAcquisitionMethods: [acquisitionMethod],
            },
          },
        },
      }],
    });

    expect(change).toBeCalledWith('automaticExport', true);
  });

  it('should set automatic export to unchecked for default config', () => {
    toggleAutomaticExport({
      ...args,
      vendorAccount: null,
      integrationConfigs: [{
        exportTypeSpecificParameters: {
          vendorEdiOrdersExportConfig: {
            isDefaultConfig: true,
          },
        },
      }],
    });

    expect(change).toBeCalledWith('automaticExport', false);
  });

  it('should set automatic export to checked for an account-less integration (matches all)', () => {
    toggleAutomaticExport({
      ...args,
      vendorAccount: 'anyAccount',
      integrationConfigs: [{
        exportTypeSpecificParameters: {
          vendorEdiOrdersExportConfig: {
            ediConfig: {
              defaultAcquisitionMethods: [acquisitionMethod],
              accountNoList: [],
            },
          },
        },
      }],
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
});
