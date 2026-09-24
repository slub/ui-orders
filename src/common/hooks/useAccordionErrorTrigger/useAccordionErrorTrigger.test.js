import { act, renderHook } from '@folio/jest-config-stripes/testing-library/react';

import { useAccordionErrorTrigger } from './useAccordionErrorTrigger';

const FIELDS_MAP = {
  title: 'itemDetails',
  cost: 'costDetails',
  vendor: 'vendorDetails',
};

const buildRef = (overrides = {}) => ({
  current: {
    setStatus: jest.fn(),
    onToggle: jest.fn(),
    ...overrides,
  },
});

const renderTrigger = (errors = {}, ref = buildRef()) => renderHook(
  ({ errors: e }) => useAccordionErrorTrigger({ errors: e, fieldsMap: FIELDS_MAP, accordionStatusRef: ref }),
  { initialProps: { errors } },
);

// Helper: extract the status produced by a setStatus updater call
const applyUpdater = (mockSetStatus, currentStatus = {}) => {
  const updater = mockSetStatus.mock.calls.at(-1)[0];

  return typeof updater === 'function'
    ? updater({ status: currentStatus })
    : { status: updater };
};

// ─── Effect: error-driven accordion opening ───────────────────────────────────

describe('useAccordionErrorTrigger — error-driven opening (effect)', () => {
  it('opens the accordion mapped to a field when that field gets an error', () => {
    const ref = buildRef();
    const { rerender } = renderTrigger({}, ref);

    act(() => rerender({ errors: { title: 'Required' } }));

    expect(ref.current.setStatus).toHaveBeenCalled();
    expect(applyUpdater(ref.current.setStatus, { itemDetails: false })).toEqual({
      status: { itemDetails: true },
    });
  });

  it('opens all accordions that have at least one errored field', () => {
    const ref = buildRef();
    const { rerender } = renderTrigger({}, ref);

    act(() => rerender({ errors: { title: 'Required', cost: 'Invalid' } }));

    const openedIds = ref.current.setStatus.mock.calls.map(([updater]) => {
      return Object.keys(updater({ status: {} }).status)[0];
    });

    expect(openedIds).toContain('itemDetails');
    expect(openedIds).toContain('costDetails');
  });

  it('does not call setStatus when there are no errors', () => {
    const ref = buildRef();

    renderTrigger({}, ref);

    expect(ref.current.setStatus).not.toHaveBeenCalled();
  });

  it('ignores field names that have no entry in fieldsMap', () => {
    const ref = buildRef();
    const { rerender } = renderTrigger({}, ref);

    act(() => rerender({ errors: { unknownField: 'error' } }));

    expect(ref.current.setStatus).not.toHaveBeenCalled();
  });

  it('re-opens an accordion when its error changes (same accordion, new render)', () => {
    const ref = buildRef();
    const { rerender } = renderTrigger({ title: 'Required' }, ref);

    const callsBefore = ref.current.setStatus.mock.calls.length;

    act(() => rerender({ errors: { title: 'Still required' } }));

    // errors object reference changed → effect re-runs → accordion re-opened
    expect(ref.current.setStatus.mock.calls.length).toBeGreaterThan(callsBefore);
  });

  it('does not close an accordion when its error is resolved', () => {
    const ref = buildRef();
    const { rerender } = renderTrigger({ title: 'Required' }, ref);

    ref.current.setStatus.mockClear();
    act(() => rerender({ errors: {} }));

    // No setStatus calls → accordion left in whatever state it was (open)
    expect(ref.current.setStatus).not.toHaveBeenCalled();
  });
});

// ─── onToggle: header-click guard ────────────────────────────────────────────

