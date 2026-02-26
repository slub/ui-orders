import get from 'lodash/get';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { Field } from 'react-final-form';
import { FormattedMessage } from 'react-intl';

import {
  Col,
  KeyValue,
  Row,
} from '@folio/stripes/components';
import {
  AcqUnitsField,
  FieldOrganization,
  fieldSelectOptionsShape,
  FieldTags,
  FolioFormattedTime,
  IfFieldVisible,
  TextField,
} from '@folio/stripes-acq-components';

import { isEmailIntegrationType, PO_FORM_FIELDS } from '../../../common/constants';
import { getAddressOptions } from '../../../common/utils';
import {
  FieldPrefix,
  FieldSuffix,
  FieldBillTo,
  FieldIntegrationName,
  FieldOrderEmailTemplate,
  FieldShipTo,
  FieldIsManualPO,
  FieldIsReEncumber,
  FieldsNotes,
  FieldAssignedTo,
} from '../../../common/POFields';
import FieldOrderType from './FieldOrderType';
import {
  isWorkflowStatusClosed,
  isWorkflowStatusIsPending,
} from '../util';
import UserValue from './UserValue';

import css from './PODetailsForm.css';

const CREATE_UNITS_PERM = 'orders.acquisitions-units-assignments.assign';
const MANAGE_UNITS_PERM = 'orders.acquisitions-units-assignments.manage';

class PODetailsForm extends Component {
  static propTypes = {
    generatedNumber: PropTypes.string,
    orderNumberSetting: PropTypes.object.isRequired,
    prefixesSetting: fieldSelectOptionsShape.isRequired,
    suffixesSetting: fieldSelectOptionsShape.isRequired,
    formValues: PropTypes.object,
    change: PropTypes.func,
    addresses: PropTypes.arrayOf(PropTypes.object),
    order: PropTypes.object,
    orderEmailTemplates: PropTypes.arrayOf(PropTypes.object),
    validateNumber: PropTypes.func.isRequired,
    hiddenFields: PropTypes.object,
  }

  fillBackGeneratedNumber = ({ target: { value } }) => {
    const { change, generatedNumber } = this.props;

    if (value === '') {
      change(PO_FORM_FIELDS.poNumber, generatedNumber);
    }
  }

