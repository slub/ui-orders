import { useState } from 'react';
import PropTypes from 'prop-types';
import {
  FormattedMessage,
  injectIntl,
} from 'react-intl';
import { Field } from 'react-final-form';

import {
  Accordion,
  AccordionSet,
  AccordionStatus,
  Button,
  Checkbox,
  Col,
  ExpandAllButton,
  Pane,
  PaneFooter,
  Paneset,
  Row,
  TextArea,
  TextField,
} from '@folio/stripes/components';
import stripesFinalForm from '@folio/stripes/final-form';
import { TemplateEditor } from '@folio/stripes-template-editor';

import { ORDER_EMAIL_TOKENS } from './constants';
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
  const [editAsHtml, setEditAsHtml] = useState(false);

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
            {/* Hidden field to ensure scope is always sent with form data */}
            <Field name="scope" component="input" type="hidden" />
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
                      name="localizedTemplates.en.header"
                      label={<FormattedMessage id="ui-orders.settings.emailTemplates.subject" />}
                      component={TextField}
                      required
                    />
                  </Col>
                </Row>
                <Row>
                  <Col xs={12}>
                    <Checkbox
                      label={<FormattedMessage id="ui-orders.settings.emailTemplates.editAsHtml" />}
                      checked={editAsHtml}
                      onChange={(e) => setEditAsHtml(e.target.checked)}
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
                      editAsHtml={editAsHtml}
                      tokens={ORDER_EMAIL_TOKENS}
                      tokensList={TokensList}
                      previewModalHeader={<FormattedMessage id="ui-orders.settings.emailTemplates.preview" />}
                      required
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
