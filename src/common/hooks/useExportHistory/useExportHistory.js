import { useQuery } from 'react-query';
import { uniqBy } from 'lodash/fp';

import {
  useOkapiKy,
  useNamespace,
} from '@folio/stripes/core';
import {
  batchRequest,
  buildMultiOptionCqlQuery,
} from '@folio/stripes-acq-components';

import { EXPORT_HISTORY_API } from '../../../components/Utils/api';

const buildQueryByPoLineIds = (poLineIds) => {
  const cql = buildMultiOptionCqlQuery('exportedPoLineIds', poLineIds);

  return `${cql} sortby exportDate/sort.descending`;
};

export const useExportHistory = (poLineIds = []) => {
  const ky = useOkapiKy();
  const [namespace] = useNamespace({ key: 'export-history' });

  const fetchFn = ({ signal }) => ({ params: searchParams }) => (
    ky.get(EXPORT_HISTORY_API, { searchParams, signal })
      .json()
      .then(({ exportHistories }) => exportHistories)
  );

  const { data = {}, ...rest } = useQuery(
    [namespace, poLineIds],
    async ({ signal }) => {
      const exportHistories = await batchRequest(
        fetchFn({ signal }),
        poLineIds,
        buildQueryByPoLineIds,
      )
        .then(uniqBy('id'))
        .then(histories => histories.sort((a, b) => new Date(b.exportDate) - new Date(a.exportDate)));

      return {
        exportHistories,
        totalRecords: exportHistories.length,
      };
    },
    {
      enabled: Boolean(poLineIds.length),
    },
  );

  return ({
    exportHistory: data?.exportHistories || [],
    totalRecords: data?.totalRecords,
    ...rest,
  });
};
