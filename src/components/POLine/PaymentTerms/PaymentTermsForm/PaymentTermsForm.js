import PropTypes from 'prop-types';
import {
  useCallback,
  useMemo,
  useState,
} from 'react';
import {
  Field,
  useForm,
  useFormState,
} from 'react-final-form';
import { FormattedMessage } from 'react-intl';

import {
  Col,
  InfoPopover,
  Loading,
  Row,
} from '@folio/stripes/components';
import {
  AmountWithCurrencyField,
  composeValidators,
  composeValidatorsAsync,
  FieldSelectionFinal,
  TextField,
  useShowCallout,
  validateRequired,
  validateRequiredNotNegative,
} from '@folio/stripes-acq-components';

import { FiscalYearsDistribution } from './FiscalYearsDistribution';
import { usePaymentTermsContext } from './PaymentTermsContext';
import {
  getFundDistributionTotalValidator,
  validateFiscalYearsCount,
  validateFundDistributionRequired,
  validateFundDistributionUniqueFunds,
} from './validation';

export const PaymentTermsForm = ({
  amounts,
  disabled = false,
  filterFunds,
  isLoading = false,
  isNonInteractive = false,
  isTemplate = false,
  onStartingFYChange,
  onExpenseClassChange,
  validateFundDistributionTotal,
}) => {
  const [isFundDistributionValidating, setIsFundDistributionValidating] = useState(false);
  const [remainingAmount, setRemainingAmount] = useState();
  // Used as workaround for react-final-form issue with async validation of field arrays:
  const [hasValidationError, setHasValidationError] = useState(false);
  const showCallout = useShowCallout();

  const {
    currency,
    paymentTermsFiscalYears,
    rootFieldName,
    startingFiscalYears,
  } = usePaymentTermsContext();

  const { change } = useForm();
  const { values } = useFormState();

  const {
    multiYearPayment,
    paymentTerms: {
      fiscalYearDistributions,
      startingFiscalYearId,
      totalPrice,
    } = {},
  } = values;

  const isMultiYearPayment = Boolean(multiYearPayment); // If multi-year payment is not selected, disable the form

  const isAddFYButtonHidden = (
    isNonInteractive
    || !isMultiYearPayment
    || !startingFiscalYearId
  );

  const isAddFYButtonDisabled = (
    disabled
    || isLoading // Fiscal years are not being fetched
    || !paymentTermsFiscalYears?.length // There are no available fiscal years to add
    || fiscalYearDistributions?.length >= paymentTermsFiscalYears?.length // All available fiscal years have already been added
  );

  const isRequired = !isTemplate && isMultiYearPayment;

  const startingFiscalYearOptions = useMemo(() => {
    return startingFiscalYears.map(({ code, id: fiscalYearId }) => ({ value: fiscalYearId, label: code }));
  }, [startingFiscalYears]);

  const displayCalculatedRemainingAmount = (
    fiscalYearDistributions?.length
    && fiscalYearDistributions.some(({ fundDistributions }) => fundDistributions?.length)
    && remainingAmount !== undefined
  );
  const remainingAmountNode = (
    <FormattedMessage
      id="stripes-acq-components.fundDistribution.remainingAmount"
      values={{
        remainingAmount: (
          <AmountWithCurrencyField
            currency={currency}
            amount={displayCalculatedRemainingAmount ? remainingAmount : totalPrice}
          />
        ),
      }}
    />
  );

  const onAddFiscalYearDistribution = useCallback((fields) => {
    const nextFiscalYearId = paymentTermsFiscalYears[fields.length]?.id;

    // If there are no more fiscal years available to add, show an error message and return early
    if (!nextFiscalYearId) {
      showCallout({
        messageId: 'ui-orders.poLine.paymentTerms.FYDistributions.validation.noMoreFYs',
        type: 'error',
      });

      return;
    }

    change(`${rootFieldName}.prepaymentTerm`, fields.length + 1);
    fields.push({
      fiscalYearId: nextFiscalYearId,
      fundDistributions: [],
    });
  }, [change, rootFieldName, paymentTermsFiscalYears, showCallout]);

  const onRemoveFiscalYearDistribution = useCallback((index, fields) => {
    change(`${rootFieldName}.prepaymentTerm`, Math.max(fields.length - 1, 0));
    fields.remove(index);
  }, [change, rootFieldName]);

  const onRemoveFundDistribution = useCallback((fields, index) => {
    if (fields.length === 1) setRemainingAmount(undefined);
    fields.remove(index);
  }, []);

  const validatePrepaymentTerm = useCallback((value, allValues) => {
    return composeValidators(
      validateFiscalYearsCount,
      validateRequiredNotNegative,
    )(value, allValues, { paymentTermsFiscalYearsLength: paymentTermsFiscalYears?.length });
  }, [paymentTermsFiscalYears?.length]);

  // Must be a stable instance (useMemo, not recreated inside the callback) so the
  // closure's pendingKey/pendingPromise state persists across the onChange and onBlur
  // runs that react-final-form fires for the same user interaction.
  const fundDistributionTotalValidator = useMemo(
    () => getFundDistributionTotalValidator(validateFundDistributionTotal, setRemainingAmount),
    [validateFundDistributionTotal],
  );

  const validateFiscalYearsDistributions = useCallback(async (value) => {
    setIsFundDistributionValidating(true);

    try {
      const error = await composeValidatorsAsync(
        validateFundDistributionRequired,
        validateFundDistributionUniqueFunds,
        fundDistributionTotalValidator,
      )(value);

      setHasValidationError(Boolean(error));

      return error;
    } finally {
      setIsFundDistributionValidating(false);
    }
  }, [fundDistributionTotalValidator]);

  return (
    <>
      <Row>
        <Col xs={3}>
          <Field
            component={TextField}
            disabled={!isMultiYearPayment}
            label={<FormattedMessage id="ui-orders.poLine.paymentTerms.totalPrice" />}
            name={`${rootFieldName}.totalPrice`}
            required={isRequired}
            type="number"
            validate={isRequired ? validateRequiredNotNegative : undefined}
            validateFields={[`${rootFieldName}.fiscalYearDistributions`]}
          />
        </Col>
        <Col xs={3}>
          <Field
            component={TextField}
            disabled
            label={<FormattedMessage id="ui-orders.poLine.paymentTerms.prepaymentTerm" />}
            name={`${rootFieldName}.prepaymentTerm`}
            required={isRequired}
            type="number"
            validate={(isRequired && !isLoading) ? validatePrepaymentTerm : undefined}
            validateFields={[]}
          />
        </Col>
        <Col xs={3}>
          <FieldSelectionFinal
            dataOptions={startingFiscalYearOptions}
            disabled={disabled || !isMultiYearPayment || isLoading}
            label={(
              <>
                <FormattedMessage id="ui-orders.poLine.paymentTerms.startingFY" />
                <InfoPopover content={<FormattedMessage id="ui-orders.poLine.paymentTerms.startingFY.infoPopover" />} />
              </>
            )}
            name={`${rootFieldName}.startingFiscalYearId`}
            onChange={onStartingFYChange}
            required={isRequired}
            validate={isRequired ? validateRequired : undefined}
            validateFields={[`${rootFieldName}.prepaymentTerm`, `${rootFieldName}.fiscalYearDistributions`]}
          />
        </Col>
      </Row>
      <Row>
        <Col xs>
          {/* key forces a full remount when the starting FY changes, clearing stale
              distributions before the new FY series is populated. */}
          <FiscalYearsDistribution
            key={startingFiscalYearId}
            amounts={amounts}
            filterFunds={filterFunds}
            hasValidationError={hasValidationError}
            isAddFYButtonHidden={isAddFYButtonHidden}
            isAddFYButtonDisabled={isAddFYButtonDisabled}
            isLoading={isLoading}
            isNonInteractive={isNonInteractive}
            legend={isFundDistributionValidating ? <Loading /> : remainingAmountNode}
            name={`${rootFieldName}.fiscalYearDistributions`}
            onAddFiscalYear={onAddFiscalYearDistribution}
            onExpenseClassChange={onExpenseClassChange}
            onRemoveFiscalYear={onRemoveFiscalYearDistribution}
            onRemoveFundDistribution={onRemoveFundDistribution}
            totalAmount={totalPrice}
            validate={isRequired ? validateFiscalYearsDistributions : undefined}
          />
        </Col>
      </Row>
    </>
  );
};

PaymentTermsForm.propTypes = {
  amounts: PropTypes.object.isRequired,
  disabled: PropTypes.bool,
  filterFunds: PropTypes.func,
  isLoading: PropTypes.bool,
  isNonInteractive: PropTypes.bool,
  isTemplate: PropTypes.bool,
  onExpenseClassChange: PropTypes.func.isRequired,
  onStartingFYChange: PropTypes.func.isRequired,
  validateFundDistributionTotal: PropTypes.func,
};
