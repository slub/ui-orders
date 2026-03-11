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
import {
  PreviewModal,
  tokensReducer,
} from '@folio/stripes-template-editor';
import { useCategories } from '@folio/stripes-acq-components';

import {
  ORDER_EMAIL_TOKENS,
  RECIPIENT_LOGIC,
} from './constants';

/**
 * EmailTemplateDetail - Read-only view of an email template.
 *
 * Displays:
 * - General information (name, description, active status)
 * - Template content (sender, recipient logic, category, subject, body with preview)
 * - Attachment settings
 *
 * TODO (UIOR-1494): Add logo display
 */
const EmailTemplateDetail = ({ initialValues }) => {
  const [openPreview, setOpenPreview] = useState(false);
  const { categories } = useCategories();

  const {
    name,
    description,
    active,
    senderAddress,
    recipientLogic,
    category,
    attachmentFormats = [],
    localizedTemplates,
  } = initialValues;

  // Get the English template (or first available)
  const template = localizedTemplates?.en || {};
  const { header: subject, body } = template;

  const previewFormat = useMemo(() => tokensReducer(ORDER_EMAIL_TOKENS), []);
  const sanitizedBody = useMemo(() => DOMPurify.sanitize(body || ''), [body]);

  const categoryName = useMemo(() => {
    if (!category || !categories.length) return '';

    const found = categories.find(c => c.id === category);

    return found?.value || category;
  }, [category, categories]);

  const recipientLogicLabel = recipientLogic === RECIPIENT_LOGIC.CATEGORY_BASED
    ? <FormattedMessage id="ui-orders.settings.emailTemplates.recipientLogic.categoryBased" />
    : <FormattedMessage id="ui-orders.settings.emailTemplates.recipientLogic.primaryEmail" />;

  const attachmentFormatLabel = attachmentFormats?.length
    ? attachmentFormats.map(f => f.toUpperCase()).join(', ')
    : '-';

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
            <Col xs={12} md={6}>
              <KeyValue
                label={<FormattedMessage id="ui-orders.settings.emailTemplates.senderAddress" />}
                value={senderAddress}
              />
            </Col>
          </Row>
          <Row>
            <Col xs={12} md={6}>
              <KeyValue
                label={<FormattedMessage id="ui-orders.settings.emailTemplates.recipientLogic" />}
                value={recipientLogicLabel}
              />
            </Col>
            {recipientLogic === RECIPIENT_LOGIC.CATEGORY_BASED && (
              <Col xs={12} md={6}>
                <KeyValue
                  label={<FormattedMessage id="ui-orders.settings.emailTemplates.category" />}
                  value={categoryName}
                />
              </Col>
            )}
          </Row>
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

        <Accordion
          label={<FormattedMessage id="ui-orders.settings.emailTemplates.attachment" />}
        >
          <Row>
            <Col xs={12}>
              <KeyValue
                label={<FormattedMessage id="ui-orders.settings.emailTemplates.attachmentFormat" />}
                value={attachmentFormatLabel}
              />
            </Col>
          </Row>
        </Accordion>
      </AccordionSet>

      {/* NOTE: template-resolver in stripes-template-editor only replaces simple
          {{token}} placeholders. Mustache loops ({{#orderLines}}...{{/orderLines}})
          are not iterated — order line tokens appear once. For multi-row preview,
          a real Mustache library would be needed (TODO: UIOR-1495). */}
      <PreviewModal
        open={openPreview}
        header={
          <FormattedMessage
            id="ui-orders.settings.emailTemplates.previewHeader"
            values={{ name }}
          />
        }
        previewTemplate={body || ''}
        previewFormat={previewFormat}
        onClose={togglePreviewDialog}
      />
    </AccordionStatus>
  );
};

EmailTemplateDetail.propTypes = {
  initialValues: PropTypes.shape({
    name: PropTypes.string,
    description: PropTypes.string,
    active: PropTypes.bool,
    senderAddress: PropTypes.string,
    recipientLogic: PropTypes.string,
    category: PropTypes.string,
    attachmentFormats: PropTypes.arrayOf(PropTypes.string),
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
