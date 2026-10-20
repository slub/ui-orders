import PropTypes from 'prop-types';
import { useMemo } from 'react';
import { FormattedMessage } from 'react-intl';

import { FieldSelectFinal } from '@folio/stripes-acq-components';

import { POL_FORM_FIELDS } from '../../constants';
import { useClaimSequences } from '../../hooks';

const INVALID_REFERENCE_LABEL_ID = 'ui-orders.poLine.claimSequence.invalid';
const notFoundError = <FormattedMessage id="ui-orders.poLine.claimSequence.validation.notFound" />;

// The empty option is added by `FieldSelect`; an empty value drops the field from the request.
const parse = (value) => value || undefined;

export const FieldClaimSequence = ({
  currentId,
  disabled = false,
}) => {
  const { claimSequences, isLoading } = useClaimSequences();

  const hasSequence = (id) => claimSequences.some((sequence) => sequence.id === id);
  const isCurrentMissing = Boolean(currentId) && !isLoading && !hasSequence(currentId);

  const dataOptions = useMemo(() => {
    const options = claimSequences
      // Inactive sequences are hidden, except the stored one, so the value does not vanish silently.
      .filter(({ id, isActive }) => isActive || id === currentId)
      .map(({ id, name }) => ({ label: name, value: id }));

    // A deleted sequence stays visible and selectable, so the user can clear it.
    return isCurrentMissing
      ? [...options, { labelId: INVALID_REFERENCE_LABEL_ID, value: currentId }]
      : options;
  }, [claimSequences, currentId, isCurrentMissing]);

  // Only while claiming is active: an inactive line is not claimed and the field is disabled.
  const validate = (value, { claimingActive }) => (
    claimingActive && value && !isLoading && !hasSequence(value)
      ? notFoundError
      : undefined
  );

  return (
    <FieldSelectFinal
      // Re-registers the field once the sequences are loaded, so the validation runs against them.
      key={isLoading ? 'loading' : 'loaded'}
      dataOptions={dataOptions}
      disabled={disabled}
      fullWidth
      label={<FormattedMessage id="ui-orders.poLine.claimSequence" />}
      name={POL_FORM_FIELDS.claimSequenceId}
      parse={parse}
      validate={validate}
      validateFields={[]}
    />
  );
};

FieldClaimSequence.propTypes = {
  currentId: PropTypes.string,
  disabled: PropTypes.bool,
};
