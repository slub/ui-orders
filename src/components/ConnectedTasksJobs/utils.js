import { useOrganization } from '@folio/stripes-acq-components';

import { CONNECTED_RECORD_TYPES } from '../../common/constants';

const getRecordObject = (record, recordType, vendorName) => {
  if (recordType === CONNECTED_RECORD_TYPES.ORDER) {
    return {
      poNumber: record.poNumber,
      vendorName,
      workflowStatus: record.workflowStatus,
    };
  }

  return {
    paymentStatus: record.paymentStatus,
    poLineNumber: record.poLineNumber,
    receiptStatus: record.receiptStatus,
  };
};

export const useConnectedTasksJobsProps = (record, recordType) => {
  const { organization } = useOrganization(
    recordType === CONNECTED_RECORD_TYPES.ORDER ? record.vendor : undefined,
  );

  return {
    recordId: record.id,
    recordObject: getRecordObject(record, recordType, organization?.name),
    recordType,
  };
};
