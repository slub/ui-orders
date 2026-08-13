import {
  useEffect,
  useState,
} from 'react';
import { useQuery } from 'react-query';

import {
  useNamespace,
  useOkapiKy,
} from '@folio/stripes/core';

export const EXPORT_JOBS_API = 'data-export-spring/jobs';

export const EXPORT_JOB_STATUSES = {
  SCHEDULED: 'SCHEDULED',
  IN_PROGRESS: 'IN_PROGRESS',
  SUCCESSFUL: 'SUCCESSFUL',
  FAILED: 'FAILED',
};

const FINAL_STATUSES = [EXPORT_JOB_STATUSES.SUCCESSFUL, EXPORT_JOB_STATUSES.FAILED];

export const POLL_INTERVAL = 2000;
export const POLL_TIMEOUT = 20000;

const isFinished = (job) => FINAL_STATUSES.includes(job?.status);

/**
 * Follows up on the jobs created by a manual export. The trigger request only
 * confirms that a job was created; everything that fails afterwards - a broken
 * configuration, a missing template, or no matching PO lines at all - shows up
 * only here, in the job's `errorDetails`.
 *
 * Execution runs through Kafka, so a result may take a while or not arrive while
 * the modal is open. Polling therefore stops after POLL_TIMEOUT and the caller
 * falls back to pointing at the export manager.
 */
export const useManualExportJobs = (jobIds = []) => {
  const ky = useOkapiKy();
  const [namespace] = useNamespace({ key: 'manual-export-jobs' });
  const [refetchInterval, setRefetchInterval] = useState(POLL_INTERVAL);
  const [hasTimedOut, setHasTimedOut] = useState(false);

  // Restart whenever a new export was triggered.
  useEffect(() => {
    setRefetchInterval(jobIds.length ? POLL_INTERVAL : 0);
    setHasTimedOut(false);

    if (!jobIds.length) return undefined;

    const timer = setTimeout(() => {
      setRefetchInterval(0);
      setHasTimedOut(true);
    }, POLL_TIMEOUT);

    return () => clearTimeout(timer);
  }, [jobIds]);

  const { data = [] } = useQuery({
    queryKey: [namespace, jobIds],
    enabled: Boolean(jobIds.length),
    refetchInterval,
    queryFn: ({ signal }) => Promise.all(
      jobIds.map((jobId) => ky.get(`${EXPORT_JOBS_API}/${jobId}`, { signal }).json()),
    ),
  });

  const isComplete = Boolean(data.length) && data.every(isFinished);

  useEffect(() => {
    if (isComplete) setRefetchInterval(0);
  }, [isComplete]);

  return {
    jobs: data,
    isComplete,
    hasTimedOut,
  };
};
