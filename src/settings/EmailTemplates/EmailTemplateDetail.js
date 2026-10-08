import { useMemo, useState } from 'react';
import { Parser } from 'html-to-react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';

import {
  Accordion,
  AccordionSet,
  AccordionStatus,
  Button,
  Col,
  ExpandAllButton,
  KeyValue,
  Row,
} from '@folio/stripes/components';
import {
  PreviewModal,
  sanitize,
  tokensReducer,
} from '@folio/stripes-template-editor';

import { ORDER_EMAIL_TOKENS } from './constants';
import { SAMPLE_PREVIEW_CONTEXT } from './samplePreviewContext';

const parser = new Parser();
const PREVIEW_FORMAT = tokensReducer(ORDER_EMAIL_TOKENS);

const EmailTemplateDetail = ({ initialValues = {} }) => {
  const [openPreview, setOpenPreview] = useState(false);

  const {
    name,
    description,
    active,
    localizedTemplates,
    templateResolver,
  } = initialValues;

  const { header: subject, body } = localizedTemplates?.en || {};

  // Same sanitizer as the editor, so the stored template is shown as saved.
  const parsedBody = useMemo(() => parser.parse(sanitize(body || '')), [body]);

  const togglePreviewDialog = () => {
    setOpenPreview(!openPreview);
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
          label={<FormattedMessage id="ui-orders.settings.emailTemplates.generalInformation" />}
        >
          <Row>
            <Col xs={12} md={6}>
              <KeyValue
                label={<FormattedMessage id="ui-orders.settings.emailTemplates.name" />}
                value={name}
              />
            </Col>
            <Col xs={12} md={6}>
              <KeyValue
                label={<FormattedMessage id="ui-orders.settings.emailTemplates.active" />}
                value={active ? <FormattedMessage id="ui-orders.settings.emailTemplates.active.yes" /> : <FormattedMessage id="ui-orders.settings.emailTemplates.active.no" />}
              />
            </Col>
          </Row>
          <Row>
            <Col xs={12}>
              <KeyValue
                label={<FormattedMessage id="ui-orders.settings.emailTemplates.description" />}
                value={description}
              />
            </Col>
          </Row>
        </Accordion>

        <Accordion
          label={<FormattedMessage id="ui-orders.settings.emailTemplates.templateContent" />}
        >
          <Row>
            <Col xs={8}>
              <KeyValue
                label={<FormattedMessage id="ui-orders.settings.emailTemplates.subject" />}
                value={subject}
              />
            </Col>
            <Col xs={4} style={{ textAlign: 'right' }}>
              <Button onClick={togglePreviewDialog}>
                <FormattedMessage id="ui-orders.settings.emailTemplates.preview" />
              </Button>
            </Col>
          </Row>
          <Row>
            <Col xs={12}>
              <KeyValue
                label={<FormattedMessage id="ui-orders.settings.emailTemplates.body" />}
                value={parsedBody}
              />
            </Col>
          </Row>
        </Accordion>
      </AccordionSet>

      <PreviewModal
        open={openPreview}
        header={
          <FormattedMessage
            id="ui-orders.settings.emailTemplates.previewHeader"
            values={{ name }}
          />
        }
        previewTemplate={body}
        previewFormat={PREVIEW_FORMAT}
        previewRenderer="backend"
        previewContext={SAMPLE_PREVIEW_CONTEXT}
        previewSubject={subject ?? ''}
        previewTemplateResolver={templateResolver}
        onClose={togglePreviewDialog}
      />
    </AccordionStatus>
  );
};

EmailTemplateDetail.propTypes = {
  initialValues: PropTypes.shape({
    id: PropTypes.string,
    name: PropTypes.string,
    description: PropTypes.string,
    active: PropTypes.bool,
    localizedTemplates: PropTypes.shape({
      en: PropTypes.shape({
        header: PropTypes.string,
        body: PropTypes.string,
      }),
    }),
    templateResolver: PropTypes.string,
  }),
};

export default EmailTemplateDetail;
