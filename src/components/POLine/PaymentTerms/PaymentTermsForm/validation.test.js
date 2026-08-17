import {
  validateFiscalYearsCount,
  validateFundDistributionRequired,
  validateFundDistributionUniqueFunds,
  getFundDistributionTotalValidator,
} from './validation';

jest.mock('react-intl', () => ({
  FormattedMessage: ({ id }) => id,
}));

jest.mock('@folio/stripes-acq-components', () => ({
  handleFundDistributionValidationErrorResponse: jest.fn((_, setRemainingAmount) => {
    setRemainingAmount(100);

    return 'remaining amount error';
  }),
}));

describe('validateFiscalYearsCount', () => {
  const allValues = { paymentTerms: { startingFiscalYearId: 'fy1' } };

  it('should return undefined when term is falsy', () => {
    expect(validateFiscalYearsCount(0, allValues, { paymentTermsFiscalYearsLength: 1 })).toBeUndefined();
    expect(validateFiscalYearsCount(null, allValues, { paymentTermsFiscalYearsLength: 1 })).toBeUndefined();
  });

  it('should return undefined when startingFiscalYearId is not selected', () => {
    const vals = { paymentTerms: {} };

    expect(validateFiscalYearsCount(3, vals, { paymentTermsFiscalYearsLength: 1 })).toBeUndefined();
  });

  it('should return undefined when enough fiscal years are available', () => {
    expect(validateFiscalYearsCount(3, allValues, { paymentTermsFiscalYearsLength: 3 })).toBeUndefined();
    expect(validateFiscalYearsCount(2, allValues, { paymentTermsFiscalYearsLength: 5 })).toBeUndefined();
  });

  it('should return error message when term exceeds available fiscal years', () => {
    const result = validateFiscalYearsCount(5, allValues, { paymentTermsFiscalYearsLength: 3 });

    expect(result?.props?.id).toBe('ui-orders.poLine.paymentTerms.validation.notEnoughFYs');
  });
});

describe('validateFundDistributionUniqueFunds', () => {
  it('should return undefined for an empty array', async () => {
    expect(await validateFundDistributionUniqueFunds([])).toBeUndefined();
  });

  it('should return undefined when all combinations are unique', async () => {
    const value = [
      { fiscalYearId: 'fy1', fundDistributions: [{ fundId: 'f1', expenseClassId: 'ec1' }] },
      { fiscalYearId: 'fy2', fundDistributions: [{ fundId: 'f1', expenseClassId: 'ec1' }] }, // same fund+ec but different FY
    ];

    expect(await validateFundDistributionUniqueFunds(value)).toBeUndefined();
  });

  it('should allow the same fund+expenseClass pair in different fiscal years', async () => {
    const value = [
      { fiscalYearId: 'fy1', fundDistributions: [{ fundId: 'f1', expenseClassId: 'ec1' }] },
      { fiscalYearId: 'fy2', fundDistributions: [{ fundId: 'f1', expenseClassId: 'ec1' }] },
      { fiscalYearId: 'fy3', fundDistributions: [{ fundId: 'f1', expenseClassId: 'ec1' }] },
    ];

    expect(await validateFundDistributionUniqueFunds(value)).toBeUndefined();
  });

  it('should return error when the same fund+expenseClass pair appears twice in the same FY', async () => {
    const value = [
      {
        fiscalYearId: 'fy1',
        fundDistributions: [
          { fundId: 'f1', expenseClassId: 'ec1' },
          { fundId: 'f1', expenseClassId: 'ec1' }, // duplicate within same FY
        ],
      },
    ];

    expect((await validateFundDistributionUniqueFunds(value))?.props?.id).toBe('stripes-acq-components.validation.fundDistribution.uniqueFunds');
  });

  it('should handle FY entries with no fundDistributions', async () => {
    const value = [
      { fiscalYearId: 'fy1', fundDistributions: undefined },
      { fiscalYearId: 'fy2', fundDistributions: [{ fundId: 'f1', expenseClassId: 'ec1' }] },
    ];

    expect(await validateFundDistributionUniqueFunds(value)).toBeUndefined();
  });
});

describe('validateFundDistributionRequired', () => {
  it('should return undefined when value is falsy', async () => {
    expect(await validateFundDistributionRequired(null)).toBeUndefined();
    expect(await validateFundDistributionRequired(undefined)).toBeUndefined();
  });

  it('should return undefined when 2 or more distributions are present', async () => {
    expect(await validateFundDistributionRequired([{}, {}])).toBeUndefined();
    expect(await validateFundDistributionRequired([{}, {}, {}])).toBeUndefined();
  });

  it('should return error when fewer than 2 distributions are present', async () => {
    expect((await validateFundDistributionRequired([]))?.props?.id).toBe('ui-orders.poLine.paymentTerms.FYDistributions.validation.required');
    expect((await validateFundDistributionRequired([{}]))?.props?.id).toBe('ui-orders.poLine.paymentTerms.FYDistributions.validation.required');
  });
});

