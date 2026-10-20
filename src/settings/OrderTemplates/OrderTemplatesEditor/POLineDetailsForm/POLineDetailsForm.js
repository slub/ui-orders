import get from 'lodash/get';
import PropTypes from 'prop-types';
import { useCallback } from 'react';
import { useForm } from 'react-final-form';

import {
  Col,
  Row,
} from '@folio/stripes/components';
import { VisibilityControl } from '@folio/stripes-acq-components';

import {
  PO_FORM_FIELDS,
  POL_FORM_FIELDS,
} from '../../../../common/constants';
import {
  FieldAcquisitionMethod,
  FieldAutomaticExport,
  FieldBinderyActive,
  FieldCancellationRestriction,
  FieldCancellationRestrictionNote,
  FieldCheckInItems,
  FieldClaimingActive,
  FieldClaimingInterval,
  FieldClaimSequence,
  FieldCollection,
  FieldDonor,
  FieldOrderFormat,
  FieldPaymentStatus,
  FieldPOLineDescription,
  FieldPOLineNumber,
  FieldReceiptDate,
  FieldReceiptStatus,
  FieldRequester,
  FieldRush,
  FieldSelector,
  handleBinderyActiveFieldChange,
  isBinderyActiveDisabled,
} from '../../../../common/POLFields';
import { isReceiptNotRequired } from '../../../../components/POLine/utils';

