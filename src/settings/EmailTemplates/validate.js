import React from 'react';
import { FormattedMessage } from 'react-intl';

const isEmpty = (value) => !value || (typeof value === 'string' && value.trim() === '');

// The editor stores HTML, so an "empty" body may still contain tags.
const isEmptyEditor = (value = '') => isEmpty(value.replace(/<\/?[^>]+(>|$)/g, ''));

const validate = (values) => {
  const errors = {};
  const enErrors = {};

  if (isEmpty(values.name)) {
    errors.name = <FormattedMessage id="ui-orders.settings.emailTemplates.validation.nameRequired" />;
  }

  if (isEmpty(values.localizedTemplates?.en?.header)) {
    enErrors.header = <FormattedMessage id="ui-orders.settings.emailTemplates.validation.subjectRequired" />;
  }

  if (isEmptyEditor(values.localizedTemplates?.en?.body)) {
    enErrors.body = <FormattedMessage id="ui-orders.settings.emailTemplates.validation.bodyRequired" />;
  }

  if (Object.keys(enErrors).length > 0) {
    errors.localizedTemplates = { en: enErrors };
  }

  return errors;
};

export default validate;
