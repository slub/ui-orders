import { useQuery } from 'react-query';

import {
  useNamespace,
  useOkapiKy,
} from '@folio/stripes/core';
import { ORDERS_STORAGE_SETTINGS_API } from '@folio/stripes-acq-components';

import {
  CONFIG_LINES_LIMIT,
  LINES_LIMIT_DEFAULT,
} from '../../../components/Utils/const';

export const useLinesLimit = (enabled = true) => {
  const ky = useOkapiKy();
  const [namespace] = useNamespace({ key: 'order-lines-limit' });

  const searchParams = {
    query: `key=="${CONFIG_LINES_LIMIT}"`,
  };

  const { isLoading, data = {} } = useQuery(
    [namespace],
    ({ signal }) => ky.get(ORDERS_STORAGE_SETTINGS_API, { searchParams, signal }).json(),
    { enabled },
  );

  return ({
    linesLimit: Number(data.settings?.[0]?.value) || LINES_LIMIT_DEFAULT,
    isLoading,
  });
};
