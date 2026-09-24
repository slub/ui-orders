import { useCallback } from 'react';

export const useAccordionStatus = (accordionStatusRef) => {
  const triggerAccordion = useCallback((id, open = true) => {
    accordionStatusRef.current?.setStatus(cur => ({
      status: { ...cur.status, [id]: open },
    }));
  }, [accordionStatusRef]);

  return { triggerAccordion };
};
