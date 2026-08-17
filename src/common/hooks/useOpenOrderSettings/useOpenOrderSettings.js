import { useQuery } from 'react-query';

import {
  useNamespace,
  useOkapiKy,
} from '@folio/stripes/core';
import {
  getConfigSetting,
  ORDERS_STORAGE_SETTINGS_API,
} from '@folio/stripes-acq-components';

import { CONFIG_OPEN_ORDER } from '../../../components/Utils/const';

export const defaultConfig = {
  isOpenOrderEnabled: false,
  isDuplicateCheckDisabled: false,
};

export const useOpenOrderSettings = (options = {}) => {
  const ky = useOkapiKy();
  const [namespace] = useNamespace({ key: 'open-order-settings' });

  const searchParams = {
    query: `key=="${CONFIG_OPEN_ORDER}"`,
  };

  const { isFetching, data } = useQuery(
    [namespace],
    ({ signal }) => ky.get(ORDERS_STORAGE_SETTINGS_API, { searchParams, signal }).json(),
    options,
  );

  return ({
    openOrderSettings: getConfigSetting(data?.settings, defaultConfig),
    isFetching,
  });
};
