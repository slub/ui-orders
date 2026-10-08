import React from 'react';
import PropTypes from 'prop-types';
import { injectIntl } from 'react-intl';
import ReactRouterPropTypes from 'react-router-prop-types';
import { sortBy } from 'lodash';

import { EntryManager } from '@folio/stripes/smart-components';
import { stripesConnect, TitleManager } from '@folio/stripes/core';
import { LIMIT_MAX } from '@folio/stripes-acq-components';

import EmailTemplateDetail from './EmailTemplateDetail';
import EmailTemplateForm from './EmailTemplateForm';
import { TEMPLATE_SCOPE } from './constants';

/**
 * Settings page for the order email templates stored in mod-template-engine,
 * modelled on PatronNotices in ui-circulation. The templates are told apart
 * from other apps' templates by their `scope`.
 */
export class EmailTemplates extends React.Component {
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
      path: 'templates',
      records: 'templates',
      params: {
        query: `cql.allRecords=1 AND scope=="${TEMPLATE_SCOPE}"`,
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
    // EntryManager routes the selected template as the last path segment.
    const selectedId = location?.pathname.split('/').pop();
    const selectedName = entryList.find(({ id }) => id === selectedId)?.name;

    return (
      <TitleManager
        page={formatMessage({ id: 'ui-orders.settings.emailTemplates.label' })}
        record={selectedName}
      >
        <EntryManager
          {...this.props}
          parentMutator={mutator}
          entryList={entryList}
          detailComponent={EmailTemplateDetail}
          paneTitle={label}
          entryLabel={formatMessage({ id: 'ui-orders.settings.emailTemplates.label' })}
          entryFormComponent={EmailTemplateForm}
          defaultEntry={{
            active: true,
            outputFormats: ['text/html'],
            templateResolver: 'handlebars',
            scope: TEMPLATE_SCOPE,
          }}
          nameKey="name"
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

export default stripesConnect(injectIntl(EmailTemplates));
