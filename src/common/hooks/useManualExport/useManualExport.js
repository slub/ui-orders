import { useMutation } from 'react-query';

import { useOkapiKy } from '@folio/stripes/core';
import { DATA_EXPORT_CONFIGS_API } from '@folio/stripes-acq-components';

// The backend triggers one export configuration at a time (MODEXPS-316), so a
// selection spanning several export methods results in one request each. They are
// independent - each produces its own file and message - hence `allSettled`: a
// failing integration must not cancel the others.
export const useManualExport = () => {
  const ky = useOkapiKy();

  const mutationFn = async (exportEntries = []) => {
    const results = await Promise.allSettled(
      exportEntries.map(({ integrationConfigId, poLineIds }) => (
        ky.post(`${DATA_EXPORT_CONFIGS_API}/${integrationConfigId}/execute`, {
          json: { poLineIds },
        }).json()
      )),
    );

    return results.map((result, index) => {
      const { integrationConfigId, poLineIds } = exportEntries[index];

      return {
        integrationConfigId,
        poLineIds,
        isSuccess: result.status === 'fulfilled',
        // The job id lets the caller follow up on the outcome; the request only
        // confirms that the job was created, not that the export succeeded.
        jobId: result.value?.jobId,
        error: result.reason,
      };
    });
  };

  const {
    isLoading,
    mutateAsync,
  } = useMutation({ mutationFn });

  return {
    isLoading,
    manualExport: mutateAsync,
  };
};
