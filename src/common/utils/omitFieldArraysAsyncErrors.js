import { ARRAY_ERROR } from 'final-form';
import {
  cloneDeep,
  get,
  unset,
} from 'lodash';

/*
  Final form async validation of a FieldArray returns a Promise (not a resolved value) and
  stores it under the special "FINAL_FORM/array-error" key.  Until the Promise settles, the
  form's `errors` object always contains that key, making the form appear invalid even when
  there are no real errors yet.

  This utility strips those pending-Promise entries so that downstream consumers (e.g.
  accordion error-status indicators) only react to fully-resolved validation results.

  Issue: https://github.com/final-form/react-final-form-arrays/issues/176
*/

// Returns true when `value` is a non-null, non-array plain object with no own keys.
const isEmptyObject = (value) => (
  value !== null &&
  typeof value === 'object' &&
  !Array.isArray(value) &&
  Object.keys(value).length === 0
);

// Returns true when the ARRAY_ERROR stored at `field` is still a pending Promise
// (i.e. `.then` is a function) rather than a resolved error string.
const hasPendingArrayError = (errors, field) => (
  typeof get(errors, `${field}[${ARRAY_ERROR}].then`) === 'function'
);

// Returns true when the field array contains at least one resolved (truthy) item-level error.
// A pending Promise does NOT count — this guards against treating an in-flight validation
// as an already-resolved failure.
const hasResolvedItemErrors = (errors, field) => (
  get(errors, field, []).some(Boolean)
);

// Removes all empty-object ancestors of `field` up to (but not including) the root.
// This is necessary because lodash's `unset` removes the leaf key but leaves parent
// objects intact.  An empty `{ paymentTerms: {} }` would otherwise still appear as an
// error key to consumers that iterate `Object.keys(errors)`.
const pruneEmptyAncestors = (obj, field) => {
  const segments = field.split('.');

  // Walk from the deepest parent up to (not including) the root key.
  // Use reduceRight so the traversal is declarative rather than a manual index loop.
  segments.slice(1).reduceRight((_, __, i) => {
    const parentPath = segments.slice(0, i + 1).join('.');
    const parentValue = get(obj, parentPath);

    if (isEmptyObject(parentValue)) {
      unset(obj, parentPath);
    }
    // reduceRight requires a return value; the accumulator is not used.

    return null;
  }, null);
};

// Removes a single field's pending-Promise error from the cloned errors object,
// then prunes any ancestor objects that are now empty.
const omitPendingArrayError = (cloned, originalErrors, field) => {
  // Only act when the ARRAY_ERROR is a Promise AND there are no resolved item errors.
  // If the Promise has already settled to a real error string we must not strip it.
  if (!hasPendingArrayError(originalErrors, field) || hasResolvedItemErrors(originalErrors, field)) {
    return;
  }

  unset(cloned, field);
  pruneEmptyAncestors(cloned, field);
};

export const omitFieldArraysAsyncErrors = (formErrors, asyncFieldArrays = []) => {
  // Deep-clone first so the original `formErrors` reference (owned by final-form) is
  // never mutated — final-form treats its state as immutable.
  const cloned = cloneDeep(formErrors);

  asyncFieldArrays.forEach((field) => omitPendingArrayError(cloned, formErrors, field));

  return cloned;
};
