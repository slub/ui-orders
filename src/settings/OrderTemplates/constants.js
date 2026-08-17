import React from 'react';
import { FormattedMessage } from 'react-intl';

import {
  ACCORDION_ID as PO_LINE_ACCORDION,
  MAP_FIELD_ACCORDION as PO_LINE_FIELD_ACC_MAP,
} from '../../components/POLine/const';
import {
  MAP_FIELD_ACCORDION as PO_FIELD_ACC_MAP,
} from '../../components/PurchaseOrder/constants';

export const ORDER_TEMPLATES_ACCORDION = {
  TEMPLATE_INFO: 'templateInfo',
  PO_INFO: 'poInfo',
  PO_ONGOING: 'ongoing',
  PO_NOTES: 'poNotes',
  PO_TAGS: 'poTags',
  PO_SUMMARY: 'poSummary',
  POL_ITEM_DETAILS: PO_LINE_ACCORDION.itemDetails,
  POL_DETAILS: PO_LINE_ACCORDION.lineDetails,
  POL_COST_DETAILS: PO_LINE_ACCORDION.costDetails,
  POL_VENDOR: `accordion-${PO_LINE_ACCORDION.vendor}`,
  POL_FUND_DISTIBUTION: PO_LINE_ACCORDION.fundDistribution,
  POL_PAYMENT_TERMS: PO_LINE_ACCORDION.paymentTerms,
  POL_ERESOURCES: PO_LINE_ACCORDION.eresources,
  POL_FRESOURCES: PO_LINE_ACCORDION.physical,
  POL_OTHER_RESOURCES: PO_LINE_ACCORDION.other,
  POL_LOCATION: PO_LINE_ACCORDION.location,
  POL_DONORS_INFORMATION: PO_LINE_ACCORDION.donorsInformation,
  POL_TAGS: 'polTags',
  POL_ONGOING_ORDER: 'polOngoingOrder',
  PO_CUSTOM_FIELDS: 'poCustomFields',
  POL_CUSTOM_FIELDS: 'polCustomFields',
};

export const ORDER_TEMPLATES_ACCORDION_TITLES = {
  [ORDER_TEMPLATES_ACCORDION.TEMPLATE_INFO]: <FormattedMessage id="ui-orders.settings.orderTemplates.accordion.template" />,
  [ORDER_TEMPLATES_ACCORDION.PO_INFO]: <FormattedMessage id="ui-orders.settings.orderTemplates.accordion.poInfo" />,
  [ORDER_TEMPLATES_ACCORDION.PO_NOTES]: <FormattedMessage id="ui-orders.settings.orderTemplates.accordion.poNotes" />,
  [ORDER_TEMPLATES_ACCORDION.PO_TAGS]: <FormattedMessage id="ui-orders.settings.orderTemplates.accordion.poTags" />,
  [ORDER_TEMPLATES_ACCORDION.PO_SUMMARY]: <FormattedMessage id="ui-orders.settings.orderTemplates.accordion.poSummary" />,
  [ORDER_TEMPLATES_ACCORDION.PO_ONGOING]: <FormattedMessage id="ui-orders.settings.orderTemplates.accordion.poOngoing" />,
  [ORDER_TEMPLATES_ACCORDION.POL_ITEM_DETAILS]: <FormattedMessage id="ui-orders.settings.orderTemplates.accordion.poItemDetails" />,
  [ORDER_TEMPLATES_ACCORDION.POL_ONGOING_ORDER]: <FormattedMessage id="ui-orders.settings.orderTemplates.accordion.polOngoingOrder" />,
  [ORDER_TEMPLATES_ACCORDION.POL_DETAILS]: <FormattedMessage id="ui-orders.settings.orderTemplates.accordion.polDetails" />,
  [ORDER_TEMPLATES_ACCORDION.POL_COST_DETAILS]: <FormattedMessage id="ui-orders.settings.orderTemplates.accordion.polCostDetails" />,
  [ORDER_TEMPLATES_ACCORDION.POL_VENDOR]: <FormattedMessage id="ui-orders.settings.orderTemplates.accordion.polVendor" />,
  [ORDER_TEMPLATES_ACCORDION.POL_FUND_DISTIBUTION]: <FormattedMessage id="ui-orders.settings.orderTemplates.accordion.polFundDistribution" />,
  [ORDER_TEMPLATES_ACCORDION.POL_PAYMENT_TERMS]: <FormattedMessage id="ui-orders.settings.orderTemplates.accordion.polPaymentTerms" />,
  [ORDER_TEMPLATES_ACCORDION.POL_ERESOURCES]: <FormattedMessage id="ui-orders.settings.orderTemplates.accordion.polEResources" />,
  [ORDER_TEMPLATES_ACCORDION.POL_FRESOURCES]: <FormattedMessage id="ui-orders.settings.orderTemplates.accordion.polFResources" />,
  [ORDER_TEMPLATES_ACCORDION.POL_OTHER_RESOURCES]: <FormattedMessage id="ui-orders.settings.orderTemplates.accordion.polOtherResources" />,
  [ORDER_TEMPLATES_ACCORDION.POL_LOCATION]: <FormattedMessage id="ui-orders.settings.orderTemplates.accordion.polLocation" />,
  [ORDER_TEMPLATES_ACCORDION.POL_TAGS]: <FormattedMessage id="ui-orders.settings.orderTemplates.accordion.polTags" />,
  [ORDER_TEMPLATES_ACCORDION.POL_DONORS_INFORMATION]: <FormattedMessage id="ui-orders.line.accordion.donorInformation" />,
};

