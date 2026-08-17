import flatten from 'lodash/flatten';
import uniq from 'lodash/uniq';

import {
  fetchAllRecords,
  fetchConsortiumHoldingsByIds,
  fetchConsortiumLocations,
  fetchTenantAddressesByIds,
} from '@folio/stripes-acq-components';

import { fetchExportDataByIds } from '../../utils';
import { createExportReport } from './createExportReport';

const getExportUserIds = (lines = [], orders = []) => {
  const lineUserIds = lines.map(({ metadata }) => {
    return [metadata?.createdByUserId, metadata?.updatedByUserId];
  });
  const orderUserIds = orders.map(({ metadata, assignedTo, approvedById, openedById }) => ([
    approvedById,
    assignedTo,
    metadata?.createdByUserId,
    metadata?.updatedByUserId,
    openedById,
  ]));

  return uniq(flatten([...lineUserIds, ...orderUserIds])).filter(Boolean);
};

const extractUniqueFlat = (array, extractor) => uniq(array.flatMap(item => extractor(item) || []).filter(Boolean));

// Extracts expense class ids from regular POL fund distributions.
const getFundDistributionExpenseClassIds = ({ fundDistribution }) => (
  fundDistribution?.map(({ expenseClassId }) => expenseClassId)
);

// Extracts expense class ids from a payment term's fund distribution list.
const getFundDistributionsExpenseClassIds = (fundDistributions = []) => (
  fundDistributions?.map(({ expenseClassId }) => expenseClassId)
);

// Flattens expense class ids across all payment term fiscal year distributions.
const getFiscalYearDistributionsExpenseClassIds = (fiscalYearDistributions = []) => (
  fiscalYearDistributions?.flatMap(({ fundDistributions }) => getFundDistributionsExpenseClassIds(fundDistributions))
);

// Extracts expense class ids from nested payment terms data on a POL.
const getPaymentTermsExpenseClassIds = ({ paymentTerms }) => (
  getFiscalYearDistributionsExpenseClassIds(paymentTerms?.fiscalYearDistributions)
);

export const getExportData = (
  mutator,
  ky,
  {
    intl,
    stripes,
    isCentralOrderingEnabled,
  } = {},
) => async (lines, orders, customFields) => {
  /* Orders based */
  const acqUnitsIds = extractUniqueFlat(orders, ({ acqUnitIds }) => acqUnitIds);
  const addressIds = extractUniqueFlat(orders, ({ billTo, shipTo }) => [billTo, shipTo]);
  const fiscalYearIds = Array.from(new Set([
    ...extractUniqueFlat(
      orders,
      ({ fiscalYearId }) => fiscalYearId,
    ), // Fiscal year of the order
    ...extractUniqueFlat(
      lines,
      ({ paymentTerms }) => paymentTerms?.fiscalYearDistributions?.map(({ fiscalYearId }) => fiscalYearId),
    ), // Fiscal years of the POLine payment term
  ]));
  const orderVendorIds = extractUniqueFlat(orders, (({ vendor }) => vendor));

  /* Lines based */
  const acquisitionMethodsIds = extractUniqueFlat(lines, ({ acquisitionMethod }) => acquisitionMethod);
  const lineHoldingIds = extractUniqueFlat(lines, ({ locations }) => locations?.map(({ holdingId }) => holdingId));
  const lineLocationIds = extractUniqueFlat(lines, ({ locations }) => locations?.map(({ locationId }) => locationId));
  const contributorNameTypeIds = extractUniqueFlat(
    lines,
    ({ contributors }) => contributors?.map(({ contributorNameTypeId }) => contributorNameTypeId),
  );
  const expenseClassIds = Array.from(new Set([
    ...extractUniqueFlat(
      lines,
      getFundDistributionExpenseClassIds,
    ), // Expense classes of the POLine fund distribution
    ...extractUniqueFlat(lines, getPaymentTermsExpenseClassIds), // Expense classes of the POLine payment term fund distribution
  ]));

  const identifierTypeIds = extractUniqueFlat(
    lines,
    ({ details }) => details?.productIds?.map(({ productIdType }) => productIdType),
  );
  const lineVendorIds = extractUniqueFlat(
    lines,
    ({ physical, eresource }) => [physical?.materialSupplier, eresource?.accessProvider],
  );
  const mTypeIds = extractUniqueFlat(
    lines,
    ({ physical, eresource }) => [physical?.materialType, eresource?.materialType],
  );

  const vendors = await fetchExportDataByIds(mutator.exportVendors, uniq([...orderVendorIds, ...lineVendorIds]));
  const lineHoldings = isCentralOrderingEnabled
    ? await fetchConsortiumHoldingsByIds(ky, stripes)(lineHoldingIds).then((res) => res.holdings || [])
    : await fetchExportDataByIds(mutator.exportHoldings, lineHoldingIds);

  const organizationTypeIds = extractUniqueFlat(vendors, ({ organizationTypes }) => organizationTypes);

  const locationIds = uniq([
    ...lineLocationIds,
    ...lineHoldings.map(({ permanentLocationId }) => permanentLocationId),
  ]);

  const fetchLocationsPromise = isCentralOrderingEnabled
    ? await fetchAllRecords({
      GET: async ({ params: searchParams }) => {
        return fetchConsortiumLocations(ky, stripes)({ searchParams }).then(({ locations }) => locations);
      },
    })
    : fetchExportDataByIds(mutator.exportLocations, locationIds);

  const [
    lineLocations,
    orgTypes,
    users,
    acqUnits,
    mTypes,
    contributorNameTypes,
    identifierTypes,
    expenseClasses,
    addresses,
    acquisitionMethods,
    fiscalYears,
  ] = await Promise.all([
    fetchLocationsPromise,
    fetchExportDataByIds(mutator.organizationTypes, organizationTypeIds),
    fetchExportDataByIds(mutator.exportUsers, getExportUserIds(lines, orders)),
    fetchExportDataByIds(mutator.exportAcqUnits, acqUnitsIds),
    fetchExportDataByIds(mutator.exportMaterialTypes, mTypeIds),
    fetchExportDataByIds(mutator.exportContributorNameTypes, contributorNameTypeIds),
    fetchExportDataByIds(mutator.exportIdentifierTypes, identifierTypeIds),
    fetchExportDataByIds(mutator.exportExpenseClasses, expenseClassIds),
    fetchTenantAddressesByIds(ky)(addressIds).then((res) => res.addresses),
    fetchExportDataByIds(mutator.acquisitionMethods, acquisitionMethodsIds),
    fetchExportDataByIds(mutator.fiscalYears, fiscalYearIds),
  ]);

  return createExportReport(
    intl,
    lines,
    orders,
    customFields,
    vendors,
    users,
    acqUnits,
    mTypes,
    lineLocations,
    lineHoldings,
    contributorNameTypes,
    identifierTypes,
    expenseClasses,
    addresses,
    acquisitionMethods,
    orgTypes,
    fiscalYears,
  );
};
