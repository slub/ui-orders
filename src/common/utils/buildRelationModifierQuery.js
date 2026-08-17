import { buildMultiOptionCqlQuery } from '@folio/stripes-acq-components';

export const buildRelationModifierQuery = (filterKey, relationModifier, filterValue) => {
  const modifiers = [{ name: relationModifier }];

  return buildMultiOptionCqlQuery(filterKey, filterValue, { modifiers });
};
