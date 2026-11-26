/**
 * Claim sequences live in mod-orders-storage (`orders-storage.claim-sequences`).
 * A stage stores two fields for its delivery: `deliveryType` (MANUAL outside
 * FOLIO, INTEGRATION through a Claims integration of the vendor) and, for
 * INTEGRATION only, the `transmissionMethod` of that integration. The form
 * offers both as one select: the empty value is the manual stage, every other
 * value is a transmission method, and `deliveryType` is derived on submit.
 */

export const CLAIM_SEQUENCES_API = 'orders-storage/claim-sequences';

export const DELIVERY_TYPE = {
  manual: 'MANUAL',
  integration: 'INTEGRATION',
};

export const TRANSMISSION_METHOD = {
  email: 'Email',
  ftp: 'FTP',
  fileDownload: 'File download',
};

export const AFTER_LAST_STAGE = {
  stop: 'STOP',
  repeatLast: 'REPEAT_LAST',
};

export const STAGE_INTERVAL_MIN = 1;
export const STAGE_INTERVAL_MAX = 3650;

const TRANSMISSION_METHOD_LABEL_IDS = {
  [TRANSMISSION_METHOD.email]: 'ui-orders.settings.claimSequences.stage.transmissionMethod.email',
  [TRANSMISSION_METHOD.ftp]: 'ui-orders.settings.claimSequences.stage.transmissionMethod.ftp',
  [TRANSMISSION_METHOD.fileDownload]: 'ui-orders.settings.claimSequences.stage.transmissionMethod.fileDownload',
};

export const MANUAL_TRANSMISSION_LABEL_ID = 'ui-orders.settings.claimSequences.stage.transmissionMethod.manual';

export const TRANSMISSION_METHOD_OPTIONS = [
  { value: '', labelId: MANUAL_TRANSMISSION_LABEL_ID },
  ...Object.entries(TRANSMISSION_METHOD_LABEL_IDS).map(([value, labelId]) => ({ value, labelId })),
];

export const AFTER_LAST_STAGE_OPTIONS = Object.values(AFTER_LAST_STAGE).map((value) => ({
  value,
  labelId: `ui-orders.settings.claimSequences.afterLastStage.${value}`,
}));

export const getTransmissionMethodLabelId = ({ deliveryType, transmissionMethod } = {}) => (
  deliveryType === DELIVERY_TYPE.integration
    ? TRANSMISSION_METHOD_LABEL_IDS[transmissionMethod]
    : MANUAL_TRANSMISSION_LABEL_ID
);

// The storage rejects a transmission method on a manual stage, so the key is dropped.
export const withDeliveryType = (claimSequence) => ({
  ...claimSequence,
  stages: (claimSequence.stages || []).map(({ transmissionMethod, ...stage }) => (
    transmissionMethod
      ? { ...stage, deliveryType: DELIVERY_TYPE.integration, transmissionMethod }
      : { ...stage, deliveryType: DELIVERY_TYPE.manual }
  )),
});

export const DEFAULT_CLAIM_SEQUENCE = {
  isActive: true,
  afterLastStage: AFTER_LAST_STAGE.stop,
  stages: [{}],
};
