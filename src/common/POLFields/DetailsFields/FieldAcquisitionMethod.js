import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { useFormState } from 'react-final-form';

import {
  FieldSelectionFinal,
  useAcqMethodsOptions,
} from '@folio/stripes-acq-components';

import { POL_FORM_FIELDS } from '../../constants';
import { useAcqMethods } from '../../hooks/useAcqMethods';

const FieldAcquisitionMethod = ({
  disabled = false,
  required = true,
  ...props
}) => {
  const { acqMethods } = useAcqMethods();
  const { initialValues } = useFormState({ subscription: { initialValues: true } });
  const initialAcqMethod = initialValues?.[POL_FORM_FIELDS.acquisitionMethod];

  // Deprecated methods are hidden, except the saved (initial) one, which stays selectable with a suffix.
  const acquisitionMethods = useAcqMethodsOptions(acqMethods, {
    excludeDeprecated: true,
    selectedValue: initialAcqMethod,
    withDeprecatedSuffix: true,
  });

  return (
    <FieldSelectionFinal
      id="acquisition-method"
      dataOptions={acquisitionMethods}
      label={<FormattedMessage id="ui-orders.poLine.acquisitionMethod" />}
      name={POL_FORM_FIELDS.acquisitionMethod}
      required={required}
      isNonInteractive={disabled}
      {...props}
    />
  );
};

FieldAcquisitionMethod.propTypes = {
  disabled: PropTypes.bool,
  required: PropTypes.bool,
};

export default FieldAcquisitionMethod;
