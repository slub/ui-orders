import PropTypes from 'prop-types';
import { useMemo } from 'react';

import { Loading } from '@folio/stripes/components';

import { usePaymentTermsFiscalYears } from '../hooks';
import { PaymentTermsView } from './PaymentTermsView';

export const PaymentTermsViewContainer = ({
  currency,
  hiddenFields,
  paymentTerms,
}) => {
  const {
    fiscalYears,
    isFetching,
  } = usePaymentTermsFiscalYears(paymentTerms?.startingFiscalYearId);

  const fiscalYearsMap = useMemo(() => new Map(fiscalYears.map((fy) => [fy.id, fy])), [fiscalYears]);

  if (isFetching) return <Loading />;

  return (
    <PaymentTermsView
      currency={currency}
      fiscalYearsMap={fiscalYearsMap}
      hiddenFields={hiddenFields}
      paymentTerms={paymentTerms}
    />
  );
};

PaymentTermsViewContainer.propTypes = {
  currency: PropTypes.string,
  hiddenFields: PropTypes.object,
  paymentTerms: PropTypes.object,
};
