import React from 'react';
import PropTypes from 'prop-types';
import { injectIntl } from 'react-intl';
import ReactRouterPropTypes from 'react-router-prop-types';
import { sortBy } from 'lodash';

import { EntryManager } from '@folio/stripes/smart-components';
import { stripesConnect, TitleManager } from '@folio/stripes/core';
import { LIMIT_MAX } from '@folio/stripes-acq-components';

import { CLAIM_SEQUENCES_API } from '../../common/constants';
import ClaimSequenceDetail from './ClaimSequenceDetail';
import ClaimSequenceForm from './ClaimSequenceForm';
import {
  DEFAULT_CLAIM_SEQUENCE,
  withDeliveryType,
} from './constants';

// EntryManager fixes `onSubmit`, so the delivery type is derived here.
const ClaimSequenceEntryForm = ({ onSubmit, ...props }) => (
  <ClaimSequenceForm
    {...props}
    onSubmit={(values) => onSubmit(withDeliveryType(values))}
  />
);

ClaimSequenceEntryForm.propTypes = {
  onSubmit: PropTypes.func.isRequired,
};

/**
 * Settings page for the claim sequences of mod-orders-storage, built like the
 * email templates page.
 */
export class ClaimSequences extends React.Component {
  static propTypes = {
    label: PropTypes.node.isRequired,
    resources: PropTypes.shape({
      entries: PropTypes.shape({
        records: PropTypes.arrayOf(PropTypes.object),
      }),
    }).isRequired,
    mutator: PropTypes.shape({
      entries: PropTypes.shape({
        POST: PropTypes.func,
        PUT: PropTypes.func,
        DELETE: PropTypes.func,
      }),
    }).isRequired,
    intl: PropTypes.shape({
      formatMessage: PropTypes.func.isRequired,
    }).isRequired,
    location: ReactRouterPropTypes.location,
  };

  static manifest = Object.freeze({
    entries: {
      type: 'okapi',
      path: CLAIM_SEQUENCES_API,
      records: 'claimSequences',
      params: {
        query: 'cql.allRecords=1',
      },
      perRequest: LIMIT_MAX,
    },
  });

  render() {
    const {
      intl: { formatMessage },
      label,
      location,
      resources,
      mutator,
    } = this.props;

    const entryList = sortBy(resources.entries?.records || [], ['name']);
    const sectionLabel = formatMessage({ id: 'ui-orders.settings.claimSequences.label' });
    const selectedId = location?.pathname.split('/').pop();
    const selectedName = entryList.find(({ id }) => id === selectedId)?.name;

    return (
      <TitleManager
        page={selectedName ? sectionLabel : undefined}
        record={selectedName || sectionLabel}
      >
        <EntryManager
          {...this.props}
          parentMutator={mutator}
          entryList={entryList}
          detailComponent={ClaimSequenceDetail}
          paneTitle={label}
          entryLabel={formatMessage({ id: 'ui-orders.settings.claimSequences.entryLabel' })}
          entryFormComponent={ClaimSequenceEntryForm}
          defaultEntry={DEFAULT_CLAIM_SEQUENCE}
          nameKey="name"
          // TODO: dedicated claim-sequences permissions. The order email
          // template permissions are reused while the PoC runs under Eureka,
          // where new permissions are not registered as capabilities automatically.
          permissions={{
            put: 'ui-orders.settings.email-templates.edit',
            post: 'ui-orders.settings.email-templates.create',
            delete: 'ui-orders.settings.email-templates.delete',
          }}
          enableDetailsActionMenu
        />
      </TitleManager>
    );
  }
}

export default stripesConnect(injectIntl(ClaimSequences));
