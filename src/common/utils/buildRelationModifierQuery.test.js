/* Developed collaboratively using AI (GitHub Copilot) */

import { buildRelationModifierQuery } from './buildRelationModifierQuery';

describe('buildRelationModifierQuery', () => {
  it('should build query with single filter value', () => {
    const filterKey = 'status';
    const relationModifier = '@eq';
    const filterValue = 'active';
    const expectedQuery = 'status =/@eq "active"';

    const result = buildRelationModifierQuery(filterKey, relationModifier, filterValue);

    expect(result).toBe(expectedQuery);
  });

  it('should build query with multiple filter values', () => {
    const filterKey = 'status';
    const relationModifier = '@eq';
    const filterValue = ['active', 'inactive'];
    const expectedQuery = 'status =/@eq ("active" OR "inactive")';

    const result = buildRelationModifierQuery(filterKey, relationModifier, filterValue);

    expect(result).toBe(expectedQuery);
  });
});