export const TEMPLATES_RETURN_LINK = '/settings/orders';
export const TEMPLATES_RETURN_LINK_LABEL_ID = 'ui-orders.settings';

export const INITIAL_SECTIONS = {
  [ORDER_TEMPLATES_ACCORDION.TEMPLATE_INFO]: true,
  [ORDER_TEMPLATES_ACCORDION.PO_INFO]: false,
  [ORDER_TEMPLATES_ACCORDION.PO_ONGOING]: false,
  [ORDER_TEMPLATES_ACCORDION.PO_NOTES]: false,
  [ORDER_TEMPLATES_ACCORDION.PO_TAGS]: false,
  [ORDER_TEMPLATES_ACCORDION.PO_SUMMARY]: false,
  [ORDER_TEMPLATES_ACCORDION.POL_ITEM_DETAILS]: false,
  [ORDER_TEMPLATES_ACCORDION.POL_ONGOING_ORDER]: false,
  [ORDER_TEMPLATES_ACCORDION.POL_DETAILS]: false,
  [ORDER_TEMPLATES_ACCORDION.POL_COST_DETAILS]: false,
  [ORDER_TEMPLATES_ACCORDION.POL_VENDOR]: false,
  [ORDER_TEMPLATES_ACCORDION.POL_FUND_DISTIBUTION]: false,
  [ORDER_TEMPLATES_ACCORDION.POL_PAYMENT_TERMS]: false,
  [ORDER_TEMPLATES_ACCORDION.POL_ERESOURCES]: false,
  [ORDER_TEMPLATES_ACCORDION.POL_FRESOURCES]: false,
  [ORDER_TEMPLATES_ACCORDION.POL_OTHER_RESOURCES]: false,
  [ORDER_TEMPLATES_ACCORDION.POL_LOCATION]: false,
  [ORDER_TEMPLATES_ACCORDION.POL_TAGS]: false,
  [ORDER_TEMPLATES_ACCORDION.PO_CUSTOM_FIELDS]: false,
  [ORDER_TEMPLATES_ACCORDION.POL_CUSTOM_FIELDS]: false,
  [ORDER_TEMPLATES_ACCORDION.POL_DONORS_INFORMATION]: false,
};

export const MAP_FIELD_ACCORDION = {
  ...PO_FIELD_ACC_MAP,
  ...PO_LINE_FIELD_ACC_MAP,
  templateName: ORDER_TEMPLATES_ACCORDION.TEMPLATE_INFO,
};
