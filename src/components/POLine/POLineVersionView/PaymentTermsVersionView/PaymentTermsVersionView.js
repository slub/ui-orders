import PropTypes from 'prop-types';
import { useMemo } from 'react';

import { PaymentTermsVersionViewContent } from './PaymentTermsVersionViewContent';

export const PaymentTermsVersionView = ({ version }) => {
  const {
    cost,
    paymentTerms,
    paymentTermsFiscalYears = [],
  } = version;

  const fiscalYearsMap = useMemo(() => {
    return new Map(paymentTermsFiscalYears.map((fy) => [fy.id, fy]));
  }, [paymentTermsFiscalYears]);

  return (
    <PaymentTermsVersionViewContent
      currency={cost?.currency}
      fiscalYearsMap={fiscalYearsMap}
      paymentTerms={paymentTerms}
    />
  );
};

PaymentTermsVersionView.propTypes = {
  version: PropTypes.object.isRequired,
};
