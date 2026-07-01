const AUTOMATIC_EXPORT_FIELD = 'automaticExport';

const getOrderingConfig = (config) => config?.exportTypeSpecificParameters?.vendorEdiOrdersExportConfig;

const isAcqMethodIncluded = (orderingConfig, acquisitionMethod) => (
  Boolean(orderingConfig?.ediConfig?.defaultAcquisitionMethods?.includes(acquisitionMethod))
);

/**
 * Client-side simulation of the backend PO line matching used to give the
 * orderer feedback in the UI (the "Automatic export" checkbox and the
 * "Will be sent via" hint). The real routing happens in the export job.
 *
 * Mirrors mod-data-export-worker `MapToEdifactOrdersTasklet#getPoLineQuery`
 * and `#getVendorAccountFilter`. A config applies to a PO line when:
 *   - the acquisition method is in the config's defaultAcquisitionMethods, AND
 *   - the account filter matches:
 *       - non-default, account list NOT empty -> vendorAccount in accountNoList
 *       - non-default, account list empty      -> matches every line (no restriction)
 *       - default, vendor has > 1 ordering config -> vendorAccount NOT in the
 *         anti-list (union of all account numbers across the vendor's configs)
 *       - default, single ordering config       -> matches every line
 * A missing acquisition method makes the backend job fail, so nothing applies.
 *
 * KEEP IN SYNC: if the backend matching rules change, update this function.
 * Note: this only matches the SLUB backend fork (empty-account-list rule) until
 * that change reaches folio-org master.
 */
export const getApplicableIntegrations = ({ vendorAccount, acquisitionMethod, integrationConfigs = [] }) => {
  if (!acquisitionMethod) return [];

  // Only ordering integrations (EDIFACT_ORDERS_EXPORT) participate in routing.
  // useIntegrationConfigs also loads CLAIMS configs, which lack vendorEdiOrdersExportConfig.
  const orderingConfigs = integrationConfigs.filter(config => getOrderingConfig(config));

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
  const applicableIntegrations = getApplicableIntegrations({ vendorAccount, acquisitionMethod, integrationConfigs });

  change(AUTOMATIC_EXPORT_FIELD, applicableIntegrations.length > 0);
};