describe('useAccordionErrorTrigger — onToggle', () => {
  it('re-opens accordion when user tries to close one that has an error', () => {
    const ref = buildRef();
    const { result } = renderTrigger({ title: 'Required' }, ref);

    ref.current.setStatus.mockClear();
    act(() => result.current.onToggle({ id: 'itemDetails' }));

    expect(ref.current.setStatus).toHaveBeenCalled();
    expect(applyUpdater(ref.current.setStatus, { itemDetails: true })).toEqual({
      status: { itemDetails: true },
    });
    expect(ref.current.onToggle).not.toHaveBeenCalled();
  });

  it('delegates to the original onToggle for accordions without an error', () => {
    const ref = buildRef();
    const { result } = renderTrigger({ title: 'Required' }, ref);

    act(() => result.current.onToggle({ id: 'costDetails' }));

    expect(ref.current.onToggle).toHaveBeenCalledWith({ id: 'costDetails' });
  });

  it('delegates to original onToggle for an accordion with no corresponding field error', () => {
    const ref = buildRef();
    const { result } = renderTrigger({}, ref);

    act(() => result.current.onToggle({ id: 'itemDetails' }));

    expect(ref.current.onToggle).toHaveBeenCalledWith({ id: 'itemDetails' });
    expect(ref.current.setStatus).not.toHaveBeenCalled();
  });

  it('returns a stable reference when the errors object reference does not change', () => {
    const ref = buildRef();
    const errors = { title: 'Required' };
    const { result, rerender } = renderHook(
      ({ errors: e }) => useAccordionErrorTrigger({ errors: e, fieldsMap: FIELDS_MAP, accordionStatusRef: ref }),
      { initialProps: { errors } },
    );

    const first = result.current.onToggle;

    rerender({ errors }); // same reference → no recompute
    expect(result.current.onToggle).toBe(first);
  });
});

// ─── onExpandAllToggle: ExpandAllButton post-collapse fix ─────────────────────

describe('useAccordionErrorTrigger — onExpandAllToggle', () => {
  it('re-opens all accordions that have errors after a collapse-all', () => {
    const ref = buildRef();
    const { result } = renderTrigger({ title: 'Required', cost: 'Invalid' }, ref);

    ref.current.setStatus.mockClear();
    act(() => result.current.onExpandAllToggle());

    const openedIds = ref.current.setStatus.mock.calls.map(([updater]) => {
      return Object.keys(updater({ status: {} }).status)[0];
    });

    expect(openedIds).toContain('itemDetails');
    expect(openedIds).toContain('costDetails');
  });

  it('does nothing when there are no errors', () => {
    const ref = buildRef();
    const { result } = renderTrigger({}, ref);

    ref.current.setStatus.mockClear();
    act(() => result.current.onExpandAllToggle());

    expect(ref.current.setStatus).not.toHaveBeenCalled();
  });

  it('only re-opens errored accordions, leaving others untouched', () => {
    const ref = buildRef();
    const { result } = renderTrigger({ title: 'Required' }, ref);

    ref.current.setStatus.mockClear();
    act(() => result.current.onExpandAllToggle());

    const calledIds = ref.current.setStatus.mock.calls.map(([updater]) => {
      return Object.keys(updater({ status: {} }).status)[0];
    });

    expect(calledIds).toContain('itemDetails');
    expect(calledIds).not.toContain('costDetails');
    expect(calledIds).not.toContain('vendorDetails');
  });
});

// ─── collapseAll: keyboard shortcut handler ───────────────────────────────────

describe('useAccordionErrorTrigger — collapseAll', () => {
  it('collapses all non-errored accordions', () => {
    const ref = buildRef();
    const { result } = renderTrigger({ title: 'Required' }, ref);

    ref.current.setStatus.mockClear();
    act(() => result.current.collapseAll());

    expect(ref.current.setStatus).toHaveBeenCalled();
    const { status } = applyUpdater(ref.current.setStatus, {
      itemDetails: true,
      costDetails: true,
      vendorDetails: true,
    });

    expect(status.itemDetails).toBe(true);   // has error → stays open
    expect(status.costDetails).toBe(false);
    expect(status.vendorDetails).toBe(false);
  });

  it('collapses all accordions when there are no errors', () => {
    const ref = buildRef();
    const { result } = renderTrigger({}, ref);

    ref.current.setStatus.mockClear();
    act(() => result.current.collapseAll());

    const { status } = applyUpdater(ref.current.setStatus, {
      itemDetails: true,
      costDetails: true,
    });

    expect(status.itemDetails).toBe(false);
    expect(status.costDetails).toBe(false);
  });

  it('calls e.preventDefault() when an event is provided', () => {
    const ref = buildRef();
    const { result } = renderTrigger({}, ref);

    const e = { preventDefault: jest.fn() };

    act(() => result.current.collapseAll(e));

    expect(e.preventDefault).toHaveBeenCalled();
  });

  it('does not throw when called without an event', () => {
    const ref = buildRef();
    const { result } = renderTrigger({}, ref);

    expect(() => act(() => result.current.collapseAll())).not.toThrow();
  });

  it('is a no-op for setStatus when ref.current is null', () => {
    const ref = { current: null };
    const { result } = renderTrigger({}, ref);

    expect(() => act(() => result.current.collapseAll())).not.toThrow();
  });
});
