import groupBy from 'lodash/groupBy';
import { useMemo } from 'react';

import { useAcqMethods } from '../useAcqMethods';

const EMPTY_ARRAY = [];

// Returns the deprecated acquisition methods referenced by the given order lines.
export const useDeprecatedAcqMethods = (orderLines = EMPTY_ARRAY) => {
  const { acqMethods, isLoading } = useAcqMethods();

  const deprecatedAcqMethods = useMemo(() => {
    if (isLoading || !acqMethods?.length || !orderLines?.length) return EMPTY_ARRAY;

    const linesByMethodId = groupBy(
      orderLines.filter(({ acquisitionMethod }) => acquisitionMethod),
      'acquisitionMethod',
    );

    return acqMethods
      .filter(({ id, deprecated }) => deprecated && linesByMethodId[id])
      .map((method) => ({
        ...method,
        poLineNumbers: linesByMethodId[method.id]
          .map(({ poLineNumber }) => poLineNumber)
          .filter(Boolean),
      }));
  }, [acqMethods, isLoading, orderLines]);

  return { deprecatedAcqMethods, isLoading };
};
