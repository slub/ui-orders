import { useForm } from 'react-final-form';
import { useMutation } from 'react-query';

import { useOkapiKy } from '@folio/stripes/core';

import { POL_FORM_FIELDS } from '../../../../common/constants';
import { fetchPaymentTermsFiscalYears } from '../fetchPaymentTermsFiscalYears';

export const useStartingFiscalYearChangeHandler = () => {
  const ky = useOkapiKy();
  const { change } = useForm();

  const { isLoading, mutateAsync } = useMutation({
    mutationFn: (value) => {
      // Reset derived fields first so stale FY distributions are removed immediately when
      // the starting FY changes or is cleared.
      change(`${POL_FORM_FIELDS.paymentTerms}.prepaymentTerm`, undefined);
      change(`${POL_FORM_FIELDS.paymentTerms}.fiscalYearDistributions`, undefined);
      change(`${POL_FORM_FIELDS.paymentTerms}.startingFiscalYearId`, value);

      if (!value) {
        return Promise.resolve({ fiscalYears: [] });
      }

      return fetchPaymentTermsFiscalYears(ky)(value)
        .then((data) => {
          // Initialize the first two payment terms because the feature requires at least
          // two FY entries once a starting FY has been chosen.
          const terms = data.fiscalYears
            ?.slice(0, 2)
            ?.map((fy) => ({ fiscalYearId: fy.id, fundDistributions: [] }));

          change(`${POL_FORM_FIELDS.paymentTerms}.prepaymentTerm`, terms.length);
          change(`${POL_FORM_FIELDS.paymentTerms}.fiscalYearDistributions`, terms);

          return data;
        });
    },
  });

  return {
    handleChange: mutateAsync,
    isLoading,
  };
};
