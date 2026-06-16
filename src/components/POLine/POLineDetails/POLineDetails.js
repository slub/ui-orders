import get from 'lodash/get';
import isNil from 'lodash/isNil';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';

import { ClipCopy } from '@folio/stripes/smart-components';
import {
  Checkbox,
  Col,
  InfoPopover,
  KeyValue,
  Loading,
  NoValue,
  Row,
} from '@folio/stripes/components';
import {
  FolioFormattedDate,
  FolioFormattedTime,
  IfVisible,
  sourceLabels,
} from '@folio/stripes-acq-components';

import {
  ORDER_FORMAT_TRANSLATED_VALUES,
  PAYMENT_STATUS_TRANSLATED_VALUES,
  RECEIPT_STATUS_TRANSLATED_VALUES,
} from '../../../common/constants';
import { AutomaticExportInfo } from '../../../common/POLFields';
import { useAcqMethod } from '../../../common/hooks';
import { getTranslatedAcqMethod } from '../../Utils/getTranslatedAcqMethod';

const invalidAcqMethod = <FormattedMessage id="ui-orders.acquisitionMethod.invalid" />;

export const getReceivingWorkflowValue = (checkinItems) => {
  if (isNil(checkinItems)) return null;

  return (
    <FormattedMessage
      id={`ui-orders.poLine.receivingWorkflow.${checkinItems ? 'independent' : 'synchronized'}`}
    />
  );
};

export const getAcquisitionMethodValue = (acqMethodId, acqMethod) => {
  if (!acqMethodId) return null;

  return acqMethod
    ? getTranslatedAcqMethod(acqMethod.value)
    : invalidAcqMethod;
};

const DEFAULT_HIDDEN_FIELDS = {};
const DEFAULT_LINE = {};

const DEFAULT_INTEGRATION_CONFIGS = [];

