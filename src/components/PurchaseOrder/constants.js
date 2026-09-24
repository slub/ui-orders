import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import ReactRouterPropTypes from 'react-router-prop-types';

import {
  reasonsForClosureResource,
  updateEncumbrancesResource,
} from '../../common/resources';
import {
  APPROVALS_SETTING,
  FUND,
  LINES_LIMIT,
  ORDER_NUMBER,
  ORDER,
} from '../Utils/resources';

export const PO_TEMPLATE_FIELDS_MAP = {
  'tags.tagList': 'poTags.tagList',
};

export const LINE_LISTING_COLUMN_MAPPING = {
  poLineNumber: <FormattedMessage id="ui-orders.poLine.number" />,
  title: <FormattedMessage id="ui-orders.lineListing.titleOrPackage" />,
  productId: <FormattedMessage id="ui-orders.lineListing.productId" />,
  vendorRefNumber: <FormattedMessage id="ui-orders.lineListing.refNumber" />,
  fundCode: <FormattedMessage id="ui-orders.lineListing.fundCode" />,
  estimatedPrice: <FormattedMessage id="ui-orders.cost.estimatedPrice" />,
  arrow: null,
};

export const ACCORDION_ID = {
  purchaseOrder: 'purchaseOrder',
  ongoing: 'ongoing',
  poSummary: 'poSummary',
};

export const INITIAL_SECTIONS = Object.keys(ACCORDION_ID).reduce(
  (acc, id) => ({ ...acc, [id]: true }), {},
);

// Mapping between attribute (field) in form and id of accordion
export const MAP_FIELD_ACCORDION = {
  poNumber: ACCORDION_ID.purchaseOrder,
  vendor: ACCORDION_ID.purchaseOrder,
  orderType: ACCORDION_ID.purchaseOrder,
  notes: ACCORDION_ID.purchaseOrder,
};

export const SUBMIT_ACTION = {
  saveAndClose: 'saveAndClose',
  saveAndKeepEditing: 'saveAndKeepEditing',
};

export const PO_MANIFEST = Object.freeze({
  orderDetails: {
    ...ORDER,
    accumulate: true,
    fetch: false,
  },
  linesLimit: LINES_LIMIT,
  closingReasons: reasonsForClosureResource,
  fund: FUND,
  approvalsSetting: APPROVALS_SETTING,
  generatedOrderNumber: ORDER_NUMBER,
  updateEncumbrances: updateEncumbrancesResource,
});

export const PO_PROP_TYPES = {
  history: ReactRouterPropTypes.history.isRequired,
  location: ReactRouterPropTypes.location.isRequired,
  match: ReactRouterPropTypes.match.isRequired,
  mutator: PropTypes.object.isRequired,
  resources: PropTypes.object.isRequired,
  refreshList: PropTypes.func.isRequired,
  stripes: PropTypes.object.isRequired,
};
