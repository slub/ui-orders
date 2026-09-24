import { useCallback, useEffect, useMemo } from 'react';

import { useAccordionStatus } from '../useAccordionStatus';

export const useAccordionErrorTrigger = ({ errors, fieldsMap, accordionStatusRef }) => {
  const { triggerAccordion } = useAccordionStatus(accordionStatusRef);

  const erroredAccordionIds = useMemo(() => new Set(
    Object.keys(errors).map(f => fieldsMap[f]).filter(Boolean),
  ), [errors, fieldsMap]);

  useEffect(() => {
    erroredAccordionIds.forEach(id => triggerAccordion(id, true));
  }, [erroredAccordionIds, triggerAccordion]);

  // For AccordionSet's onToggle — prevents header clicks from closing errored accordions
  const onToggle = useCallback(({ id }) => {
    if (erroredAccordionIds.has(id)) {
      triggerAccordion(id, true);
    } else {
      accordionStatusRef.current?.onToggle({ id });
    }
  }, [erroredAccordionIds, triggerAccordion, accordionStatusRef]);

  // For ExpandAllButton's onToggle prop — re-opens errored accordions after collapse-all
  const onExpandAllToggle = useCallback(() => {
    erroredAccordionIds.forEach(id => triggerAccordion(id, true));
  }, [erroredAccordionIds, triggerAccordion]);

  // Replaces collapseAllSections keyboard shortcut — keeps errored accordions open
  const collapseAll = useCallback((e) => {
    e?.preventDefault();
    accordionStatusRef.current?.setStatus(cur => ({
      status: Object.keys(cur.status).reduce((acc, id) => ({
        ...acc,
        [id]: erroredAccordionIds.has(id),
      }), {}),
    }));
  }, [erroredAccordionIds, accordionStatusRef]);

  return { onToggle, onExpandAllToggle, collapseAll };
};
