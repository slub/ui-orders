import PropTypes from 'prop-types';
import { useCallback } from 'react';
import { Field } from 'react-final-form';
import { FieldArray } from 'react-final-form-arrays';
import {
  FormattedMessage,
  useIntl,
} from 'react-intl';

import { Loading } from '@folio/stripes/components';
import { RepeatableFieldWithValidation } from '@folio/stripes-acq-components';

import { usePaymentTermsContext } from '../PaymentTermsContext';
import { FiscalYearsDistributionTerm } from './FiscalYearsDistributionTerm';

// `calculateFundDistributionAmountsAndTotal` indexes amounts over the flat list of ALL
// fund distributions across every FY.  FundDistributionFieldsFinalComponent renders one
// FY at a time and expects 0-based local indices, so compute the slice offset for this
// FY entry and remap the relevant slice.
const getFyAmounts = (fiscalYearDistributions, index, amounts) => {
  const offset = fiscalYearDistributions
    .slice(0, index)
    .reduce((sum, fy) => sum + (fy.fundDistributions?.length || 0), 0);

  return (fiscalYearDistributions[index].fundDistributions || []).reduce((acc, _, i) => {
    return {
      ...acc,
      [i]: amounts[offset + i],
    };
  }, {});
};

export const FiscalYearsDistribution = ({
  amounts,
  filterFunds,
  hasValidationError,
  isAddFYButtonDisabled,
  isAddFYButtonHidden,
  isLoading,
  isNonInteractive,
  legend,
  name,
  onAddFiscalYear,
  onExpenseClassChange,
  onRemoveFiscalYear,
  onRemoveFundDistribution,
  totalAmount,
  validate,
}) => {
  const intl = useIntl();

  const {
    currency,
    funds,
    paymentTermsFiscalYearsMap,
  } = usePaymentTermsContext();

  const renderField = useCallback((fieldName, index, fields) => {
    const handleRemoveFiscalYear = () => {
      onRemoveFiscalYear(index, fields);
    };
    const showRemoveButton = (fields.length - 1 === index) && !isNonInteractive; // Only show remove button for the last fiscal year distribution and when the form is not in non-interactive mode
    const fiscalYearId = fields.value[index].fiscalYearId;
    const fundDistributions = fields.value[index].fundDistributions || [];
    const label = intl.formatMessage(
      { id: 'ui-orders.poLine.paymentTerms.FYDistributions.card.label' },
      {
        code: paymentTermsFiscalYearsMap.get(fiscalYearId)?.code || intl.formatMessage({ id: 'stripes-acq-components.invalidReference' }),
        sequenceNumber: index + 1,
      },
    );
    // Point distributionType and value at the outer FY FieldArray so that changing
    // an individual fund value re-triggers validateFiscalYearsDistributions.
    // react-final-form does not cascade validation upward automatically — explicit
    // cross-reference is the only way to reach the outer array's validator.
    const validateFieldsMap = {
      fundId: [],
      expenseClassId: [],
      distributionType: [name],
      value: [name],
    };

    const fyAmounts = getFyAmounts(fields.value, index, amounts);

    return (
      <FiscalYearsDistributionTerm
        amounts={fyAmounts}
        currency={currency}
        filterFunds={filterFunds}
        fiscalYearId={fiscalYearId}
        fundDistributions={fundDistributions}
        funds={funds}
        label={label}
        name={`${fieldName}.fundDistributions`}
        onExpenseClassChange={onExpenseClassChange}
        onRemoveFiscalYear={handleRemoveFiscalYear}
        onRemoveFundDistribution={onRemoveFundDistribution}
        showRemoveButton={showRemoveButton}
        totalAmount={totalAmount}
        validateFieldsMap={validateFieldsMap}
      />
    );
  }, [
    amounts,
    currency,
    filterFunds,
    funds,
    intl,
    isNonInteractive,
    name,
    onExpenseClassChange,
    onRemoveFiscalYear,
    onRemoveFundDistribution,
    paymentTermsFiscalYearsMap,
    totalAmount,
  ]);

  if (isLoading) {
    return <Loading />;
  }

  return (
    <>
      {
        // This is a workaround to show validation error message for the whole fund distribution field array
        hasValidationError && (
          <Field
            name={`${name}-error`}
            validate={() => true}
            validateFields={[]}
            render={() => <></>}
          />
        )
      }
      <FieldArray
        addLabel={isAddFYButtonHidden ? null : <FormattedMessage id="ui-orders.poLine.paymentTerms.FYDistributions.action.add" />}
        component={RepeatableFieldWithValidation}
        id={name}
        isNonInteractive={isNonInteractive}
        legend={legend}
        name={name}
        onAdd={onAddFiscalYear}
        onRemove={false} // Custom remove button is rendered in the FiscalYearsDistributionTerm component
        canAdd={!isAddFYButtonDisabled}
        renderField={renderField}
        validate={validate}
      />
    </>
  );
};

FiscalYearsDistribution.propTypes = {
  amounts: PropTypes.object.isRequired,
  isAddFYButtonDisabled: PropTypes.bool,
  isAddFYButtonHidden: PropTypes.bool,
  isLoading: PropTypes.bool,
  isNonInteractive: PropTypes.bool,
  name: PropTypes.string.isRequired,
  onAddFiscalYear: PropTypes.func.isRequired,
  onExpenseClassChange: PropTypes.func.isRequired,
  onRemoveFiscalYear: PropTypes.func.isRequired,
  onRemoveFundDistribution: PropTypes.func,
  totalAmount: PropTypes.number.isRequired,
  validate: PropTypes.func,
};