describe('getFundDistributionTotalValidator', () => {
  const setRemainingAmount = jest.fn();

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return undefined immediately when fundDistributions is empty', async () => {
    const validateFundDistributionTotal = jest.fn();
    const validator = getFundDistributionTotalValidator(validateFundDistributionTotal, setRemainingAmount);

    const result = await validator([{ fiscalYearId: 'fy1', fundDistributions: [] }]);

    expect(result).toBeUndefined();
    expect(validateFundDistributionTotal).not.toHaveBeenCalled();
  });

  it('should return undefined immediately when distributions lack fundId or value', async () => {
    const validateFundDistributionTotal = jest.fn();
    const validator = getFundDistributionTotalValidator(validateFundDistributionTotal, setRemainingAmount);

    const result = await validator([
      { fiscalYearId: 'fy1', fundDistributions: [{ fundId: 'f1' }] }, // missing value (undefined)
    ]);

    expect(result).toBeUndefined();
    expect(validateFundDistributionTotal).not.toHaveBeenCalled();
  });

  it('should call validateFundDistributionTotal when a distribution has value 0 (zero is valid)', async () => {
    const validateFundDistributionTotal = jest.fn(() => Promise.resolve());
    const validator = getFundDistributionTotalValidator(validateFundDistributionTotal, setRemainingAmount);

    await validator([
      { fiscalYearId: 'fy1', fundDistributions: [{ fundId: 'f1', value: 0 }] },
    ]);

    expect(validateFundDistributionTotal).toHaveBeenCalled();
  });

  it('should call validateFundDistributionTotal with flattened distributions', async () => {
    const validateFundDistributionTotal = jest.fn(() => Promise.resolve());
    const validator = getFundDistributionTotalValidator(validateFundDistributionTotal, setRemainingAmount);
    const distributions = [
      { fiscalYearId: 'fy1', fundDistributions: [{ fundId: 'f1', value: 50 }] },
      { fiscalYearId: 'fy2', fundDistributions: [{ fundId: 'f1', value: 50 }] },
    ];

    await validator(distributions);

    expect(validateFundDistributionTotal).toHaveBeenCalledWith([
      { fundId: 'f1', value: 50 },
      { fundId: 'f1', value: 50 },
    ]);
  });

  it('should call setRemainingAmount(0) and return undefined on success', async () => {
    const validateFundDistributionTotal = jest.fn(() => Promise.resolve());
    const validator = getFundDistributionTotalValidator(validateFundDistributionTotal, setRemainingAmount);

    const result = await validator([
      { fiscalYearId: 'fy1', fundDistributions: [{ fundId: 'f1', value: 100 }] },
    ]);

    expect(setRemainingAmount).toHaveBeenCalledWith(0);
    expect(result).toBeUndefined();
  });

  it('should call handleFundDistributionValidationErrorResponse on validation failure', async () => {
    const error = new Error('total mismatch');
    const validateFundDistributionTotal = jest.fn(() => Promise.reject(error));
    const validator = getFundDistributionTotalValidator(validateFundDistributionTotal, setRemainingAmount);

    const result = await validator([
      { fiscalYearId: 'fy1', fundDistributions: [{ fundId: 'f1', value: 50 }] },
    ]);

    expect(result).toBe('remaining amount error');
  });

  it('should reuse the in-flight promise when called a second time with the same payload', async () => {
    let resolveFirst;
    const firstPromise = new Promise(resolve => { resolveFirst = resolve; });
    const validateFundDistributionTotal = jest.fn(() => firstPromise);
    const validator = getFundDistributionTotalValidator(validateFundDistributionTotal, setRemainingAmount);
    const distributions = [
      { fiscalYearId: 'fy1', fundDistributions: [{ fundId: 'f1', value: 100 }] },
    ];

    const p1 = validator(distributions);
    const p2 = validator(distributions); // same payload — should reuse in-flight promise

    resolveFirst();
    await Promise.all([p1, p2]);

    // Only one actual PUT should be issued
    expect(validateFundDistributionTotal).toHaveBeenCalledTimes(1);
    expect(p1).toStrictEqual(p2);
  });

  it('should issue a new request when the payload changes between calls', async () => {
    const validateFundDistributionTotal = jest.fn(() => Promise.resolve());
    const validator = getFundDistributionTotalValidator(validateFundDistributionTotal, setRemainingAmount);

    await validator([{ fiscalYearId: 'fy1', fundDistributions: [{ fundId: 'f1', value: 50 }] }]);
    await validator([{ fiscalYearId: 'fy1', fundDistributions: [{ fundId: 'f1', value: 60 }] }]);

    expect(validateFundDistributionTotal).toHaveBeenCalledTimes(2);
  });
});
