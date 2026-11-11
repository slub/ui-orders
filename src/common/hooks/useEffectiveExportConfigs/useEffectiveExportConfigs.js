import { useMemo } from 'react';
import { useQuery } from 'react-query';

import {
  useNamespace,
  useOkapiKy,
} from '@folio/stripes/core';
import { FOLIO_EXPORT_TYPE } from '@folio/stripes-acq-components';

export const EFFECTIVE_EXPORT_CONFIGS_API = 'data-export-spring/effective-configs';

const NO_CONFIGS = [];

// An omitted vendorAccount disables the account filter in the backend; an empty
// one stands for a line without an account number. So it is always sent.
const getCriteria = (line) => ({
  acquisitionMethod: line.acquisitionMethod,
  vendorAccount: line.vendorDetail?.vendorAccount ?? '',
});

const getCriteriaKey = ({ acquisitionMethod, vendorAccount }) => `${acquisitionMethod}:${vendorAccount}`;

/**
 * Asks the backend which ordering integrations apply to the PO lines (MODEXPS-323).
 * The endpoint matches by field values, so lines sharing the acquisition method and
 * vendor account are covered by one lookup.
 */
export const useEffectiveExportConfigs = ({ vendorId, poLines = [] }) => {
  const ky = useOkapiKy();
  const [namespace] = useNamespace({ key: 'effective-export-configs' });

  // Without an acquisition method nothing matches, and the endpoint rejects an
  // empty one.
  const criteriaList = useMemo(() => {
    const byKey = poLines
      .filter((line) => line.acquisitionMethod)
      .map(getCriteria)
      .map((criteria) => [getCriteriaKey(criteria), criteria]);

    return [...new Map(byKey).values()];
  }, [poLines]);

  const {
    data,
    isError,
    isFetching,
  } = useQuery({
    queryKey: [namespace, vendorId, criteriaList],
    enabled: Boolean(vendorId && criteriaList.length),
    queryFn: ({ signal }) => Promise.all(criteriaList.map(async (criteria) => {
      const searchParams = {
        vendorId,
        type: FOLIO_EXPORT_TYPE.EDIFACT_ORDERS_EXPORT,
        ...criteria,
      };

      const { configs = NO_CONFIGS } = await ky
        .get(EFFECTIVE_EXPORT_CONFIGS_API, { searchParams, signal })
        .json();

      return [getCriteriaKey(criteria), configs];
    })),
  });

  const configsByLineId = useMemo(() => {
    const byKey = new Map(data);

    return poLines.reduce((acc, line) => {
      acc[line.id] = byKey.get(getCriteriaKey(getCriteria(line))) ?? NO_CONFIGS;

      return acc;
    }, {});
  }, [poLines, data]);

  return {
    configsByLineId,
    isError,
    isFetching,
  };
};
