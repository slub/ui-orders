import React from 'react';
import { FormattedMessage } from 'react-intl';

/**
 * Validation for Email Template form
 *
 * Required fields:
 * - name: Template name
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
