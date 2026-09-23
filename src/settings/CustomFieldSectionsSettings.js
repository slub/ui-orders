import { FormattedMessage, useIntl } from 'react-intl';
import {
  Route,
  Switch,
} from 'react-router-dom';

import { CUSTOM_FIELDS_ORDERS_BACKEND_NAME } from '@folio/stripes-acq-components';
import {
  TitleManager,
  useStripes,
} from '@folio/stripes/core';
import { CustomFieldSectionsSettings as SectionsSettings } from '@folio/stripes/smart-components';

import {
  ENTITY_TYPE_ORDER,
  ENTITY_TYPE_PO_LINE,
} from '../common/constants';

const CustomFieldSectionsSettings = () => {
  const intl = useIntl();
  const stripes = useStripes();

  const permissions = {
    canView: stripes.hasPerm('ui-orders.settings.custom-fields.view'),
    canEdit: stripes.hasPerm('ui-orders.settings.custom-fields.edit'),
    canDelete: stripes.hasPerm('ui-orders.settings.custom-fields.delete'),
  };

  return (
    <Switch>
      <Route exact path="/settings/orders/custom-field-sections-po">
        <TitleManager record={intl.formatMessage({ id: 'ui-orders.settings.customFieldSections.purchaseOrders.label' })}>
          <SectionsSettings
            id="custom-field-sections-po"
            backendModuleName={CUSTOM_FIELDS_ORDERS_BACKEND_NAME}
            entityType={ENTITY_TYPE_ORDER}
            paneTitle={<FormattedMessage id="ui-orders.settings.customFieldSections.purchaseOrders.label" />}
            permissions={permissions}
          />
        </TitleManager>
      </Route>
      <Route exact path="/settings/orders/custom-field-sections-pol">
        <TitleManager record={intl.formatMessage({ id: 'ui-orders.settings.customFieldSections.purchaseOrderLines.label' })}>
          <SectionsSettings
            id="custom-field-sections-pol"
            backendModuleName={CUSTOM_FIELDS_ORDERS_BACKEND_NAME}
            entityType={ENTITY_TYPE_PO_LINE}
            paneTitle={<FormattedMessage id="ui-orders.settings.customFieldSections.purchaseOrderLines.label" />}
            permissions={permissions}
          />
        </TitleManager>
      </Route>
    </Switch>
  );
};

export default CustomFieldSectionsSettings;
