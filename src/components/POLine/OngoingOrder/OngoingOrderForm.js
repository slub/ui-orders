import { useCallback } from 'react';
import {
  Field,
  useForm,
} from 'react-final-form';
import { FormattedMessage } from 'react-intl';
import PropTypes from 'prop-types';

import {
  Checkbox,
  Col,
  InfoPopover,
  Row,
  TextArea,
} from '@folio/stripes/components';
import {
  IfFieldVisible,
  VisibilityControl,
} from '@folio/stripes-acq-components';

import { POL_FORM_FIELDS } from '../../../common/constants';
import { isWorkflowStatusNotPending } from '../../PurchaseOrder/util';
import calculateEstimatedPrice from '../calculateEstimatedPrice';

const OngoingOrderForm = ({
  hiddenFields = {},
  order,
}) => {
  const isPostPendingOrder = order && isWorkflowStatusNotPending(order);

  const {
    change,
    getState,
  } = useForm();

  const onMultiYearPaymentChange = useCallback((e) => {
    const value = Boolean(e.target.checked);

    change(POL_FORM_FIELDS.multiYearPayment, value);

    if (value) {
      const poLineEstimatedPrice = calculateEstimatedPrice(getState().values);

      change(`${POL_FORM_FIELDS.paymentTerms}.totalPrice`, poLineEstimatedPrice);
    } else {
      change(POL_FORM_FIELDS.paymentTerms, undefined);
    }
  }, [change, getState]);

  return (
    <Row>
      <IfFieldVisible
        visible={!hiddenFields.renewalNote}
        name={POL_FORM_FIELDS.renewalNote}
      >
        <Col
          xs={6}
          md={3}
        >
          <VisibilityControl name="hiddenFields.renewalNote">
            <Field
              component={TextArea}
              fullWidth
              label={<FormattedMessage id="ui-orders.poLine.renewalNote" />}
              name={POL_FORM_FIELDS.renewalNote}
              validateFields={[]}
            />
          </VisibilityControl>
        </Col>
      </IfFieldVisible>

      <IfFieldVisible
        visible={!hiddenFields.multiYearPayment}
        name={POL_FORM_FIELDS.multiYearPayment}
      >
        <Col
          xs={6}
          md={3}
        >
          <VisibilityControl name="hiddenFields.multiYearPayment">
            <Field
              component={Checkbox}
              disabled={isPostPendingOrder}
              fullWidth
              label={(
                <>
                  <FormattedMessage id="ui-orders.poLine.multiYearPayment" />
                  <InfoPopover content={<FormattedMessage id="ui-orders.poLine.multiYearPayment.infoPopover" />} />
                </>
              )}
              name={POL_FORM_FIELDS.multiYearPayment}
              onChange={onMultiYearPaymentChange}
              type="checkbox"
              vertical
            />
          </VisibilityControl>
        </Col>
      </IfFieldVisible>
    </Row>
  );
};

OngoingOrderForm.propTypes = {
  hiddenFields: PropTypes.object,
  order: PropTypes.shape({
    workflowStatus: PropTypes.string.isRequired,
  }),
};

export default OngoingOrderForm;
