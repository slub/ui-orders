import { useState, useMemo } from 'react';
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

import BackendPreviewModal from './BackendPreviewModal';

/**
 * EmailTemplateDetail - Read-only view of an email template.
 *
 * Displays:
 * - General information (name, description, active status)
 * - Template content (sender, recipient logic, category, subject, body with preview)
 * - Attachment settings
 */
const EmailTemplateDetail = ({ initialValues }) => {
  const [openPreview, setOpenPreview] = useState(false);

  const {
    name,
    description,
    active,
    localizedTemplates,
  } = initialValues;

  const template = localizedTemplates?.en || {};
  const { header: subject, body } = template;

  const sanitizedBody = useMemo(() => DOMPurify.sanitize(body || ''), [body]);

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
              >
                {/* eslint-disable-next-line react/no-danger */}
                <div dangerouslySetInnerHTML={{ __html: sanitizedBody }} />
              </KeyValue>
            </Col>
          </Row>
        </Accordion>
      </AccordionSet>

      <BackendPreviewModal
        open={openPreview}
        bodyTemplate={body}
        header={
          <FormattedMessage
            id="ui-orders.settings.emailTemplates.previewHeader"
            values={{ name }}
          />
        }
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
  }),
};

EmailTemplateDetail.defaultProps = {
  initialValues: {},
};

export default EmailTemplateDetail;
