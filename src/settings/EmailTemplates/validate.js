import React from 'react';
import { FormattedMessage } from 'react-intl';

import { RECIPIENT_LOGIC } from './constants';

/**
 * Validation for Email Template form
 *
 * Required fields:
 * - name: Template name
 * - senderAddress: Sender email address
 * - recipientLogic: Recipient logic selection
 * - category: Required when recipientLogic is categoryBased
 * - localizedTemplates.en.header: Email subject
 * - localizedTemplates.en.body: Email body content
 */

// Helper to check if a string is empty (null, undefined, or only whitespace)
const isEmpty = (value) => !value || (typeof value === 'string' && value.trim() === '');

// Helper to check if HTML/Editor content is empty (same logic as ui-circulation)
const isNotEmptyEditor = (value = '') => {
  const plainText = value.replace(/<\/?[^>]+(>|$)/g, '');

  return !isEmpty(plainText) && !!plainText.trim();
};

const validate = (values) => {
  const errors = {};

  // Name is required
  if (isEmpty(values.name)) {
    errors.name = <FormattedMessage id="ui-orders.settings.emailTemplates.validation.nameRequired" />;
  }

  // Sender address is required
  if (isEmpty(values.senderAddress)) {
    errors.senderAddress = <FormattedMessage id="ui-orders.settings.emailTemplates.validation.senderAddressRequired" />;
  }

  // Recipient logic is required
  if (isEmpty(values.recipientLogic)) {
    errors.recipientLogic = <FormattedMessage id="ui-orders.settings.emailTemplates.validation.recipientLogicRequired" />;
  }

  // Category is required when using category based email
  if (values.recipientLogic === RECIPIENT_LOGIC.CATEGORY_BASED && isEmpty(values.category)) {
    errors.category = <FormattedMessage id="ui-orders.settings.emailTemplates.validation.categoryRequired" />;
  }

  // Initialize nested error object if needed
  const localizedTemplatesErrors = {};
  const enErrors = {};

  // Subject/Header is required
  const header = values.localizedTemplates?.en?.header;

  if (isEmpty(header)) {
    enErrors.header = <FormattedMessage id="ui-orders.settings.emailTemplates.validation.subjectRequired" />;
  }

  // Body is required
  const body = values.localizedTemplates?.en?.body;

  if (!isNotEmptyEditor(body)) {
    enErrors.body = <FormattedMessage id="ui-orders.settings.emailTemplates.validation.bodyRequired" />;
  }

  // Only add nested errors if there are any
  if (Object.keys(enErrors).length > 0) {
    localizedTemplatesErrors.en = enErrors;
    errors.localizedTemplates = localizedTemplatesErrors;
  }

  return errors;
};

export default validate;