const POLineDetails = ({
  hiddenFields = DEFAULT_HIDDEN_FIELDS,
  integrationConfigs = DEFAULT_INTEGRATION_CONFIGS,
  line = DEFAULT_LINE,
  manualOrder = false,
}) => {
  const receiptDate = get(line, 'receiptDate');
  const { acqMethod, isLoading } = useAcqMethod(line.acquisitionMethod);

  return (
    <>
      <Row start="xs">
        <Col
          data-col-line-details-number
          xs={6}
          lg={3}
        >
          <KeyValue label={<FormattedMessage id="ui-orders.poLine.number" />}>
            {line?.poLineNumber
              ? (
                <>
                  {line.poLineNumber}
                  <ClipCopy text={line.poLineNumber} />
                </>
              )
              : <NoValue />
            }
          </KeyValue>
        </Col>
        <IfVisible visible={!hiddenFields.acquisitionMethod}>
          <Col
            data-col-line-details-acq-method
            xs={6}
            lg={3}
          >
            <KeyValue
              label={<FormattedMessage id="ui-orders.poLine.acquisitionMethod" />}
              value={isLoading ? <Loading /> : getAcquisitionMethodValue(line.acquisitionMethod, acqMethod)}
            />
          </Col>
        </IfVisible>

        <IfVisible visible={!hiddenFields.automaticExport}>
          <Col
            data-col-line-details-auto-export
            xs={6}
            lg={3}
          >
            <Checkbox
              checked={line.automaticExport}
              disabled
              label={(
                <>
                  <FormattedMessage id="ui-orders.poLine.automaticExport" />
                  {manualOrder && <InfoPopover content={<FormattedMessage id="ui-orders.poLine.manualPO.info" />} />}
                  <AutomaticExportInfo
                    placement="label"
                    automaticExport={line.automaticExport}
                    manualOrder={manualOrder}
                    integrationConfigs={integrationConfigs}
                    vendorAccount={line.vendorDetail?.vendorAccount}
                    acquisitionMethod={line.acquisitionMethod}
                  />
                </>
              )}
              vertical
            />

            <AutomaticExportInfo
              placement="below"
              automaticExport={line.automaticExport}
              manualOrder={manualOrder}
              integrationConfigs={integrationConfigs}
              vendorAccount={line.vendorDetail?.vendorAccount}
              acquisitionMethod={line.acquisitionMethod}
            />
          </Col>
        </IfVisible>

        <IfVisible visible={!hiddenFields.orderFormat}>
          <Col
            data-col-line-details-order-format
            xs={6}
            lg={3}
          >
            <KeyValue
              label={<FormattedMessage id="ui-orders.poLine.orderFormat" />}
              value={ORDER_FORMAT_TRANSLATED_VALUES[line?.orderFormat]}
            />
          </Col>
        </IfVisible>

        <Col
          data-col-line-details-created-on
          xs={6}
          lg={3}
        >
          <KeyValue label={<FormattedMessage id="ui-orders.poLine.createdOn" />}>
            <FolioFormattedTime dateString={get(line, 'metadata.createdDate')} />
          </KeyValue>
        </Col>

        <IfVisible visible={!hiddenFields.receiptDate}>
          <Col
            data-col-line-details-receipt-date
            xs={6}
            lg={3}
          >
            <KeyValue label={<FormattedMessage id="ui-orders.poLine.receiptDate" />}>
              <FolioFormattedDate value={receiptDate} />
            </KeyValue>
          </Col>
        </IfVisible>

        <IfVisible visible={!hiddenFields.receiptStatus}>
          <Col
            data-col-line-details-receipt-status
            xs={6}
            lg={3}
          >
            <KeyValue
              label={<FormattedMessage id="ui-orders.poLine.receiptStatus" />}
              value={RECEIPT_STATUS_TRANSLATED_VALUES[line?.receiptStatus]}
            />
          </Col>
        </IfVisible>

        <IfVisible visible={!hiddenFields.paymentStatus}>
          <Col
            data-col-line-details-payment-status
            xs={6}
            lg={3}
          >
            <KeyValue
              label={<FormattedMessage id="ui-orders.poLine.paymentStatus" />}
              value={PAYMENT_STATUS_TRANSLATED_VALUES[line?.paymentStatus]}
            />
          </Col>
        </IfVisible>

        <Col
          data-col-line-details-source
          xs={6}
          lg={3}
        >
          <KeyValue
            label={<FormattedMessage id="ui-orders.poLine.source" />}
            value={sourceLabels[line.source]}
          />
        </Col>

        <IfVisible visible={!hiddenFields.donor}>
          <Col
            data-col-line-details-donor
            xs={6}
            lg={3}
          >
            <KeyValue
              label={<FormattedMessage id="ui-orders.poLine.donor" />}
              value={get(line, 'donor')}
            />
          </Col>
        </IfVisible>

        <IfVisible visible={!hiddenFields.selector}>
          <Col
            data-col-line-details-selector
            xs={6}
            lg={3}
          >
            <KeyValue
              label={<FormattedMessage id="ui-orders.poLine.selector" />}
              value={get(line, 'selector')}
            />
          </Col>
        </IfVisible>

        <IfVisible visible={!hiddenFields.requester}>
          <Col
            data-col-line-details-requestor
            xs={6}
            lg={3}
          >
            <KeyValue
              label={<FormattedMessage id="ui-orders.poLine.requester" />}
              value={get(line, 'requester')}
            />
          </Col>
        </IfVisible>
      </Row>

      <Row start="xs">
        <IfVisible visible={!hiddenFields.claimingActive}>
          <Col
            xs={6}
            lg={3}
          >
            <Checkbox
              checked={line?.claimingActive}
              disabled
              label={<FormattedMessage id="ui-orders.poLine.claimingActive" />}
              vertical
            />
          </Col>
        </IfVisible>

        <IfVisible visible={!hiddenFields.claimingInterval}>
          <Col
            xs={6}
            lg={3}
          >
            <KeyValue
              label={<FormattedMessage id="ui-orders.poLine.claimingInterval" />}
              value={line?.claimingInterval}
            />
          </Col>
        </IfVisible>

        <IfVisible visible={!hiddenFields.details?.isBinderyActive}>
          <Col
            xs={6}
            lg={3}
          >
            <Checkbox
              checked={line?.details?.isBinderyActive}
              disabled
              label={<FormattedMessage id="ui-orders.poLine.isBinderyActive" />}
              vertical
            />
          </Col>
        </IfVisible>
      </Row>

      <Row start="xs">
        <IfVisible visible={!hiddenFields.cancellationRestriction}>
          <Col
            data-col-line-details-cancellation-restriction
            xs={6}
            lg={3}
          >
            <Checkbox
              checked={get(line, 'cancellationRestriction')}
              disabled
              label={<FormattedMessage id="ui-orders.poLine.cancellationRestriction" />}
              vertical
            />
          </Col>
        </IfVisible>

        <IfVisible visible={!hiddenFields.rush}>
          <Col
            data-col-line-details-rush
            xs={6}
            lg={3}
          >
            <Checkbox
              checked={get(line, 'rush')}
              disabled
              label={<FormattedMessage id="ui-orders.poLine.rush" />}
              vertical
            />
          </Col>
        </IfVisible>

        <IfVisible visible={!hiddenFields.collection}>
          <Col
            data-col-line-details-collection
            xs={6}
            lg={3}
          >
            <Checkbox
              checked={get(line, 'collection')}
              disabled
              label={<FormattedMessage id="ui-orders.poLine.сollection" />}
              vertical
            />
          </Col>
        </IfVisible>

        <IfVisible visible={!hiddenFields.checkinItems}>
          <Col
            data-col-line-details-checkin-items
            xs={6}
            lg={3}
          >
            <KeyValue
              label={<FormattedMessage id="ui-orders.poLine.receivingWorkflow" />}
              value={getReceivingWorkflowValue(line.checkinItems)}
            />
          </Col>
        </IfVisible>

        <IfVisible visible={!hiddenFields.cancellationRestrictionNote}>
          <Col xs={12}>
            <KeyValue
              label={<FormattedMessage id="ui-orders.poLine.cancellationRestrictionNote" />}
              value={get(line, 'cancellationRestrictionNote')}
            />
          </Col>
        </IfVisible>

        <IfVisible visible={!hiddenFields.poLineDescription}>
          <Col xs={12}>
            <KeyValue
              label={<FormattedMessage id="ui-orders.poLine.poLineDescription" />}
              value={get(line, 'poLineDescription')}
            />
          </Col>
        </IfVisible>
      </Row>
    </>
  );
};

POLineDetails.propTypes = {
  hiddenFields: PropTypes.object,
  integrationConfigs: PropTypes.arrayOf(PropTypes.object),
  line: PropTypes.object,
  manualOrder: PropTypes.bool,
};

export default POLineDetails;
