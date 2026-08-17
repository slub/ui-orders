import PropTypes from 'prop-types';
import React from 'react';
import { Field } from 'react-final-form';
import {
  FormattedMessage,
  useIntl,
} from 'react-intl';

import { Checkbox } from '@folio/stripes/components';

const NAME_REGEXP = new RegExp(/[^a-zA-Z\d]|^.{8,}$/);
const PREXIS_OR_SUFFIX_MAX_LENGTH = 8;

export const validateName = (name) => {
  if (!name?.match(NAME_REGEXP)) return {};

  return {
    name: (
      <FormattedMessage
        id="ui-orders.settings.poNumber.validation.prefixOrSuffixPatternMismatch"
        values={{ count: PREXIS_OR_SUFFIX_MAX_LENGTH }}
      />
    ),
  };
};

export const validatePrefixName = ({ name }) => {
  return validateName(name);
};

export const validateSuffixName = ({ name }) => {
  return validateName(name);
};

export const checkboxFieldType = ({ fieldProps }) => (
  <Field
    {...fieldProps}
    component={Checkbox}
    type="checkbox"
  />
);

export const FormatAcqMethodDeprecated = ({ value, deprecated }) => (
  <DeprecatedCheckbox
    name={value}
    deprecated={deprecated}
    messageId="ui-orders.settings.acquisitionMethods.aria-label.deprecated"
  />
);

FormatAcqMethodDeprecated.propTypes = {
  value: PropTypes.string.isRequired,
  deprecated: PropTypes.bool.isRequired,
};

export const FormatPrefixDeprecated = ({ name, deprecated }) => (
  <DeprecatedCheckbox
    name={name}
    deprecated={deprecated}
    messageId="ui-orders.settings.poNumber.prefix.aria-label.deprecated"
  />
);

FormatPrefixDeprecated.propTypes = {
  name: PropTypes.string.isRequired,
  deprecated: PropTypes.bool.isRequired,
};

export const FormatSuffixDeprecated = ({ name, deprecated }) => (
  <DeprecatedCheckbox
    name={name}
    deprecated={deprecated}
    messageId="ui-orders.settings.poNumber.suffix.aria-label.deprecated"
  />
);

FormatSuffixDeprecated.propTypes = {
  name: PropTypes.string.isRequired,
  deprecated: PropTypes.bool.isRequired,
};

export const DeprecatedCheckbox = ({ name, deprecated, messageId }) => {
  const intl = useIntl();

  return (
    <Checkbox
      aria-label={intl.formatMessage(
        { id: messageId },
        { name },
      )}
      disabled
      checked={deprecated}
    />
  );
};

DeprecatedCheckbox.propTypes = {
  name: PropTypes.string.isRequired,
  deprecated: PropTypes.bool.isRequired,
  messageId: PropTypes.string.isRequired,
};

export const validateDuplicates = (intl, fieldNames = []) => (item, index, items) => {
  const results = fieldNames.reduce((acc, fieldName) => {
    const fieldValue = item[fieldName];
    const isDuplicates = items.some((i, idx) => i[fieldName] === fieldValue && idx !== index);

    if (isDuplicates) {
      acc[fieldName] = intl.formatMessage({ id: 'ui-orders.settings.orderTemplateCategories.validation.duplicates' });
    }

    return acc;
  }, {});

  return results;
};
