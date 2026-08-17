import {
  createContext,
  useContext,
} from 'react';

export const PaymentTermsContext = createContext();

export const usePaymentTermsContext = () => {
  const context = useContext(PaymentTermsContext);

  if (!context) {
    throw new Error('usePaymentTermsContext must be used within a PaymentTermsProvider');
  }

  return context;
};
