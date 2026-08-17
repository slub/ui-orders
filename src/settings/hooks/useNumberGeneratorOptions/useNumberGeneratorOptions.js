import { useQuery } from 'react-query';

import {
  useNamespace,
  useOkapiKy,
} from '@folio/stripes/core';
import { ORDERS_STORAGE_SETTINGS_API } from '@folio/stripes-acq-components';

import { NUMBER_GENERATOR_SETTINGS_KEY } from '../../NumberGeneratorSettings/constants';

export const useNumberGeneratorOptions = () => {
  const ky = useOkapiKy();
  const [namespace] = useNamespace({ key: 'number-generator-options' });

  const searchParams = {
    limit: 1,
    query: `key=="${NUMBER_GENERATOR_SETTINGS_KEY}"`,
  };

  const {
    data,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: [namespace],
    queryFn: async ({ signal }) => {
      const response = await ky.get(ORDERS_STORAGE_SETTINGS_API, { searchParams, signal }).json();

      if (!response?.settings || !Array.isArray(response.settings)) {
        return null;
      }

      return response?.settings?.[0];
    },
  });

  return ({
    data,
    isLoading,
    refetch,
  });
};