const POLineDetailsForm = ({ formValues, createInventorySetting }) => {
  const { batch, change } = useForm();

  const isManualOrder = get(formValues, PO_FORM_FIELDS.manualPo);
  const isBinderyActive = get(formValues, POL_FORM_FIELDS.isBinderyActive);
  const isCheckInItems = get(formValues, POL_FORM_FIELDS.checkinItems);
  const isClaimingActive = get(formValues, POL_FORM_FIELDS.claimingActive);
  const isPackage = get(formValues, POL_FORM_FIELDS.isPackage);
  const receiptStatus = get(formValues, POL_FORM_FIELDS.receiptStatus);
  const isCheckInItemsDisabled = isPackage || isBinderyActive || isReceiptNotRequired(receiptStatus);

  const onReceiptStatusChange = useCallback(async ({ target: { value } }) => {
    const shouldTriggerReceivingWorkflowChange = !isCheckInItems && isReceiptNotRequired(value);

    if (shouldTriggerReceivingWorkflowChange) {
      change(POL_FORM_FIELDS.receiptStatus, value || undefined);
      change(POL_FORM_FIELDS.checkinItems, true);
    } else {
      change(POL_FORM_FIELDS.receiptStatus, value || undefined);
    }
  }, [change, isCheckInItems]);

  const onClaimingActiveChange = useCallback(({ target: { checked } }) => {
    change(POL_FORM_FIELDS.claimingActive, checked);

    if (!checked) {
      change(POL_FORM_FIELDS.claimingInterval, undefined);
      change(POL_FORM_FIELDS.claimSequenceId, undefined);
    }
  }, [change]);

  const onBinderyActiveChange = useCallback(({ target: { checked } }) => {
    return handleBinderyActiveFieldChange(checked, { batch, change });
  }, [batch, change]);

  return (
    <>
      <Row>
        <Col
          xs={3}
          data-col-order-template-pol-number
        >
          <FieldPOLineNumber />
        </Col>

        <Col
          xs={3}
          data-col-order-template-pol-acq-method
        >
          <FieldAcquisitionMethod required={false} />
        </Col>

        <Col
          xs={3}
          data-col-order-template-pol-auto-export
        >
          <VisibilityControl name="hiddenFields.automaticExport">
            <FieldAutomaticExport
              disabled={isManualOrder}
              isManualOrder={isManualOrder}
            />
          </VisibilityControl>
        </Col>

        <Col
          xs={3}
          data-col-order-template-pol-order-format
        >
          <FieldOrderFormat
            formValues={formValues}
            createInventorySetting={createInventorySetting}
            required={false}
          />
        </Col>
      </Row>

      <Row>
        <Col
          xs={3}
          data-col-order-template-pol-receipt-date
        >
          <VisibilityControl name="hiddenFields.receiptDate">
            <FieldReceiptDate />
          </VisibilityControl>
        </Col>

        <Col
          xs={3}
          data-col-order-template-pol-receipt-status
        >
          <VisibilityControl name="hiddenFields.receiptStatus">
            <FieldReceiptStatus
              workflowStatus="template"
              onChange={onReceiptStatusChange}
            />
          </VisibilityControl>
        </Col>

        <Col
          xs={3}
          data-col-order-template-pol-payment-status
        >
          <VisibilityControl name="hiddenFields.paymentStatus">
            <FieldPaymentStatus workflowStatus="template" />
          </VisibilityControl>
        </Col>
      </Row>

      <Row>
        <Col
          xs={3}
          data-col-order-template-pol-donor
        >
          <VisibilityControl name="hiddenFields.donor">
            <FieldDonor />
          </VisibilityControl>
        </Col>

        <Col
          xs={3}
          data-col-order-template-pol-selector
        >
          <VisibilityControl name="hiddenFields.selector">
            <FieldSelector />
          </VisibilityControl>
        </Col>

        <Col
          xs={3}
          data-col-order-template-pol-requester
        >
          <VisibilityControl name="hiddenFields.requester">
            <FieldRequester />
          </VisibilityControl>
        </Col>
      </Row>

      <Row>
        <Col
          xs={3}
          data-col-order-template-pol-claiming-active
        >
          <VisibilityControl name="hiddenFields.claimingActive">
            <FieldClaimingActive onChange={onClaimingActiveChange} />
          </VisibilityControl>
        </Col>

        <Col
          xs={3}
          data-col-order-template-pol-claiming-interval
        >
          <VisibilityControl name="hiddenFields.claimingInterval">
            <FieldClaimingInterval disabled={!isClaimingActive} />
          </VisibilityControl>
        </Col>

        <Col
          xs={3}
          data-col-order-template-pol-claim-sequence
        >
          <VisibilityControl name="hiddenFields.claimSequenceId">
            <FieldClaimSequence
              disabled={!isClaimingActive}
              currentId={get(formValues, POL_FORM_FIELDS.claimSequenceId)}
            />
          </VisibilityControl>
        </Col>

        <Col
          xs={3}
          data-col-order-template-pol-is-bindary-active
        >
          <VisibilityControl name="hiddenFields.details.isBinderyActive">
            <FieldBinderyActive
              disabled={isBinderyActiveDisabled(formValues)}
              onChange={onBinderyActiveChange}
            />
          </VisibilityControl>
        </Col>
      </Row>

      <Row>
        <Col
          xs={3}
          data-col-order-template-pol-cancel-restriction
        >
          <VisibilityControl name="hiddenFields.cancellationRestriction">
            <FieldCancellationRestriction />
          </VisibilityControl>
        </Col>

        <Col
          xs={3}
          data-col-order-template-pol-rush
        >
          <VisibilityControl name="hiddenFields.rush">
            <FieldRush />
          </VisibilityControl>
        </Col>

        <Col
          xs={3}
          data-col-order-template-pol-collection
        >
          <VisibilityControl name="hiddenFields.collection">
            <FieldCollection />
          </VisibilityControl>
        </Col>

        <Col
          xs={3}
          data-col-order-template-pol-check-in
        >
          <VisibilityControl name="hiddenFields.checkinItems">
            <FieldCheckInItems disabled={isCheckInItemsDisabled} />
          </VisibilityControl>
        </Col>
      </Row>

      <Row>
        <Col
          xs={3}
          data-col-order-template-pol-cancel-restr-note
        >
          <VisibilityControl name="hiddenFields.cancellationRestrictionNote">
            <FieldCancellationRestrictionNote />
          </VisibilityControl>
        </Col>

        <Col
          xs={3}
          data-col-order-template-pol-description
        >
          <VisibilityControl name="hiddenFields.poLineDescription">
            <FieldPOLineDescription />
          </VisibilityControl>
        </Col>
      </Row>
    </>
  );
};

POLineDetailsForm.propTypes = {
  formValues: PropTypes.object.isRequired,
  createInventorySetting: PropTypes.object,
};

export default POLineDetailsForm;