  render() {
    const {
      addresses,
      formValues,
      orderNumberSetting: { canUserEditOrderNumber },
      orderEmailTemplates = [],
      prefixesSetting,
      suffixesSetting,
      order,
      change,
      validateNumber,
      hiddenFields = {},
    } = this.props;

    const isEditMode = Boolean(order.id);
    const isPostPendingOrder = Boolean(order.workflowStatus) && !isWorkflowStatusIsPending(order);
    const isClosedOrder = isWorkflowStatusClosed(order);
    const addressesOptions = getAddressOptions(addresses);
    const addressBillTo = get(addresses.find(el => el.id === formValues.billTo), 'address', '');
    const addressShipTo = get(addresses.find(el => el.id === formValues.shipTo), 'address', '');

    return (
      <>
        <Row>
          <IfFieldVisible
            visible={!hiddenFields.poNumberPrefix}
            name={PO_FORM_FIELDS.poNumberPrefix}
          >
            <Col xs={4}>
              <FieldPrefix
                isNonInteractive={isPostPendingOrder}
                prefixes={prefixesSetting}
              />
            </Col>
          </IfFieldVisible>

          <Col xs={4}>
            {(!canUserEditOrderNumber || isPostPendingOrder) ? (
              <KeyValue
                data-test-po-number
                label={<FormattedMessage id="ui-orders.orderDetails.poNumber" />}
                value={formValues?.poNumber}
              />
            ) : (
              <Field
                component={TextField}
                data-test-po-number
                fullWidth
                label={<FormattedMessage id="ui-orders.orderDetails.poNumber" />}
                name={PO_FORM_FIELDS.poNumber}
                onBlur={this.fillBackGeneratedNumber}
                validate={validateNumber}
                validateFields={[]}
              />
            )}
          </Col>

          <IfFieldVisible
            visible={!hiddenFields.poNumberSuffix}
            name={PO_FORM_FIELDS.poNumberSuffix}
          >
            <Col xs={4}>
              <FieldSuffix
                isNonInteractive={isPostPendingOrder}
                suffixes={suffixesSetting}
              />
            </Col>
          </IfFieldVisible>
        </Row>
        <Row>
          <Col
            xs={12}
            lg={3}
          >
            <FieldOrganization
              change={change}
              isNonInteractive={isClosedOrder}
              id={formValues.vendor}
              labelId="ui-orders.orderDetails.vendor"
              name={PO_FORM_FIELDS.vendor}
            />
          </Col>
          <Col
            xs={6}
            lg={3}
          >
            <FieldOrderType isNonInteractive={isPostPendingOrder} />
          </Col>
          <IfFieldVisible
            visible={!hiddenFields.acqUnitIds}
            name={PO_FORM_FIELDS.acqUnitIds}
          >
            <Col
              xs={6}
              lg={3}
            >
              <AcqUnitsField
                key={formValues?.acqUnitIds?.length}
                id="order-acq-units"
                name={PO_FORM_FIELDS.acqUnitIds}
                perm={isEditMode ? MANAGE_UNITS_PERM : CREATE_UNITS_PERM}
                isEdit={isEditMode}
                preselectedUnits={order.acqUnitIds}
                isFinal
              />
            </Col>
          </IfFieldVisible>

          <IfFieldVisible
            visible={!hiddenFields.assignedTo}
            name={PO_FORM_FIELDS.assignedTo}
          >
            <Col
              xs={12}
              lg={3}
            >
              <FieldAssignedTo
                change={change}
                userId={formValues?.assignedTo}
              />
            </Col>
          </IfFieldVisible>
        </Row>
        <Row>
          <IfFieldVisible
            visible={!hiddenFields.billTo}
            name={PO_FORM_FIELDS.billTo}
          >
            <Col
              xs={6}
              lg={3}
            >
              <FieldBillTo
                addresses={addressesOptions}
                isNonInteractive={isClosedOrder}
              />
            </Col>
            <Col
              className={css.addressWrapper}
              xs={6}
              lg={3}
            >
              <KeyValue
                label={<FormattedMessage id="ui-orders.orderDetails.address" />}
                value={addressBillTo}
              />
            </Col>
          </IfFieldVisible>

          <IfFieldVisible
            visible={!hiddenFields.shipTo}
            name={PO_FORM_FIELDS.shipTo}
          >
            <Col
              xs={6}
              lg={3}
            >
              <FieldShipTo addresses={addressesOptions} />
            </Col>
            <Col
              className={css.addressWrapper}
              xs={6}
              lg={3}
            >
              <KeyValue
                label={<FormattedMessage id="ui-orders.orderDetails.address" />}
                value={addressShipTo}
              />
            </Col>
          </IfFieldVisible>
        </Row>
        <Row>
          <Col
            xs={6}
            lg={3}
          >
            <FieldIntegrationName isNonInteractive={isClosedOrder} />
          </Col>

          {isEmailIntegrationType(formValues?.integrationName) && (
            <Col
              xs={6}
              lg={3}
            >
              <FieldOrderEmailTemplate
                isNonInteractive={isClosedOrder}
                templates={orderEmailTemplates}
              />
            </Col>
          )}
        </Row>
        <Row>
          <IfFieldVisible
            visible={!hiddenFields.manualPo}
            name={PO_FORM_FIELDS.manualPo}
          >
            <Col
              xs={6}
              lg={3}
            >
              <FieldIsManualPO disabled={isPostPendingOrder} />
            </Col>
          </IfFieldVisible>

          <IfFieldVisible
            visible={!hiddenFields.reEncumber}
            name={PO_FORM_FIELDS.reEncumber}
          >
            <Col
              xs={6}
              lg={3}
            >
              <FieldIsReEncumber disabled={isPostPendingOrder} />
            </Col>
          </IfFieldVisible>
          <Col
            xs={6}
            lg={3}
          >
            <KeyValue label={<FormattedMessage id="ui-orders.orderDetails.createdBy" />}>
              <UserValue userId={formValues?.metadata?.createdByUserId} />
            </KeyValue>
          </Col>
          <Col
            xs={6}
            lg={3}
          >
            <KeyValue label={<FormattedMessage id="ui-orders.orderDetails.createdOn" />}>
              <FolioFormattedTime dateString={get(formValues, 'metadata.createdDate')} />
            </KeyValue>
          </Col>
        </Row>
        <Row>
          <IfFieldVisible
            visible={!hiddenFields.poTags}
            name={PO_FORM_FIELDS.tags}
          >
            <Col
              xs={6}
              lg={3}
            >
              <FieldTags
                key={formValues?.tags?.tagList?.length}
                change={change}
                formValues={formValues}
                name={PO_FORM_FIELDS.tags}
              />
            </Col>
          </IfFieldVisible>
        </Row>
        <Row>
          <IfFieldVisible
            visible={!hiddenFields.poNotes}
            name={PO_FORM_FIELDS.notes}
          >
            <Col xs={12}>
              <FieldsNotes required />
            </Col>
          </IfFieldVisible>
        </Row>
      </>
    );
  }
}

export default PODetailsForm;
