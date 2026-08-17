import { renderHook } from '@folio/jest-config-stripes/testing-library/react';

import { useAcqMethods } from '../useAcqMethods';
import { useDeprecatedAcqMethods } from './useDeprecatedAcqMethods';

jest.mock('../useAcqMethods', () => ({
  useAcqMethods: jest.fn(),
}));

const ACTIVE_METHOD = { id: 'active', value: 'Active method' };
const DEPRECATED_METHOD = { id: 'deprecated', value: 'Deprecated method', deprecated: true };

const mockAcqMethods = (isLoading = false) => {
  useAcqMethods.mockClear().mockReturnValue({
    acqMethods: [ACTIVE_METHOD, DEPRECATED_METHOD],
    isLoading,
  });
};

describe('useDeprecatedAcqMethods', () => {
  beforeEach(() => mockAcqMethods());

  it('should return the deprecated methods used by the order lines with their line numbers', () => {
    const { result } = renderHook(() => useDeprecatedAcqMethods([
      { acquisitionMethod: DEPRECATED_METHOD.id, poLineNumber: 'POL-1' },
      { acquisitionMethod: ACTIVE_METHOD.id, poLineNumber: 'POL-2' },
      { acquisitionMethod: DEPRECATED_METHOD.id, poLineNumber: 'POL-3' },
    ]));

    expect(result.current.deprecatedAcqMethods).toEqual([
      { ...DEPRECATED_METHOD, poLineNumbers: ['POL-1', 'POL-3'] },
    ]);
  });

  it('should return an empty list when no line uses a deprecated method', () => {
    const { result } = renderHook(() => useDeprecatedAcqMethods([{ acquisitionMethod: ACTIVE_METHOD.id }]));

    expect(result.current.deprecatedAcqMethods).toEqual([]);
  });

  it('should list a deprecated method with no line numbers when its lines are not numbered', () => {
    const { result } = renderHook(() => useDeprecatedAcqMethods([{ acquisitionMethod: DEPRECATED_METHOD.id }]));

    expect(result.current.deprecatedAcqMethods).toEqual([
      { ...DEPRECATED_METHOD, poLineNumbers: [] },
    ]);
  });

  it('should return an empty list when there are no order lines', () => {
    const { result } = renderHook(() => useDeprecatedAcqMethods());

    expect(result.current.deprecatedAcqMethods).toEqual([]);
  });

  it('should not report deprecated methods while acq methods are loading', () => {
    mockAcqMethods(true);

    const { result } = renderHook(() => useDeprecatedAcqMethods([{ acquisitionMethod: DEPRECATED_METHOD.id }]));

    expect(result.current.deprecatedAcqMethods).toEqual([]);
    expect(result.current.isLoading).toBe(true);
  });
});
