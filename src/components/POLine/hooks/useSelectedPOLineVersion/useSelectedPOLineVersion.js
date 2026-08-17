import { useMemo } from 'react';
import { useQuery } from 'react-query';
import { useIntl } from 'react-intl';
import {
  filter,
  flow,
  get,
  keyBy,
  uniq,
} from 'lodash/fp';

import {
  useNamespace,
  useOkapiKy,
} from '@folio/stripes/core';
import { useLocationsQuery } from '@folio/stripes-acq-components';

import {
  getMaterialTypes,
  getOrganizationsByIds,
  getVersionMetadata,
} from '../../../../common/utils';
import {
  useAcqMethods,
  useOrder,
  useOrderLine,
} from '../../../../common/hooks';
import { usePaymentTermsFiscalYears } from '../../PaymentTerms/hooks';

export const useSelectedPOLineVersion = ({ versionId, versions, snapshotPath, centralOrdering }, options = {}) => {
  const intl = useIntl();
  const ky = useOkapiKy();
  const [namespace] = useNamespace({ key: 'order-line-version-data' });

  const deletedRecordLabel = intl.formatMessage({ id: 'stripes-acq-components.versionHistory.deletedRecord' });
  const getReferenceFieldValue = (condition, value) => condition && (value || deletedRecordLabel);

  const currentVersion = useMemo(() => (
    versions?.find(({ id }) => id === versionId)
  ), [versionId, versions]);
  const versionSnapshot = useMemo(() => (
    get(snapshotPath, currentVersion)
  ), [snapshotPath, currentVersion]);

  const linkedPackagePoLineId = versionSnapshot?.packagePoLineId;

  const startingFiscalYearId = versionSnapshot?.paymentTerms?.startingFiscalYearId;
  const {
    fiscalYears: paymentTermsFiscalYears,
    isLoading: isFiscalYearsLoading,
  } = usePaymentTermsFiscalYears(
    startingFiscalYearId,
    { enabled: Boolean(versionSnapshot?.multiYearPayment && startingFiscalYearId) },
  );

  const {
    order,
    isLoading: isOrderLoading,
  } = useOrder(currentVersion?.orderId);
  const {
    orderLine,
    isLoading: isOrderLineLoading,
  } = useOrderLine(currentVersion?.orderLineId);
  const {
    orderLine: linkedOrderLine,
    isLoading: isLinkedOrderLineLoading,
  } = useOrderLine(linkedPackagePoLineId);
  const {
    acqMethods,
    isLoading: isAcqMethodsLoading,
  } = useAcqMethods();
  const {
    isLoading: isLocationsLoading,
    locations,
  } = useLocationsQuery({ consortium: centralOrdering });

  const {
    isLoading: isVersionDataLoading,
    data: selectedVersion = {},
  } = useQuery(
    [namespace, versionId, versionSnapshot?.id],
    async ({ signal }) => {
      const kyExtended = ky.extend({ signal });

      const accessProviderId = versionSnapshot?.accessProvider;
      const eresource = versionSnapshot?.eresource || {};
      const physical = versionSnapshot?.physical || {};
      const vendorId = versionSnapshot?.vendorId;
      const vendorDetail = versionSnapshot?.vendorDetail || {};
      const accountNumber = versionSnapshot?.vendorDetail?.vendorAccount;

      const eresourceMaterialType = eresource?.materialType;
      const eresourceAccessProvider = eresource?.accessProvider;
      const physicalMaterialType = physical?.materialType;
      const materialSupplierId = physical?.materialSupplier;

      const organizationIds = flow(
        uniq,
        filter(Boolean),
      )([
        accessProviderId,
        eresourceAccessProvider,
        materialSupplierId,
        vendorId,
      ]);

      const [
        organizationsMap,
        materialTypesMap,
      ] = await Promise.all([
        getOrganizationsByIds(kyExtended)(organizationIds).then(keyBy('id')),
        getMaterialTypes(kyExtended)()
          .then(({ mtypes }) => mtypes)
          .then(keyBy('id')),
      ]);

      const vendor = organizationsMap[order?.vendor];
      const vendorAccount = vendor?.accounts?.find(({ accountNo }) => accountNo === accountNumber);

      return {
        ...versionSnapshot,
        order,
        paymentTermsFiscalYears,
        locationsList: locations,
        acquisitionMethod: (
          acqMethods.find(({ id }) => id === versionSnapshot?.acquisitionMethod)?.value || deletedRecordLabel
        ),
        packagePoLineId: getReferenceFieldValue(linkedPackagePoLineId, linkedOrderLine?.titleOrPackage),
        accessProvider: getReferenceFieldValue(accessProviderId, organizationsMap[accessProviderId]?.name),
        eresource: eresource && {
          ...eresource,
          accessProvider: getReferenceFieldValue(
            eresourceAccessProvider,
            organizationsMap[eresourceAccessProvider]?.name,
          ),
          materialType: getReferenceFieldValue(eresourceMaterialType, materialTypesMap[eresourceMaterialType]?.name),
        },
        physical: physical && {
          ...physical,
          materialSupplier: getReferenceFieldValue(materialSupplierId, organizationsMap[materialSupplierId]?.name),
          materialType: getReferenceFieldValue(physicalMaterialType, materialTypesMap[physicalMaterialType]?.name),
          volumes: physical?.volumes?.join(', '),
        },
        vendorDetail: {
          ...vendorDetail,
          vendorAccount: accountNumber && (
            vendorAccount ? `${vendorAccount.name} (${vendorAccount.accountNo})` : accountNumber
          ),
        },
        metadata: getVersionMetadata(currentVersion, orderLine),
      };
    },
    {
      enabled: Boolean(
        versionId
        && !isOrderLoading
        && !isOrderLineLoading
        && !isLinkedOrderLineLoading
        && !isAcqMethodsLoading
        && !isLocationsLoading
        && !isFiscalYearsLoading,
      ),
      ...options,
    },
  );

  const isLoading = (
    isOrderLoading
    || isOrderLineLoading
    || isLinkedOrderLineLoading
    || isAcqMethodsLoading
    || isVersionDataLoading
    || isLocationsLoading
    || isFiscalYearsLoading
  );

  return {
    selectedVersion,
    isLoading,
  };
};
