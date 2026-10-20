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
import { ORDER_EMAIL_TEMPLATES_CONFIG } from './constants';
import { tokenSectionsPropType } from './TokensList';

/**
 * Settings page for the email templates stored in mod-template-engine,
 * modelled on PatronNotices in ui-circulation. The templates are told apart
 * from other apps' templates by their `scope`. The page is instantiated once
 * per scope (order and claim email templates), see `createEmailTemplatesPage`.
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
    // Page configuration, see ORDER_EMAIL_TEMPLATES_CONFIG. EntryManager
    // passes it on to the detail and form components.
    scope: PropTypes.string.isRequired,
    labelId: PropTypes.string.isRequired,
    entryLabelId: PropTypes.string.isRequired,
    newLabelId: PropTypes.string.isRequired,
    permissions: PropTypes.shape({
      put: PropTypes.string.isRequired,
      post: PropTypes.string.isRequired,
      delete: PropTypes.string.isRequired,
    }).isRequired,
    tokens: PropTypes.object.isRequired,
    tokenSections: tokenSectionsPropType.isRequired,
    loopsHelpId: PropTypes.string.isRequired,
    previewContext: PropTypes.object.isRequired,
  };

  static manifest = Object.freeze({
    entries: {
      type: 'okapi',
      path: 'templates',
      records: 'templates',
      params: (queryParams, pathComponents, resourceData, logger, props) => ({
        query: `cql.allRecords=1 AND scope=="${props.scope}"`,
      }),
      perRequest: LIMIT_MAX,
    },
  });

  render() {
    const {
      entryLabelId,
      intl: { formatMessage },
      label,
      labelId,
      location,
      resources,
      mutator,
      permissions,
      scope,
    } = this.props;

    const entryList = sortBy(resources.entries?.records || [], ['name']);
    const sectionLabel = formatMessage({ id: labelId });
    // EntryManager routes the selected template as the last path segment.
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
          detailComponent={EmailTemplateDetail}
          paneTitle={label}
          entryLabel={formatMessage({ id: entryLabelId })}
          entryFormComponent={EmailTemplateForm}
          defaultEntry={{
            active: true,
            outputFormats: ['text/html'],
            templateResolver: 'handlebars',
            scope,
          }}
          nameKey="name"
          permissions={permissions}
          enableDetailsActionMenu
        />
      </TitleManager>
    );
  }
}

/**
 * Binds the page to one configuration. The `dataKey` keeps the
 * stripes-connect state of the instances apart; without it they would
 * share the `entries` resource.
 */
export const createEmailTemplatesPage = (config, dataKey) => {
  const ConnectedEmailTemplates = stripesConnect(injectIntl(EmailTemplates), { dataKey });
  const EmailTemplatesPage = (props) => <ConnectedEmailTemplates {...config} {...props} />;

  return EmailTemplatesPage;
};

export default createEmailTemplatesPage(ORDER_EMAIL_TEMPLATES_CONFIG);
