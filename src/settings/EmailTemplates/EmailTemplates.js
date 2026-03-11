import React from 'react';
import PropTypes from 'prop-types';
import { injectIntl } from 'react-intl';
import { sortBy } from 'lodash';

import { EntryManager } from '@folio/stripes/smart-components';
import { stripesConnect, TitleManager } from '@folio/stripes/core';

import EmailTemplateDetail from './EmailTemplateDetail';
import EmailTemplateForm from './EmailTemplateForm';
import {
  EMAIL_TEMPLATE_CATEGORY,
  RECIPIENT_LOGIC,
  TEMPLATE_MODULE,
} from './constants';

/**
 * EmailTemplates - Settings page for managing email templates for purchase orders.
 *
 * Uses EntryManager from stripes-smart-components for CRUD operations.
 * Similar to PatronNotices in ui-circulation.
 *
 * API: GET /templates?query=module==orders OR category==OrderEmail
 *
 * Tickets: UIOR-1492, UIOR-1493, UIOR-1494, UIOR-1495
 */
class EmailTemplates extends React.Component {
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
  };

  /**
   * Stripes Connect manifest - defines API resources
   *
   * entries: Loads email templates from /templates API
   * Filter by category to only get order email templates
   */
  static manifest = Object.freeze({
    entries: {
      type: 'okapi',
      path: 'templates',
      records: 'templates',
      params: {
        query: `cql.allRecords=1 AND (module=="${TEMPLATE_MODULE}" OR category=="${EMAIL_TEMPLATE_CATEGORY}")`,
      },
      perRequest: 100,
    },
  });

  render() {
    const {
      intl: { formatMessage },
      label,
      resources,
      mutator,
    } = this.props;

    // Sort entries alphabetically by name
    const entryList = sortBy((resources.entries || {}).records || [], ['name']);

    return (
      <TitleManager
        page={formatMessage({ id: 'ui-orders.settings.emailTemplates.label' })}
        record={formatMessage({ id: 'ui-orders.settings.emailTemplates.label' })}
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
            templateResolver: 'mustache',
            module: TEMPLATE_MODULE,
            recipientLogic: RECIPIENT_LOGIC.PRIMARY_EMAIL,
            attachmentFormats: [],
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
