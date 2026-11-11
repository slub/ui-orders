import { useCallback } from 'react';
import { useForm } from 'react-final-form';
import { useQueryClient } from 'react-query';

import {
  useNamespace,
  useOkapiKy,
} from '@folio/stripes/core';

import { POL_FORM_FIELDS } from '../../constants';
import {
  AUTOMATIC_EXPORT_CONFIGS_NAMESPACE,
  getAutomaticExportConfigsQuery,
} from '../useAutomaticExportConfigs/useAutomaticExportConfigs';

/**
 * Returns a function for the PO line form that sets "Automatic export" to
 * whether a scheduled integration exports a line with the given acquisition
 * method and vendor account.
 */
export const useToggleAutomaticExport = (vendorId) => {
  const ky = useOkapiKy();
  const queryClient = useQueryClient();
  const { change, getState } = useForm();
  const [namespace] = useNamespace({ key: AUTOMATIC_EXPORT_CONFIGS_NAMESPACE });

  return useCallback(async ({ acquisitionMethod, vendorAccount }) => {
    // Nothing matches without an acquisition method, and the endpoint rejects an empty one.
    if (!acquisitionMethod) {
      change(POL_FORM_FIELDS.automaticExport, false);

      return;
    }

    try {
      const configs = await queryClient.fetchQuery(
        getAutomaticExportConfigsQuery({ ky, namespace, vendorId, acquisitionMethod, vendorAccount }),
      );
      const { values } = getState();
      const isOutdated = (
        values.acquisitionMethod !== acquisitionMethod
        || (values.vendorDetail?.vendorAccount ?? '') !== (vendorAccount ?? '')
      );

      // A later change of these fields has started its own lookup.
      if (!isOutdated) change(POL_FORM_FIELDS.automaticExport, configs.length > 0);
    } catch {
      // A backend without the endpoint or a missing permission: the checkbox keeps its value.
    }
  }, [change, getState, ky, namespace, queryClient, vendorId]);
};
