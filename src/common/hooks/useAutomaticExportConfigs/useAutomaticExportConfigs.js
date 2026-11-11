import { useQuery } from 'react-query';

import {
  useNamespace,
  useOkapiKy,
  useStripes,
} from '@folio/stripes/core';
import { FOLIO_EXPORT_TYPE } from '@folio/stripes-acq-components';

const EFFECTIVE_CONFIGS_API = 'data-export-spring/effective-configs';
const EFFECTIVE_CONFIGS_PERMISSION = 'data-export.effective-configs.collection.get';
const NO_CONFIGS = [];
// Long enough for the checkbox lookup and the hint to share one request.
const STALE_TIME = 10 * 1000;

export const AUTOMATIC_EXPORT_CONFIGS_NAMESPACE = 'automatic-export-configs';

/**
 * The lookup of the scheduled ordering integrations that export a PO line with
 * the given acquisition method and vendor account (MODEXPS-323).
 */
export const getAutomaticExportConfigsQuery = ({ ky, namespace, vendorId, acquisitionMethod, vendorAccount }) => {
  const searchParams = {
    vendorId,
    type: FOLIO_EXPORT_TYPE.EDIFACT_ORDERS_EXPORT,
    acquisitionMethod,
    // An omitted vendorAccount switches the account filter off; an empty one
    // stands for a line without an account number.
    vendorAccount: vendorAccount ?? '',
    scheduled: true,
  };

  return {
    queryKey: [namespace, vendorId, acquisitionMethod, searchParams.vendorAccount],
    queryFn: ({ signal }) => ky
      .get(EFFECTIVE_CONFIGS_API, { searchParams, signal })
      .json()
      .then(({ configs = NO_CONFIGS }) => configs),
    staleTime: STALE_TIME,
  };
};

/**
 * `configs` is undefined as long as there is no answer: the lookup is switched
 * off or still running, the user may not read integrations, or the backend
 * does not provide the endpoint yet.
 */
export const useAutomaticExportConfigs = (
  { vendorId, acquisitionMethod, vendorAccount },
  { enabled = true } = {},
) => {
  const ky = useOkapiKy();
  const stripes = useStripes();
  const [namespace] = useNamespace({ key: AUTOMATIC_EXPORT_CONFIGS_NAMESPACE });

  const isAvailable = Boolean(enabled && vendorId && stripes.hasPerm(EFFECTIVE_CONFIGS_PERMISSION));

  const { data, isSuccess } = useQuery({
    ...getAutomaticExportConfigsQuery({ ky, namespace, vendorId, acquisitionMethod, vendorAccount }),
    enabled: isAvailable && Boolean(acquisitionMethod),
  });

  if (!isAvailable) return { configs: undefined };

  // Nothing matches without an acquisition method, and the endpoint rejects an empty one.
  if (!acquisitionMethod) return { configs: NO_CONFIGS };

  return { configs: isSuccess ? data : undefined };
};
