import PropTypes from 'prop-types';
import { Field } from 'react-final-form';
import { FieldArray } from 'react-final-form-arrays';
import {
  FormattedMessage,
  useIntl,
} from 'react-intl';

import {
  Accordion,
  AccordionSet,
  AccordionStatus,
  Button,
  Checkbox,
  Col,
  ExpandAllButton,
  Headline,
  InfoPopover,
  Pane,
  PaneFooter,
  PaneHeader,
  Paneset,
  Row,
  Select,
  TextArea,
  TextField,
} from '@folio/stripes/components';
import stripesFinalForm from '@folio/stripes/final-form';
import { ViewMetaData } from '@folio/stripes/smart-components';
import {
  RepeatableFieldWithValidation,
  validateRequired,
} from '@folio/stripes-acq-components';

import {
  AFTER_LAST_STAGE_OPTIONS,
  DELIVERY_OPTIONS,
  STAGE_INTERVAL_MAX,
  STAGE_INTERVAL_MIN,
} from './constants';

const parseInteger = (value) => (value === '' || value === undefined ? undefined : Number(value));

const validateInterval = (value) => {
  if (value === undefined || value === null || value === '') {
    return <FormattedMessage id="stripes-acq-components.validation.required" />;
  }

  return Number.isInteger(value) && value >= STAGE_INTERVAL_MIN && value <= STAGE_INTERVAL_MAX
    ? undefined
    : <FormattedMessage id="ui-orders.settings.claimSequences.validation.intervalRange" />;
};

const validateStages = (stages) => (
  stages?.length ? undefined : <FormattedMessage id="ui-orders.settings.claimSequences.stages.required" />
);

const ClaimSequenceForm = ({
  handleSubmit,
  initialValues,
  onCancel,
  pristine,
  submitting,
}) => {
  const { formatMessage } = useIntl();

  const paneTitle = initialValues?.id
    ? initialValues?.name
    : formatMessage({ id: 'ui-orders.settings.claimSequences.new' });

  const toOptions = (options) => options.map(({ value, labelId }) => ({
    value,
    label: formatMessage({ id: labelId }),
  }));

  const renderHeader = (paneHeaderProps) => (
    <PaneHeader
      {...paneHeaderProps}
      dismissible
      onClose={onCancel}
      paneTitle={paneTitle}
    />
  );

  const renderFooter = () => (
    <PaneFooter
      renderStart={(
        <Button
          buttonStyle="default mega"
          marginBottom0
          onClick={onCancel}
        >
          <FormattedMessage id="stripes-core.button.cancel" />
        </Button>
      )}
      renderEnd={(
        <Button
          buttonStyle="primary mega"
          disabled={pristine || submitting}
          marginBottom0
          onClick={handleSubmit}
          type="submit"
        >
          <FormattedMessage id="stripes-components.saveAndClose" />
        </Button>
      )}
    />
  );

  const renderStage = (field, index) => (
    <>
      <Headline size="small" margin="small" tag="h4">
        <FormattedMessage
          id="ui-orders.settings.claimSequences.stage.number"
          values={{ number: index + 1 }}
        />
      </Headline>
      <Row>
        <Col xs={12} md={4}>
          <Field
            name={`${field}.name`}
            label={<FormattedMessage id="ui-orders.settings.claimSequences.stage.name" />}
            component={TextField}
            validate={validateRequired}
            required
          />
        </Col>
        <Col xs={12} md={4}>
          <Field
            name={`${field}.transmissionMethod`}
            label={(
              <>
                <FormattedMessage id="ui-orders.settings.claimSequences.stage.delivery" />
                <InfoPopover content={<FormattedMessage id="ui-orders.settings.claimSequences.stage.delivery.info" />} />
              </>
            )}
            component={Select}
            dataOptions={toOptions(DELIVERY_OPTIONS)}
          />
        </Col>
        <Col xs={12} md={4}>
          <Field
            name={`${field}.interval`}
            label={<FormattedMessage id="ui-orders.settings.claimSequences.stage.interval" />}
            component={TextField}
            type="number"
            min={STAGE_INTERVAL_MIN}
            max={STAGE_INTERVAL_MAX}
            parse={parseInteger}
            validate={validateInterval}
            required
          />
        </Col>
      </Row>
      <Row>
        <Col xs={12} md={6}>
          <Field
            name={`${field}.internalNote`}
            label={<FormattedMessage id="ui-orders.settings.claimSequences.stage.internalNote" />}
            component={TextArea}
          />
        </Col>
        <Col xs={12} md={6}>
          <Field
            name={`${field}.externalNote`}
            label={<FormattedMessage id="ui-orders.settings.claimSequences.stage.externalNote" />}
            component={TextArea}
          />
        </Col>
      </Row>
    </>
  );

  return (
    <form
      id="claim-sequence-form"
      onSubmit={handleSubmit}
    >
      <Paneset isRoot>
        <Pane
          defaultWidth="100%"
          footer={renderFooter()}
          renderHeader={renderHeader}
        >
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
                  {initialValues?.metadata && <ViewMetaData metadata={initialValues.metadata} />}
                </AccordionSet>
                <Row>
                  <Col xs={12} md={6}>
                    <Field
                      name="name"
                      label={<FormattedMessage id="ui-orders.settings.claimSequences.name" />}
                      component={TextField}
                      validate={validateRequired}
                      required
                      autoFocus
                    />
                  </Col>
                  <Col xs={12} md={6}>
                    <Field
                      name="isActive"
                      label={<FormattedMessage id="ui-orders.settings.claimSequences.active" />}
                      component={Checkbox}
                      type="checkbox"
                    />
                  </Col>
                </Row>
                <Row>
                  <Col xs={12}>
                    <Field
                      name="description"
                      label={<FormattedMessage id="ui-orders.settings.claimSequences.description" />}
                      component={TextArea}
                    />
                  </Col>
                </Row>
              </Accordion>

              <Accordion
                label={<FormattedMessage id="ui-orders.settings.claimSequences.stages" />}
              >
                <p>
                  <FormattedMessage id="ui-orders.settings.claimSequences.stages.help" />
                </p>
                <FieldArray
                  name="stages"
                  component={RepeatableFieldWithValidation}
                  addLabel={<FormattedMessage id="ui-orders.settings.claimSequences.stages.add" />}
                  onAdd={(fields) => fields.push({})}
                  renderField={renderStage}
                  validate={validateStages}
                />
                <Row>
                  <Col xs={12} md={6}>
                    <Field
                      name="afterLastStage"
                      label={<FormattedMessage id="ui-orders.settings.claimSequences.afterLastStage" />}
                      component={Select}
                      dataOptions={toOptions(AFTER_LAST_STAGE_OPTIONS)}
                    />
                  </Col>
                </Row>
              </Accordion>
            </AccordionSet>
          </AccordionStatus>
        </Pane>
      </Paneset>
    </form>
  );
};

ClaimSequenceForm.propTypes = {
  handleSubmit: PropTypes.func.isRequired,
  initialValues: PropTypes.shape({
    id: PropTypes.string,
    name: PropTypes.string,
    metadata: PropTypes.object,
  }),
  onCancel: PropTypes.func.isRequired,
  pristine: PropTypes.bool,
  submitting: PropTypes.bool,
};

export default stripesFinalForm({
  navigationCheck: true,
  subscription: {
    values: true,
  },
})(ClaimSequenceForm);
