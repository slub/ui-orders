import { renderHook } from '@folio/jest-config-stripes/testing-library/react';

import { useAccordionStatus } from './useAccordionStatus';

const buildRef = (overrides = {}) => ({
  current: {
    setStatus: jest.fn(),
    ...overrides,
  },
});

describe('useAccordionStatus', () => {
  it('returns a triggerAccordion function', () => {
    const ref = buildRef();
    const { result } = renderHook(() => useAccordionStatus(ref));

    expect(typeof result.current.triggerAccordion).toBe('function');
  });

  describe('triggerAccordion', () => {
    it('calls setStatus with open=true by default', () => {
      const ref = buildRef();
      const { result } = renderHook(() => useAccordionStatus(ref));

      result.current.triggerAccordion('myAccordion');

      expect(ref.current.setStatus).toHaveBeenCalledTimes(1);
      const updater = ref.current.setStatus.mock.calls[0][0];

      expect(updater({ status: { myAccordion: false } })).toEqual({
        status: { myAccordion: true },
      });
    });

    it('calls setStatus with open=false when explicitly passed', () => {
      const ref = buildRef();
      const { result } = renderHook(() => useAccordionStatus(ref));

      result.current.triggerAccordion('myAccordion', false);

      const updater = ref.current.setStatus.mock.calls[0][0];

      expect(updater({ status: { myAccordion: true } })).toEqual({
        status: { myAccordion: false },
      });
    });

    it('preserves other accordion states when updating', () => {
      const ref = buildRef();
      const { result } = renderHook(() => useAccordionStatus(ref));

      result.current.triggerAccordion('target', true);

      const updater = ref.current.setStatus.mock.calls[0][0];

      expect(updater({ status: { target: false, other: true } })).toEqual({
        status: { target: true, other: true },
      });
    });

    it('is a no-op when ref.current is null', () => {
      const ref = { current: null };
      const { result } = renderHook(() => useAccordionStatus(ref));

      expect(() => result.current.triggerAccordion('any')).not.toThrow();
    });

    it('returns a stable reference across re-renders', () => {
      const ref = buildRef();
      const { result, rerender } = renderHook(() => useAccordionStatus(ref));

      const first = result.current.triggerAccordion;

      rerender();
      expect(result.current.triggerAccordion).toBe(first);
    });
  });
});
