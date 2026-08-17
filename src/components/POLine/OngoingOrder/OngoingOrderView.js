import React from 'react';
import { FormattedMessage } from 'react-intl';
import PropTypes from 'prop-types';

import {
  Checkbox,
  Col,
  KeyValue,
  Row,
} from '@folio/stripes/components';
import { IfVisible } from '@folio/stripes-acq-components';

const OngoingOrderView = ({
  hiddenFields = {},
  multiYearPayment,
  renewalNote,
}) => {
  return (
    <Row start="xs">
      <IfVisible visible={!hiddenFields.renewalNote}>
        <Col
          xs={12}
          lg={6}
        >
          <KeyValue
            label={<FormattedMessage id="ui-orders.poLine.renewalNote" />}
            value={renewalNote}
          />
        </Col>
      </IfVisible>

      <IfVisible visible={!hiddenFields.multiYearPayment}>
        <Col
          xs={12}
          lg={6}
        >
          <Checkbox
            checked={!!multiYearPayment}
            disabled
            label={<FormattedMessage id="ui-orders.poLine.multiYearPayment" />}
            vertical
          />
        </Col>
      </IfVisible>
    </Row>
  );
};

OngoingOrderView.propTypes = {
  hiddenFields: PropTypes.object,
  renewalNote: PropTypes.string,
  multiYearPayment: PropTypes.bool,
};

export default OngoingOrderView;
