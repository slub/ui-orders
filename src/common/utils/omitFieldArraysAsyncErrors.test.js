import { ARRAY_ERROR } from 'final-form';

import { omitFieldArraysAsyncErrors } from './omitFieldArraysAsyncErrors';

const ASYNC_FIELD_ARRAY = 'fieldArrayWithAsyncValidation';

// Helpers to build the error shapes final-form produces.
const pendingArrayErrors = (itemErrors = []) => {
  const errors = [...itemErrors];

  errors[ARRAY_ERROR] = Promise.resolve(null);

  return errors;
};

const resolvedArrayErrors = (message = 'Invalid array', itemErrors = []) => {
  const errors = [...itemErrors];

  errors[ARRAY_ERROR] = message;

  return errors;
};

describe('omitFieldArraysAsyncErrors', () => {
  // ─── Existing: top-level (flat) fields ─────────────────────────────────────

  it('should omit field-array from form errors if it contains only async error of array itself', () => {
    const formErrors = { [ASYNC_FIELD_ARRAY]: pendingArrayErrors() };
    const errors = omitFieldArraysAsyncErrors(formErrors, [ASYNC_FIELD_ARRAY]);

    expect(errors).toEqual({});
  });

  it('should keep field-array in form errors object if it contains sync error of array itself', () => {
    const formErrors = { [ASYNC_FIELD_ARRAY]: resolvedArrayErrors() };
    const errors = omitFieldArraysAsyncErrors(formErrors, [ASYNC_FIELD_ARRAY]);

    expect(ASYNC_FIELD_ARRAY in errors).toBeTruthy();
  });

  it('should keep field-array in form errors object if it contains its fields\' errors', () => {
    const formErrors = { [ASYNC_FIELD_ARRAY]: pendingArrayErrors(['Test field is invalid']) };
    const errors = omitFieldArraysAsyncErrors(formErrors, [ASYNC_FIELD_ARRAY]);

    expect(ASYNC_FIELD_ARRAY in errors).toBeTruthy();
  });

  // ─── Nested path: ancestor cleanup ─────────────────────────────────────────

  it('should remove the nested field and prune its now-empty parent when async error is pending', () => {
    // Mirrors the real-world case: paymentTerms.fiscalYearDistributions has a pending Promise.
    // After omitting the leaf, { paymentTerms: {} } must not remain — that would incorrectly
    // mark the paymentTerms accordion as having an error.
    const formErrors = {
      paymentTerms: {
        fiscalYearDistributions: pendingArrayErrors(),
      },
    };

    const errors = omitFieldArraysAsyncErrors(formErrors, ['paymentTerms.fiscalYearDistributions']);

    expect(errors).toEqual({});
  });

  it('should remove only the leaf field when the parent still has other resolved errors', () => {
    // paymentTerms.totalPrice has a real error — the parent must survive after
    // fiscalYearDistributions (pending Promise) is pruned.
    const formErrors = {
      paymentTerms: {
        totalPrice: 'Required',
        fiscalYearDistributions: pendingArrayErrors(),
      },
    };

    const errors = omitFieldArraysAsyncErrors(formErrors, ['paymentTerms.fiscalYearDistributions']);

    expect(errors).toEqual({ paymentTerms: { totalPrice: 'Required' } });
  });

  it('should keep nested field when the pending Promise co-exists with resolved item errors', () => {
    const formErrors = {
      paymentTerms: {
        fiscalYearDistributions: pendingArrayErrors([undefined, 'Fund is required']),
      },
    };

    const errors = omitFieldArraysAsyncErrors(formErrors, ['paymentTerms.fiscalYearDistributions']);

    expect('fiscalYearDistributions' in errors.paymentTerms).toBeTruthy();
  });

  it('should keep nested field when the array error is a resolved string (not a Promise)', () => {
    const formErrors = {
      paymentTerms: {
        fiscalYearDistributions: resolvedArrayErrors('At least 2 fiscal years are required'),
      },
    };

    const errors = omitFieldArraysAsyncErrors(formErrors, ['paymentTerms.fiscalYearDistributions']);

    expect('fiscalYearDistributions' in errors.paymentTerms).toBeTruthy();
  });

  // ─── Deep nesting (3+ levels) ───────────────────────────────────────────────

  it('should cascade-prune all empty ancestors for a 3-level deep path', () => {
    const formErrors = {
      a: {
        b: {
          c: pendingArrayErrors(),
        },
      },
    };

    const errors = omitFieldArraysAsyncErrors(formErrors, ['a.b.c']);

    expect(errors).toEqual({});
  });

  it('should stop pruning when an intermediate ancestor still has sibling keys', () => {
    // After removing a.b.c, a.b still has d — so only a.b.c is removed.
    const formErrors = {
      a: {
        b: {
          c: pendingArrayErrors(),
          d: 'Some error',
        },
      },
    };

    const errors = omitFieldArraysAsyncErrors(formErrors, ['a.b.c']);

    expect(errors).toEqual({ a: { b: { d: 'Some error' } } });
  });

  // ─── Multiple async field arrays ────────────────────────────────────────────

  it('should omit all pending-Promise fields when multiple async arrays are registered', () => {
    const formErrors = {
      fundDistribution: pendingArrayErrors(),
      paymentTerms: {
        fiscalYearDistributions: pendingArrayErrors(),
      },
    };

    const errors = omitFieldArraysAsyncErrors(formErrors, [
      'fundDistribution',
      'paymentTerms.fiscalYearDistributions',
    ]);

    expect(errors).toEqual({});
  });

  it('should omit only the pending field when multiple arrays are registered but one has resolved', () => {
    const formErrors = {
      fundDistribution: resolvedArrayErrors('Required'),
      paymentTerms: {
        fiscalYearDistributions: pendingArrayErrors(),
      },
    };

    const errors = omitFieldArraysAsyncErrors(formErrors, [
      'fundDistribution',
      'paymentTerms.fiscalYearDistributions',
    ]);

    // The resolved error on fundDistribution must survive; paymentTerms must be fully pruned.
    // Note: cloneDeep strips Symbol keys, so ARRAY_ERROR content is not checked here — only
    // field presence is within this function's contract.
    expect('fundDistribution' in errors).toBeTruthy();
    expect('paymentTerms' in errors).toBeFalsy();
  });

  // ─── Edge cases ─────────────────────────────────────────────────────────────

  it('should not mutate the original formErrors object', () => {
    const fieldErrors = pendingArrayErrors();
    const formErrors = { [ASYNC_FIELD_ARRAY]: fieldErrors };
    const frozen = JSON.parse(JSON.stringify({ [ASYNC_FIELD_ARRAY]: 'snapshot' }));

    omitFieldArraysAsyncErrors(formErrors, [ASYNC_FIELD_ARRAY]);

    // The original reference must be untouched (final-form owns it).
    expect(ASYNC_FIELD_ARRAY in formErrors).toBeTruthy();
    expect(frozen[ASYNC_FIELD_ARRAY]).toBe('snapshot');
  });

  it('should return a clone of formErrors unchanged when asyncFieldArrays is empty', () => {
    const formErrors = { someField: 'error' };
    const errors = omitFieldArraysAsyncErrors(formErrors, []);

    expect(errors).toEqual(formErrors);
    expect(errors).not.toBe(formErrors);
  });

  it('should return a clone unchanged when the field is not present in formErrors', () => {
    const formErrors = { otherField: 'error' };
    const errors = omitFieldArraysAsyncErrors(formErrors, [ASYNC_FIELD_ARRAY]);

    expect(errors).toEqual(formErrors);
  });
});
