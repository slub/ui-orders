import { flatMap, uniqBy } from 'lodash';
import { FormattedMessage } from 'react-intl';

import { handleFundDistributionValidationErrorResponse } from '@folio/stripes-acq-components';

export const validateFiscalYearsCount = (term, vals, { paymentTermsFiscalYearsLength }) => {
  return (
    term
    && vals?.paymentTerms?.startingFiscalYearId // Starting fiscal year must be selected
    && paymentTermsFiscalYearsLength < term // There are not enough fiscal years available to cover the prepayment term
  )
    ? <FormattedMessage id="ui-orders.poLine.paymentTerms.validation.notEnoughFYs" />
    : undefined;
};

export const validateFundDistributionUniqueFunds = async (values) => {
  const fundDistributions = flatMap(
    values,
    (fy) => (fy.fundDistributions || []).map((fund) => ({ ...fund, fiscalYearId: fy.fiscalYearId })),
  );
  // fiscalYearId is part of the key: the same fund+expenseClass pair is allowed to
  // appear in multiple FYs (that is the point of multi-year payment), but is a
  // duplicate error if it appears more than once within the same FY.
  const deduplicated = uniqBy(fundDistributions, (fund) => `${fund.fundId}${fund.expenseClassId}${fund.fiscalYearId}`);

  return deduplicated.length && deduplicated.length !== fundDistributions.length
    ? <FormattedMessage id="stripes-acq-components.validation.fundDistribution.uniqueFunds" />
    : undefined;
};

export const validateFundDistributionRequired = async (v) => {
  return v && v.length < 2
    ? <FormattedMessage id="ui-orders.poLine.paymentTerms.FYDistributions.validation.required" />
    : undefined;
};

export const getFundDistributionTotalValidator = (validateFundDistributionTotal, setRemainingAmount) => {
  // react-final-form fires the validator on both onChange and onBlur for the same
  // user interaction.  The closure tracks the in-flight promise so a second call
  // with the same payload reuses the existing PUT rather than issuing a duplicate.
  let pendingKey = null;
  let pendingPromise = null;

  return async (value) => {
    const fundDistributions = value?.reduce((acc, curr) => [...acc, ...(curr.fundDistributions || [])], []);

    if (!fundDistributions?.length || !fundDistributions.every((fd) => fd?.fundId && fd?.value != null)) {
      pendingKey = null;
      pendingPromise = null;

      return undefined;
    }

    const key = JSON.stringify(fundDistributions);

    if (key === pendingKey && pendingPromise) {
      return pendingPromise;
    }

    pendingKey = key;
    pendingPromise = validateFundDistributionTotal(fundDistributions)
      .then(() => {
        setRemainingAmount(0);

        return undefined;
      })
      .catch((error) => handleFundDistributionValidationErrorResponse(error, setRemainingAmount))
      .finally(() => {
        if (pendingKey === key) {
          pendingKey = null;
          pendingPromise = null;
        }
      });

    return pendingPromise;
  };
};
