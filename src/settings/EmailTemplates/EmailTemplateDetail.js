import { useMemo, useState } from 'react';
import { Parser } from 'html-to-react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import DOMPurify from 'dompurify';

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
import { IfInterface } from '@folio/stripes/core';
import { PreviewModal } from '@folio/stripes-template-editor';

import { SAMPLE_PREVIEW_CONTEXT } from './samplePreviewContext';

// The preview posts to /template-request/preview, which mod-template-engine
// offers from interface 2.3 on (MODTEMPENG-135). Below that the button is
// hidden rather than failing with a 404 on click.
const TEMPLATE_ENGINE_INTERFACE = 'template-engine';
const TEMPLATE_ENGINE_PREVIEW_VERSION = '2.3';

const parser = new Parser();

const EmailTemplateDetail = ({ initialValues }) => {
  const [openPreview, setOpenPreview] = useState(false);

  const {
    name,
    description,
    active,
    localizedTemplates,
    templateResolver,
  } = initialValues;

  const { header: subject, body } = localizedTemplates?.en || {};

  const parsedBody = useMemo(() => parser.parse(DOMPurify.sanitize(body || '')), [body]);

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
              <IfInterface
                name={TEMPLATE_ENGINE_INTERFACE}
                version={TEMPLATE_ENGINE_PREVIEW_VERSION}
              >
                <Button onClick={togglePreviewDialog}>
                  <FormattedMessage id="ui-orders.settings.emailTemplates.preview" />
                </Button>
              </IfInterface>
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

      {/* previewFormat only feeds the regex renderer, which the backend
          renderer uses as its fallback; there is no flat token map here. */}
      <PreviewModal
        open={openPreview}
        header={
          <FormattedMessage
            id="ui-orders.settings.emailTemplates.previewHeader"
            values={{ name }}
          />
        }
        previewTemplate={body}
        previewFormat={{}}
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

EmailTemplateDetail.defaultProps = {
  initialValues: {},
};

export default EmailTemplateDetail;
