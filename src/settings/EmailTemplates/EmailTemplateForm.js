import {
  useMemo,
  useState,
} from 'react';
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
  PaneHeader,
  Paneset,
  Row,
  TextArea,
  TextField,
} from '@folio/stripes/components';
import stripesFinalForm from '@folio/stripes/final-form';
import { ViewMetaData } from '@folio/stripes/smart-components';
import { TemplateEditor } from '@folio/stripes-template-editor';

import {
  bindTokensList,
  tokenSectionsPropType,
} from './TokensList';
import validate from './validate';

import css from './EmailTemplateForm.css';

const EmailTemplateForm = ({
  handleSubmit,
  initialValues,
  intl: { formatMessage },
  loopsHelpId,
  newLabelId,
  onCancel,
  previewContext,
  pristine,
  submitting,
  tokens,
  tokenSections,
  values,
}) => {
  const [editAsHtml, setEditAsHtml] = useState(false);
  const tokensList = useMemo(() => bindTokensList(tokenSections, loopsHelpId), [tokenSections, loopsHelpId]);

  const paneTitle = initialValues?.id
    ? initialValues?.name
    : formatMessage({ id: newLabelId });

  const renderHeader = (paneHeaderProps) => (
    <PaneHeader
      {...paneHeaderProps}
      dismissible
      onClose={onCancel}
      paneTitle={paneTitle}
    />
  );

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
                label={<FormattedMessage id="ui-orders.settings.emailTemplates.generalInformation" />}
              >
                <AccordionSet>
                  {initialValues?.metadata && <ViewMetaData metadata={initialValues.metadata} />}
                </AccordionSet>
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
                    <Field
                      name="localizedTemplates.en.body"
                      label={<FormattedMessage id="ui-orders.settings.emailTemplates.body" />}
                      component={TemplateEditor}
                      editAsHtml={editAsHtml}
                      tokens={tokens}
                      tokensList={tokensList}
                      previewModalHeader={(
                        <FormattedMessage
                          id="ui-orders.settings.emailTemplates.previewHeader"
                          values={{ name: values?.name || paneTitle }}
                        />
                      )}
                      previewRenderer="backend"
                      previewContext={previewContext}
                      previewSubject={values?.localizedTemplates?.en?.header ?? ''}
                      previewTemplateResolver={values?.templateResolver}
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
    metadata: PropTypes.object,
  }),
  intl: PropTypes.shape({
    formatMessage: PropTypes.func.isRequired,
  }).isRequired,
  loopsHelpId: PropTypes.string.isRequired,
  newLabelId: PropTypes.string.isRequired,
  onCancel: PropTypes.func.isRequired,
  previewContext: PropTypes.object.isRequired,
  pristine: PropTypes.bool,
  submitting: PropTypes.bool,
  tokens: PropTypes.object.isRequired,
  tokenSections: tokenSectionsPropType.isRequired,
  values: PropTypes.shape({
    name: PropTypes.string,
    localizedTemplates: PropTypes.object,
    templateResolver: PropTypes.string,
  }),
};

export default stripesFinalForm({
  navigationCheck: true,
  subscription: {
    values: true,
  },
  validate,
})(injectIntl(EmailTemplateForm));
