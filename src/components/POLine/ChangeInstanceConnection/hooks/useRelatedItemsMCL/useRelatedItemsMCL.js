import keyBy from 'lodash/keyBy';
import { useMemo } from 'react';
import { FormattedMessage } from 'react-intl';

import { NoValue } from '@folio/stripes/components';
import {
  useCentralOrderingContext,
  useCurrentUserTenants,
} from '@folio/stripes-acq-components';

import { ITEMS_COLUMN_NAMES } from '../../constants';

export const useRelatedItemsMCL = () => {
  const { isCentralOrderingEnabled } = useCentralOrderingContext();
  const tenants = useCurrentUserTenants();
  const tenantsMap = useMemo(() => keyBy(tenants, 'id'), [tenants]);

  const columnMapping = useMemo(() => {
    return {
      barcode: <FormattedMessage id="ui-inventory.item.barcode" />,
      status: <FormattedMessage id="ui-inventory.status" />,
      copyNumber: <FormattedMessage id="ui-inventory.copyNumber" />,
      materialType: <FormattedMessage id="ui-inventory.materialType" />,
      loanType: <FormattedMessage id="ui-inventory.loanType" />,
      tenantId: <FormattedMessage id="stripes-acq-components.consortia.affiliations.select.label" />,
      effectiveLocation: <FormattedMessage id="ui-inventory.effectiveLocationShort" />,
      enumeration: <FormattedMessage id="ui-inventory.enumeration" />,
      chronology: <FormattedMessage id="ui-inventory.chronology" />,
      volume: <FormattedMessage id="ui-inventory.volume" />,
      yearCaption: <FormattedMessage id="ui-inventory.yearCaption" />,
    };
  }, []);

  const formatter = useMemo(() => {
    return {
      [ITEMS_COLUMN_NAMES.barcode]: item => item.barcode || <NoValue />,
      [ITEMS_COLUMN_NAMES.status]: item => item.status?.name || <NoValue />,
      [ITEMS_COLUMN_NAMES.copyNumber]: item => item.copyNumber || <NoValue />,
      [ITEMS_COLUMN_NAMES.materialType]: item => item.materialType?.name || <NoValue />,
      [ITEMS_COLUMN_NAMES.loanType]: item => (
        item.temporaryLoanType?.name
        || item.permanentLoanType?.name
        || <NoValue />
      ),
      [ITEMS_COLUMN_NAMES.tenantId]: item => tenantsMap[item.tenantId]?.name || <NoValue />,
      [ITEMS_COLUMN_NAMES.effectiveLocation]: item => item.effectiveLocation?.name || <NoValue />,
      [ITEMS_COLUMN_NAMES.enumeration]: item => item.enumeration || <NoValue />,
      [ITEMS_COLUMN_NAMES.chronology]: item => item.chronology || <NoValue />,
      [ITEMS_COLUMN_NAMES.volume]: item => item.volume || <NoValue />,
      [ITEMS_COLUMN_NAMES.yearCaption]: item => item.yearCaption?.join(', ') || <NoValue />,
    };
  }, [tenantsMap]);

  const visibleColumns = useMemo(() => {
    return [
      ITEMS_COLUMN_NAMES.barcode,
      ITEMS_COLUMN_NAMES.status,
      ITEMS_COLUMN_NAMES.copyNumber,
      ITEMS_COLUMN_NAMES.loanType,
      isCentralOrderingEnabled && ITEMS_COLUMN_NAMES.tenantId,
      ITEMS_COLUMN_NAMES.effectiveLocation,
      ITEMS_COLUMN_NAMES.enumeration,
      ITEMS_COLUMN_NAMES.chronology,
      ITEMS_COLUMN_NAMES.volume,
      ITEMS_COLUMN_NAMES.yearCaption,
      ITEMS_COLUMN_NAMES.materialType,
    ].filter(Boolean);
  }, [isCentralOrderingEnabled]);

  return {
    columnMapping,
    formatter,
    visibleColumns,
  };
};
