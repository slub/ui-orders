import PropTypes from 'prop-types';
import { useForm } from 'react-final-form';
import { useIntl } from 'react-intl';

import {
  Card,
  IconButton,
  Layout,
} from '@folio/stripes/components';
import {
  FUND_DISTR_TYPE,
  FundDistributionFieldsFinalComponent,
  useFundDistributionExpenseClasses,
  useFundDistributionHandlers,
} from '@folio/stripes-acq-components';

import css from './FiscalYearsDistributionTerm.css';

const onAddFund = (fields) => {
  fields.push({ distributionType: FUND_DISTR_TYPE.amount, value: 0 });
};

export const FiscalYearsDistributionTerm = ({
  amounts,
  currency,
  disabled,
  filterFunds,
  fiscalYearId,
  fundDistributions,
  funds,
  label,
  name,
  onExpenseClassChange,
  onRemoveFiscalYear,
  onRemoveFundDistribution,
  showRemoveButton,
  totalAmount,
  validateFieldsMap,
}) => {
  const { change } = useForm();

  const { expenseClassesByFundId } = useFundDistributionExpenseClasses({
    fiscalYearId,
    fundDistribution: fundDistributions,
  });

  const intl = useIntl();

  const {
    onChangeToAmount,
    onChangeToPercent,
    onRemove: onRemoveFund,
    onSelectFund,
  } = useFundDistributionHandlers({
    change,
    fiscalYearId,
    funds,
  });

  return (
    <Layout className="flex">
      <Card
        headerStart={label}
        roundedBorder
      >
        <FundDistributionFieldsFinalComponent
          amounts={amounts}
          currency={currency}
          disabled={disabled}
          expenseClassesByFundId={expenseClassesByFundId}
          filterFunds={filterFunds}
          funds={funds}
          hasValidationError={false}
          name={name}
          onAdd={onAddFund}
          onChangeToAmount={onChangeToAmount}
          onChangeToPercent={onChangeToPercent}
          onRemove={onRemoveFundDistribution || onRemoveFund}
          onSelectFund={onSelectFund}
          onExpenseClassChange={onExpenseClassChange}
          totalAmount={totalAmount}
          validateFieldsMap={validateFieldsMap}
        />
      </Card>
      <div className={css.repeatableFieldRemoveItem}>
        {showRemoveButton && (
          <IconButton
            icon="trash"
            onClick={onRemoveFiscalYear}
            aria-label={intl.formatMessage({ id: 'ui-orders.poLine.paymentTerms.FYDistributions.action.remove' })}
          />
        )}
      </div>
    </Layout>
  );
};

FiscalYearsDistributionTerm.propTypes = {
  amounts: PropTypes.object.isRequired,
  currency: PropTypes.string.isRequired,
  disabled: PropTypes.bool.isRequired,
  filterFunds: PropTypes.func.isRequired,
  fiscalYearId: PropTypes.string,
  fundDistributions: PropTypes.arrayOf(PropTypes.object).isRequired,
  funds: PropTypes.arrayOf(PropTypes.object).isRequired,
  label: PropTypes.node.isRequired,
  name: PropTypes.string.isRequired,
  onExpenseClassChange: PropTypes.func.isRequired,
  onRemoveFiscalYear: PropTypes.func.isRequired,
  onRemoveFundDistribution: PropTypes.func,
  showRemoveButton: PropTypes.bool.isRequired,
  totalAmount: PropTypes.number.isRequired,
  validateFieldsMap: PropTypes.object,
};
