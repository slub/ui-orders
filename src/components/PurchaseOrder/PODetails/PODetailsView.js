import get from 'lodash/get';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';

import {
  Checkbox,
  Col,
  KeyValue,
  NoValue,
  Row,
} from '@folio/stripes/components';
import {
  ClipCopy,
  ViewMetaData,
} from '@folio/stripes/smart-components';
import {
  AcqUnitsView,
  FolioFormattedTime,
  IfVisible,
  OrganizationValue,
} from '@folio/stripes-acq-components';

import { INTEGRATION_TYPE } from '../../../common/constants';
import { FiscalYearOpenedView } from '../components';
import { isWorkflowStatusNotPending } from '../util';
import UserValue from './UserValue';

import css from './PODetailsView.css';

const defaultProps = {
  addresses: [],
  hiddenFields: {},
};

const PODetailsView = ({
  addresses = defaultProps.addresses,
  hiddenFields = defaultProps.hiddenFields,
  order,
}) => {
  const addressBillTo = get(addresses.find(el => el.id === get(order, 'billTo', '')), 'address', '');
  const addressShipTo = get(addresses.find(el => el.id === get(order, 'shipTo', '')), 'address', '');

  return (
    <>
      <Row>
        <Col xs={12}>
          {order?.metadata && <ViewMetaData metadata={order.metadata} />}
        </Col>
      </Row>
      <Row start="xs">
        <Col
          xs={6}
          lg={3}
        >
          <KeyValue label={<FormattedMessage id="ui-orders.orderDetails.poNumber" />}>
            {order?.poNumber
              ? (
                <>
                  {order.poNumber}
                  <ClipCopy text={order.poNumber} />
                </>
              )
              : <NoValue />
            }
          </KeyValue>
        </Col>
        <Col
          xs={6}
          lg={3}
        >
          <OrganizationValue
            id={order.vendor}
            label={<FormattedMessage id="ui-orders.orderDetails.vendor" />}
          />
        </Col>
        <Col
          xs={6}
          lg={3}
        >
          <KeyValue
            label={<FormattedMessage id="ui-orders.orderDetails.orderType" />}
            value={get(order, 'orderType')}
          />
        </Col>

        <IfVisible visible={!hiddenFields.acqUnitIds}>
          <Col
            xs={6}
            lg={3}
          >
            <AcqUnitsView units={order.acqUnitIds} />
          </Col>
        </IfVisible>

        <Col
          xs={6}
          lg={3}
        >
          <KeyValue label={<FormattedMessage id="ui-orders.orderDetails.approvalDate" />}>
            <FolioFormattedTime dateString={order?.approvalDate} />
          </KeyValue>
        </Col>

        {Boolean(order?.approvalDate) && (
          <Col
            xs={6}
            lg={3}
          >
            <KeyValue
              label={<FormattedMessage id="ui-orders.orderDetails.approvedBy" />}
            >
              <UserValue userId={order?.approvedById} />
            </KeyValue>
          </Col>
        )}

        <IfVisible visible={!hiddenFields.assignedTo}>
          <Col
            xs={6}
            lg={3}
          >
            <KeyValue
              label={<FormattedMessage id="ui-orders.orderDetails.assignedTo" />}
            >
              <UserValue userId={order.assignedTo} />
            </KeyValue>
          </Col>
        </IfVisible>

        <IfVisible visible={!hiddenFields.billTo}>
          <Col
            className={css.addressWrapper}
            data-test-order-details-bill-to
            xs={6}
            lg={3}
          >
            <KeyValue
              label={<FormattedMessage id="ui-orders.orderDetails.billTo" />}
              value={addressBillTo}
            />
          </Col>
        </IfVisible>

        <IfVisible visible={!hiddenFields.shipTo}>
          <Col
            className={css.addressWrapper}
            data-test-order-details-ship-to
            xs={6}
            lg={3}
          >
            <KeyValue
              label={<FormattedMessage id="ui-orders.orderDetails.shipTo" />}
              value={addressShipTo}
            />
          </Col>
        </IfVisible>

        <Col
          xs={6}
          lg={3}
        >
          <KeyValue
            label={<FormattedMessage id="ui-orders.orderDetails.integrationName" />}
            value={get(order, 'integrationName') || <NoValue />}
          />
        </Col>

        {get(order, 'integrationName') === INTEGRATION_TYPE.email && (
          <Col
            xs={6}
            lg={3}
          >
            <KeyValue
              label={<FormattedMessage id="ui-orders.orderDetails.orderEmailTemplate" />}
              value={get(order, 'orderEmailTemplateName') || <NoValue />}
            />
          </Col>
        )}

        <IfVisible visible={!hiddenFields.manualPo}>
          <Col
            xs={6}
            lg={3}
          >
            <Checkbox
              checked={get(order, 'manualPo')}
              disabled
              label={<FormattedMessage id="ui-orders.orderDetails.manualPO" />}
              vertical
            />
          </Col>
        </IfVisible>

        <IfVisible visible={!hiddenFields.reEncumber}>
          <Col
            xs={6}
            lg={3}
          >
            <Checkbox
              checked={get(order, 'reEncumber')}
              disabled
              label={<FormattedMessage id="ui-orders.orderDetails.reEncumber" />}
              vertical
            />
          </Col>
        </IfVisible>

        <Col
          xs={6}
          lg={3}
        >
          <KeyValue
            label={<FormattedMessage id="ui-orders.orderDetails.createdBy" />}
          >
            <UserValue userId={get(order, 'metadata.createdByUserId')} />
          </KeyValue>
        </Col>
        <Col
          xs={6}
          lg={3}
        >
          <KeyValue label={<FormattedMessage id="ui-orders.orderDetails.createdOn" />}>
            <FolioFormattedTime dateString={get(order, 'metadata.createdDate')} />
          </KeyValue>
        </Col>

        {isWorkflowStatusNotPending(order) && (
          <>
            {Boolean(order?.dateOrdered) && (
              <Col
                xs={6}
                lg={3}
              >
                <KeyValue label={<FormattedMessage id="ui-orders.orderDetails.dateOpened" />}>
                  <FolioFormattedTime dateString={order.dateOrdered} />
                </KeyValue>
              </Col>
            )}

            {Boolean(order?.fiscalYearId) && (
              <Col
                xs={6}
                lg={3}
              >
                <FiscalYearOpenedView fiscalYearId={order.fiscalYearId} />
              </Col>
            )}

            {Boolean(order?.openedById) && (
              <Col
                xs={6}
                lg={3}
              >
                <KeyValue
                  label={<FormattedMessage id="ui-orders.orderDetails.openedBy" />}
                >
                  <UserValue userId={order?.openedById} />
                </KeyValue>
              </Col>
            )}
          </>
        )}

        <IfVisible visible={!hiddenFields.poNotes}>
          <Col xs={12}>
            {get(order, 'notes', []).map((note, index) => (
              <KeyValue
                key={index}
                label={<FormattedMessage id="ui-orders.orderDetails.note" />}
                value={note}
              />
            ))}
          </Col>
        </IfVisible>
      </Row>
    </>
  );
};

PODetailsView.propTypes = {
  addresses: PropTypes.arrayOf(PropTypes.object),
  hiddenFields: PropTypes.object,
  order: PropTypes.object,
};

export default PODetailsView;
