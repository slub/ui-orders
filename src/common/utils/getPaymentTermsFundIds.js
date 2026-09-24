export const getPaymentTermsFundIds = (paymentTerms) => {
  return paymentTerms?.fiscalYearDistributions?.flatMap(({ fundDistributions }) => {
    return fundDistributions?.map(({ fundId }) => fundId);
  }) || [];
};
