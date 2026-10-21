import { FOLIO_EXPORT_TYPE } from '@folio/stripes-acq-components';

const AUTOMATIC_EXPORT_FIELD = 'automaticExport';

export const getOrderingConfig = (config) => config?.exportTypeSpecificParameters?.vendorEdiOrdersExportConfig;

export const formatConfigLabel = (config) => {
  const { configName, transmissionMethod } = getOrderingConfig(config) || {};

  return transmissionMethod ? `${configName} (${transmissionMethod})` : configName;
};

const isAcqMethodIncluded = (orderingConfig, acquisitionMethod) => (
  Boolean(orderingConfig?.ediConfig?.defaultAcquisitionMethods?.includes(acquisitionMethod))
);

/**
 * Mirrors the PO line matching of mod-data-export-worker
 * (`MapToEdifactOrdersTasklet#getPoLineQuery`, `#getVendorAccountFilter`) so
 * the UI can predict which ordering integration picks up a PO line. A config
 * applies when the acquisition method is in its defaultAcquisitionMethods and:
 *   - non-default, accountNoList not empty: vendorAccount is in the list
 *   - non-default, accountNoList empty: every line
 *   - default, vendor has several ordering configs: vendorAccount is in none
 *     of their account lists
 *   - default, single ordering config: every line
 * Without an acquisition method the backend job fails, so nothing applies.
 *
 * KEEP IN SYNC with the backend rule.
 */
export const getApplicableOrderingIntegrations = ({ vendorAccount, acquisitionMethod, integrationConfigs = [] }) => {
  if (!acquisitionMethod) return [];

  // Claiming configs share the vendorEdiOrdersExportConfig shape but never export PO lines.
  const orderingConfigs = integrationConfigs.filter(config => (
    config?.type === FOLIO_EXPORT_TYPE.EDIFACT_ORDERS_EXPORT && getOrderingConfig(config)
  ));

  const hasMultipleConfigs = orderingConfigs.length > 1;
  const accountAntiList = hasMultipleConfigs
    ? orderingConfigs.flatMap(config => getOrderingConfig(config)?.ediConfig?.accountNoList ?? [])
    : [];

  return orderingConfigs.filter((config) => {
    const orderingConfig = getOrderingConfig(config);

    if (!isAcqMethodIncluded(orderingConfig, acquisitionMethod)) return false;

    if (orderingConfig.isDefaultConfig) {
      return !hasMultipleConfigs || !accountAntiList.includes(vendorAccount);
    }

    const accountNoList = orderingConfig.ediConfig?.accountNoList ?? [];

    return accountNoList.length === 0 || accountNoList.includes(vendorAccount);
  });
};

export const toggleAutomaticExport = ({ vendorAccount, acquisitionMethod, integrationConfigs, change }) => {
  const applicableIntegrations = getApplicableOrderingIntegrations({
    vendorAccount,
    acquisitionMethod,
    integrationConfigs,
  });

  change(AUTOMATIC_EXPORT_FIELD, applicableIntegrations.length > 0);
};
