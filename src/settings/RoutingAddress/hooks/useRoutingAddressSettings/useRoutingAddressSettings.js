import { useQuery } from 'react-query';

import {
  useNamespace,
  useOkapiKy,
} from '@folio/stripes/core';
import { ORDERS_STORAGE_SETTINGS_API } from '@folio/stripes-acq-components';

import { ROUTING_USER_ADDRESS_TYPE_ID } from '../../constants';

export const useRoutingAddressSettings = (options = {}) => {
  const ky = useOkapiKy();
  const [namespace] = useNamespace({ key: 'routing-address-settings' });

  const searchParams = {
    limit: 1,
    query: `key=="${ROUTING_USER_ADDRESS_TYPE_ID}"`,
  };

  const {
    data,
    isFetching,
    refetch,
    error,
  } = useQuery({
    queryKey: [namespace],
    queryFn: async ({ signal }) => {
      const response = await ky.get(ORDERS_STORAGE_SETTINGS_API, { searchParams, signal }).json();

      return response?.settings?.[0];
    },
    ...options,
  });

  return ({
    data,
    error,
    isLoading: isFetching,
    refetch,
  });
};
