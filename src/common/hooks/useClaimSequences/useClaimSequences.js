import { useQuery } from 'react-query';

import {
  useNamespace,
  useOkapiKy,
} from '@folio/stripes/core';
import { LIMIT_MAX } from '@folio/stripes-acq-components';

import { CLAIM_SEQUENCES_API } from '../../constants';

const DEFAULT_DATA = [];

export const useClaimSequences = (options = {}) => {
  const {
    enabled = true,
    ...queryOptions
  } = options;

  const [namespace] = useNamespace({ key: 'claim-sequences' });
  const ky = useOkapiKy();

  const searchParams = {
    query: 'cql.allRecords=1 sortby name',
    limit: LIMIT_MAX,
  };

  const {
    data,
    isFetching,
    isLoading,
  } = useQuery({
    queryKey: [namespace],
    queryFn: ({ signal }) => ky.get(CLAIM_SEQUENCES_API, { searchParams, signal }).json(),
    enabled,
    ...queryOptions,
  });

  return ({
    claimSequences: data?.claimSequences || DEFAULT_DATA,
    isFetching,
    isLoading,
  });
};
