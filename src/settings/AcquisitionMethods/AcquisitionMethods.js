import React, { Component } from 'react';
import {
  FormattedMessage,
  injectIntl,
} from 'react-intl';
import PropTypes from 'prop-types';

import {
  stripesShape,
  TitleManager,
} from '@folio/stripes/core';
import { ControlledVocab } from '@folio/stripes/smart-components';
import {
  ACQUISITION_METHODS_API,
  getAcqMethodLabel,
  getControlledVocabTranslations,
} from '@folio/stripes-acq-components';

import {
  checkboxFieldType,
  FormatAcqMethodDeprecated,
} from '../utils';

const ACQ_METHODS_SYSTEM_SOURCE = 'System';

const columnMapping = {
  value: <FormattedMessage id="ui-orders.settings.acquisitionMethods.name" />,
  deprecated: <FormattedMessage id="ui-orders.settings.acquisitionMethods.deprecated" />,
};
const visibleFields = ['value', 'deprecated'];
const hiddenFields = ['numberOfObjects', 'lastUpdated'];

const fieldComponents = {
  deprecated: checkboxFieldType,
};

// System rows: allow editing deprecated flag but keep the name read-only
const getReadOnlyFieldsForItem = (item) => (item.source === ACQ_METHODS_SYSTEM_SOURCE ? ['value'] : []);

const suppressEdit = () => false;
const suppressDelete = ({ source }) => source === ACQ_METHODS_SYSTEM_SOURCE;
const actionSuppressor = { edit: suppressEdit, delete: suppressDelete };

class AcquisitionMethods extends Component {
  constructor(props) {
    super(props);
    this.connectedControlledVocab = props.stripes.connect(ControlledVocab);
  }

  render() {
    const { intl, stripes } = this.props;

    const formatter = {
      value: (acqMethod) => getAcqMethodLabel(acqMethod, { intl }),
      deprecated: FormatAcqMethodDeprecated,
    };

    return (
      <TitleManager record={intl.formatMessage({ id: 'ui-orders.settings.acquisitionMethods' })}>
        <this.connectedControlledVocab
          actionSuppressor={actionSuppressor}
          id="acquisition-methods"
          baseUrl={ACQUISITION_METHODS_API}
          records="acquisitionMethods"
          sortby="value"
          nameKey="value"
          editable={stripes.hasPerm('ui-orders.settings.all')}
          label={intl.formatMessage({ id: 'ui-orders.settings.acquisitionMethods' })}
          translations={getControlledVocabTranslations('ui-orders.settings.acquisitionMethods')}
          columnMapping={columnMapping}
          objectLabel={intl.formatMessage({ id: 'ui-orders.settings.acquisitionMethods.singular' })}
          formatter={formatter}
          hiddenFields={hiddenFields}
          visibleFields={visibleFields}
          fieldComponents={fieldComponents}
          formType="final-form"
          getReadOnlyFieldsForItem={getReadOnlyFieldsForItem}
          stripes={stripes}
        />
      </TitleManager>
    );
  }
}

AcquisitionMethods.propTypes = {
  intl: PropTypes.object.isRequired,
  stripes: stripesShape.isRequired,
};

export default injectIntl(AcquisitionMethods);
