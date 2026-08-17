import { get } from 'lodash';
import PropTypes from 'prop-types';
import {
  useCallback,
  useMemo,
  useState,
} from 'react';
import {
  useForm,
  useFormState,
} from 'react-final-form';

import { useStripes } from '@folio/stripes/core';
import {
  calculateFundDistributionAmountsAndTotal,
  useFunds,
  useShowCallout,
} from '@folio/stripes-acq-components';

import { POL_FORM_FIELDS } from '../../../../common/constants';
import { useFundDistributionValidation } from '../../../../common/hooks';
import { isWorkflowStatusNotPending } from '../../../PurchaseOrder/util';
import { useExpenseClassChange } from '../../hooks';
import {
  usePaymentTermsFiscalYears,
  useStartingFiscalYearChangeHandler,
  useStartingFiscalYears,
} from '../hooks';
import { PaymentTermsContext } from './PaymentTermsContext';
import { PaymentTermsForm } from './PaymentTermsForm';

export const PaymentTermsFormContainer = ({
  filterFunds,
  isTemplate,
  order,
}) => {
  const stripes = useStripes();
  const showCallout = useShowCallout();
  const [paymentTermsFiscalYears, setPaymentTermsFiscalYears] = useState([]);

  const { getFieldState } = useForm();
  const { values } = useFormState();

  const lineId = getFieldState('id')?.initial;
  const currency = get(values, POL_FORM_FIELDS.currency, stripes.currency);
  const totalAmount = Number(get(values, `${POL_FORM_FIELDS.paymentTerms}.totalPrice`, 0));
  const fiscalYearDistributions = get(values, `${POL_FORM_FIELDS.paymentTerms}.fiscalYearDistributions`, []);
  const cost = get(values, 'cost', {});

  const {
    initial: initialStartingFiscalYearValue,
    pristine: isStartingFiscalYearPristine,
  } = getFieldState(`${POL_FORM_FIELDS.paymentTerms}.startingFiscalYearId`) || {};

  const isPostPendingOrder = Boolean(order && isWorkflowStatusNotPending(order));

  const { validateFundDistributionTotal } = useFundDistributionValidation({
    cost: {
      currency,
      exchangeRate: cost.exchangeRate,
      additionalCost: (totalAmount),
    },
  });

  const {
    funds,
    isLoading: isFundsLoading,
  } = useFunds();

  const {
    fiscalYears: startingFiscalYears,
    isFetching: isStartingFiscalYearsFetching,
  } = useStartingFiscalYears(initialStartingFiscalYearValue);

  // Load FY metadata for the initial value only while the field is pristine; once the user
  // changes the starting FY, the mutation path becomes the source of truth for this list.
  const { isFetching: isPaymentTermsFiscalYearsFetching } = usePaymentTermsFiscalYears(
    initialStartingFiscalYearValue,
    {
      enabled: isStartingFiscalYearPristine,
      onSuccess: (data) => setPaymentTermsFiscalYears(data.fiscalYears),
    },
  );

  const {
    handleChange: handleStartingFiscalYearChange,
    isLoading: isStartingFiscalYearChangeLoading,
  } = useStartingFiscalYearChangeHandler();

  const {
    isLoading: isExpenseClassProcessing,
    renderModal: renderExpenseClassConfirmModal,
    onExpenseClassChange,
  } = useExpenseClassChange(lineId);

  const onStartingFYChange = useCallback(async (value) => {
    await handleStartingFiscalYearChange(value)
      .then(({ fiscalYears }) => setPaymentTermsFiscalYears(fiscalYears))
      .catch(() => {
        showCallout({
          messageId: 'ui-orders.poLine.paymentTerms.fetchFYsError',
          type: 'error',
        });
      });
  }, [handleStartingFiscalYearChange, showCallout]);

  const multiYearFundDistribution = useMemo(() => {
    // Amount calculation utilities expect one flat fund distribution list, while the form state
    // stores distributions grouped by fiscal year.
    return fiscalYearDistributions
      ?.reduce((acc, { fundDistributions }) => [...acc, ...(fundDistributions || [])], [])
      ?.filter(Boolean) || [];
  }, [fiscalYearDistributions]);

  const { amounts } = useMemo(
    () => calculateFundDistributionAmountsAndTotal(multiYearFundDistribution, totalAmount, currency),
    [multiYearFundDistribution, currency, totalAmount],
  );

  const contextValue = useMemo(() => ({
    currency,
    funds,
    paymentTermsFiscalYears,
    paymentTermsFiscalYearsMap: new Map(paymentTermsFiscalYears.map((fy) => [fy.id, fy])),
    rootFieldName: POL_FORM_FIELDS.paymentTerms,
    startingFiscalYears,
  }), [
    currency,
    funds,
    paymentTermsFiscalYears,
    startingFiscalYears,
  ]);

  const isLoadingState = (
    isStartingFiscalYearsFetching
    || isPaymentTermsFiscalYearsFetching
    || isStartingFiscalYearChangeLoading
    || isExpenseClassProcessing
    || isFundsLoading
  );

  return (
    <PaymentTermsContext.Provider value={contextValue}>
      <PaymentTermsForm
        amounts={amounts}
        disabled={isPostPendingOrder}
        filterFunds={filterFunds}
        isLoading={isLoadingState}
        isNonInteractive={isPostPendingOrder}
        isTemplate={isTemplate}
        onExpenseClassChange={onExpenseClassChange}
        onStartingFYChange={onStartingFYChange}
        validateFundDistributionTotal={validateFundDistributionTotal}
      />
      {renderExpenseClassConfirmModal()}
    </PaymentTermsContext.Provider>
  );
};

PaymentTermsFormContainer.propTypes = {
  filterFunds: PropTypes.func,
  isTemplate: PropTypes.bool,
  order: PropTypes.shape({
    workflowStatus: PropTypes.string.isRequired,
  }),
};
