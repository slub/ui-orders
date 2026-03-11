import PropTypes from 'prop-types';
import {
  FormattedMessage,
  injectIntl,
} from 'react-intl';
import { Field, useFormState } from 'react-final-form';

import {
  Accordion,
  AccordionSet,
  AccordionStatus,
  Button,
  Checkbox,
  Col,
  ExpandAllButton,
  Label,
  Pane,
  PaneFooter,
  Paneset,
  RadioButton,
  Row,
  Select,
  TextArea,
  TextField,
} from '@folio/stripes/components';
import stripesFinalForm from '@folio/stripes/final-form';
import { TemplateEditor } from '@folio/stripes-template-editor';
import { useCategories } from '@folio/stripes-acq-components';

import {
  ATTACHMENT_FORMATS,
  ORDER_EMAIL_TOKENS,
  RECIPIENT_LOGIC,
} from './constants';
import TokensList from './TokensList';
import validate from './validate';

import css from './EmailTemplateForm.css';

/**
 * EmailTemplateForm - Create/Edit form for email templates.
 *
 * Similar structure to PatronNoticeForm in ui-circulation.
 * Uses Paneset/Pane wrapper for proper styling.
 *
 * TODO (UIOR-1494): Add logo upload functionality
 */
const EmailTemplateForm = ({
  handleSubmit,
  initialValues,
  intl: { formatMessage },
  onCancel,
  pristine,
  submitting,
}) => {
  const { values } = useFormState({ subscription: { values: true } });
  const { categories, isLoading: categoriesLoading } = useCategories();

  const categoryOptions = [
    { label: formatMessage({ id: 'ui-orders.settings.emailTemplates.category.placeholder' }), value: '' },
    ...categories.map(c => ({ label: c.value, value: c.id })),
  ];

  const showCategorySelect = values?.recipientLogic === RECIPIENT_LOGIC.CATEGORY_BASED;

  const paneTitle = initialValues?.id
    ? initialValues?.name
    : formatMessage({ id: 'ui-orders.settings.emailTemplates.new' });

  const renderFooter = () => {
    const saveButton = (
      <Button
        buttonStyle="primary mega"
        disabled={pristine || submitting}
        marginBottom0
        onClick={handleSubmit}
        type="submit"
      >
        <FormattedMessage id="stripes-components.saveAndClose" />
      </Button>
    );

    const cancelButton = (
      <Button
        buttonStyle="default mega"
        marginBottom0
        onClick={onCancel}
      >
        <FormattedMessage id="stripes-core.button.cancel" />
      </Button>
    );

    return (
      <PaneFooter
        renderEnd={saveButton}
        renderStart={cancelButton}
      />
    );
  };

  return (
    <form
      id="email-template-form"
      className={css.emailTemplateForm}
      onSubmit={handleSubmit}
    >
      <Paneset isRoot>
        <Pane
          defaultWidth="100%"
          dismissible
          footer={renderFooter()}
          onClose={(e) => onCancel(e || { preventDefault: () => {} })}
          paneTitle={paneTitle}
        >
          <AccordionStatus>
            <Row end="xs">
              <Col>
                <ExpandAllButton />
              </Col>
            </Row>
            {/* Hidden field to ensure module is always sent with form data */}
            <Field name="module" component="input" type="hidden" />
            <AccordionSet>
              <Accordion
                label={<FormattedMessage id="ui-orders.settings.emailTemplates.generalInformation" />}
              >
                <Row>
                  <Col xs={12} md={6}>
                    <Field
                      name="name"
                      label={<FormattedMessage id="ui-orders.settings.emailTemplates.name" />}
                      component={TextField}
                      required
                      autoFocus
                    />
                  </Col>
                  <Col xs={12} md={6}>
                    <Field
                      name="active"
                      label={<FormattedMessage id="ui-orders.settings.emailTemplates.active" />}
                      component={Checkbox}
                      type="checkbox"
                    />
                  </Col>
                </Row>
                <Row>
                  <Col xs={12}>
                    <Field
                      name="description"
                      label={<FormattedMessage id="ui-orders.settings.emailTemplates.description" />}
                      component={TextArea}
                    />
                  </Col>
                </Row>
              </Accordion>

              <Accordion
                label={<FormattedMessage id="ui-orders.settings.emailTemplates.templateContent" />}
              >
                <Row>
                  <Col xs={12}>
                    <Field
                      name="senderAddress"
                      label={<FormattedMessage id="ui-orders.settings.emailTemplates.senderAddress" />}
                      component={TextField}
                      required
                    />
                  </Col>
                </Row>
                <Row style={{ marginBottom: '1rem' }}>
                  <Col xs={12}>
                    <Label required>
                      <FormattedMessage id="ui-orders.settings.emailTemplates.recipientLogic" />
                    </Label>
                    <Field
                      name="recipientLogic"
                      type="radio"
                      value={RECIPIENT_LOGIC.PRIMARY_EMAIL}
                      component={RadioButton}
                      label={<FormattedMessage id="ui-orders.settings.emailTemplates.recipientLogic.primaryEmail" />}
                    />
                    <Field
                      name="recipientLogic"
                      type="radio"
                      value={RECIPIENT_LOGIC.CATEGORY_BASED}
                      component={RadioButton}
                      label={<FormattedMessage id="ui-orders.settings.emailTemplates.recipientLogic.categoryBased" />}
                    />
                  </Col>
                </Row>
                {showCategorySelect && (
                  <Row>
                    <Col xs={12} md={6}>
                      <Field
                        name="category"
                        label={<FormattedMessage id="ui-orders.settings.emailTemplates.category" />}
                        component={Select}
                        dataOptions={categoryOptions}
                        disabled={categoriesLoading}
                        required
                      />
                    </Col>
                  </Row>
                )}
                <Row>
                  <Col xs={12}>
                    <Field
                      name="localizedTemplates.en.header"
                      label={<FormattedMessage id="ui-orders.settings.emailTemplates.subject" />}
                      component={TextField}
                      required
                    />
                  </Col>
                </Row>
                <Row>
                  <Col xs={12}>
                    {/* Preview: loops not iterated by template-resolver (TODO: UIOR-1495) */}
                    <Field
                      name="localizedTemplates.en.body"
                      label={<FormattedMessage id="ui-orders.settings.emailTemplates.body" />}
                      component={TemplateEditor}
                      tokens={ORDER_EMAIL_TOKENS}
                      tokensList={TokensList}
                      previewModalHeader={<FormattedMessage id="ui-orders.settings.emailTemplates.preview" />}
                      required
                    />
                  </Col>
                </Row>
              </Accordion>

              <Accordion
                label={<FormattedMessage id="ui-orders.settings.emailTemplates.attachment" />}
              >
                <Row>
                  <Col xs={12}>
                    <Label>
                      <FormattedMessage id="ui-orders.settings.emailTemplates.attachmentFormat" />
                    </Label>
                    <Field
                      name="attachmentFormats"
                      type="checkbox"
                      value={ATTACHMENT_FORMATS.CSV}
                      component={Checkbox}
                      label={<FormattedMessage id="ui-orders.settings.emailTemplates.attachmentFormat.csv" />}
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

EmailTemplateForm.propTypes = {
  handleSubmit: PropTypes.func.isRequired,
  initialValues: PropTypes.shape({
    id: PropTypes.string,
    name: PropTypes.string,
  }),
  intl: PropTypes.shape({
    formatMessage: PropTypes.func.isRequired,
  }).isRequired,
  onCancel: PropTypes.func.isRequired,
  pristine: PropTypes.bool,
  submitting: PropTypes.bool,
};

export default stripesFinalForm({
  navigationCheck: true,
  subscription: {
    values: true,
  },
  validate,
})(injectIntl(EmailTemplateForm));
