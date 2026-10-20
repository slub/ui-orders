import PropTypes from 'prop-types';
import {
  FormattedMessage,
  useIntl,
} from 'react-intl';

import {
  Accordion,
  AccordionSet,
  AccordionStatus,
  Col,
  ExpandAllButton,
  KeyValue,
  MultiColumnList,
  NoValue,
  Row,
} from '@folio/stripes/components';
import { ViewMetaData } from '@folio/stripes/smart-components';

import { getDeliveryLabelId } from './constants';

const STAGE_COLUMNS = ['stage', 'name', 'delivery', 'interval', 'internalNote', 'externalNote'];

const STAGE_COLUMN_WIDTHS = {
  stage: '8%',
  name: '20%',
  delivery: '16%',
  interval: '12%',
};

const ClaimSequenceDetail = ({ initialValues = {} }) => {
  const { formatMessage } = useIntl();

  const {
    name,
    description,
    isActive,
    stages = [],
    afterLastStage,
    metadata,
  } = initialValues;

  const columnMapping = Object.fromEntries(STAGE_COLUMNS.map((column) => [
    column,
    formatMessage({ id: `ui-orders.settings.claimSequences.stage.${column}` }),
  ]));

  const formatter = {
    stage: (stage) => stage.rowIndex + 1,
    delivery: (stage) => formatMessage({ id: getDeliveryLabelId(stage) }),
    internalNote: (stage) => stage.internalNote || <NoValue />,
    externalNote: (stage) => stage.externalNote || <NoValue />,
  };

  return (
    <AccordionStatus>
      <Row end="xs">
        <Col>
          <ExpandAllButton />
        </Col>
      </Row>
      <AccordionSet>
        <Accordion
          label={<FormattedMessage id="ui-orders.settings.claimSequences.generalInformation" />}
        >
          <AccordionSet>
            {metadata && <ViewMetaData metadata={metadata} />}
          </AccordionSet>
          <Row>
            <Col xs={12} md={6}>
              <KeyValue
                label={<FormattedMessage id="ui-orders.settings.claimSequences.name" />}
                value={name}
              />
            </Col>
            <Col xs={12} md={6}>
              <KeyValue
                label={<FormattedMessage id="ui-orders.settings.claimSequences.active" />}
                value={<FormattedMessage id={`ui-orders.settings.claimSequences.active.${isActive ? 'yes' : 'no'}`} />}
              />
            </Col>
          </Row>
          <Row>
            <Col xs={12}>
              <KeyValue
                label={<FormattedMessage id="ui-orders.settings.claimSequences.description" />}
                value={description || <NoValue />}
              />
            </Col>
          </Row>
        </Accordion>

        <Accordion
          label={<FormattedMessage id="ui-orders.settings.claimSequences.stages" />}
        >
          <MultiColumnList
            id="claim-sequence-stages"
            contentData={stages}
            visibleColumns={STAGE_COLUMNS}
            columnMapping={columnMapping}
            columnWidths={STAGE_COLUMN_WIDTHS}
            formatter={formatter}
            interactive={false}
          />
          <Row>
            <Col xs={12} md={6}>
              <KeyValue
                label={<FormattedMessage id="ui-orders.settings.claimSequences.afterLastStage" />}
                value={afterLastStage && <FormattedMessage id={`ui-orders.settings.claimSequences.afterLastStage.${afterLastStage}`} />}
              />
            </Col>
          </Row>
        </Accordion>
      </AccordionSet>
    </AccordionStatus>
  );
};

ClaimSequenceDetail.propTypes = {
  initialValues: PropTypes.shape({
    id: PropTypes.string,
    name: PropTypes.string,
    description: PropTypes.string,
    isActive: PropTypes.bool,
    afterLastStage: PropTypes.string,
    stages: PropTypes.arrayOf(PropTypes.shape({
      stage: PropTypes.number,
      name: PropTypes.string,
      deliveryType: PropTypes.string,
      transmissionMethod: PropTypes.string,
      interval: PropTypes.number,
      internalNote: PropTypes.string,
      externalNote: PropTypes.string,
    })),
    metadata: PropTypes.object,
  }),
};

export default ClaimSequenceDetail;
