import get from 'lodash/get';
import PropTypes from 'prop-types';
import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  FormattedMessage,
  injectIntl,
} from 'react-intl';
import ReactRouterPropTypes from 'react-router-prop-types';

import {
  Accordion,
  AccordionSet,
  AccordionStatus,
  Button,
  checkScope,
  Col,
  collapseAllSections,
  ConfirmationModal,
  ExpandAllButton,
  expandAllSections,
  HasCommand,
  Icon,
  Layer,
  Pane,
  Row,
} from '@folio/stripes/components';
import {
  IfPermission,
  stripesShape,
} from '@folio/stripes/core';
import { ViewCustomFieldsRecord } from '@folio/stripes/smart-components';
import {
  CUSTOM_FIELDS_ORDERS_BACKEND_NAME,
  DonorsListContainer,
  FundDistributionView,
  handleKeyCommand,
  LoadingPane,
  ORDER_FORMATS,
  useShowCallout,
} from '@folio/stripes-acq-components';

import {
  ERESOURCES,
  PHRESOURCES,
} from '../../../components/POLine/const';
import { CostView } from '../../../components/POLine/Cost';
import { EresourcesView } from '../../../components/POLine/Eresources';
import { useIsFundsRestrictedByLocationIds } from '../../../components/POLine/hooks';
import { ItemView } from '../../../components/POLine/Item';
import LocationView from '../../../components/POLine/Location/LocationView';
import { OngoingOrderView } from '../../../components/POLine/OngoingOrder';
import { PaymentTermsViewContainer } from '../../../components/POLine/PaymentTerms';
import { OtherView } from '../../../components/POLine/Other';
import { PhysicalView } from '../../../components/POLine/Physical';
import { POLineDetails } from '../../../components/POLine/POLineDetails';
import { VendorView } from '../../../components/POLine/Vendor';
import { OngoingOrderInfoView } from '../../../components/PurchaseOrder/OngoingOrderInfo';
import { PODetailsView } from '../../../components/PurchaseOrder/PODetails';
import { SummaryView } from '../../../components/PurchaseOrder/Summary';
import {
  ENTITY_TYPE_ORDER,
  ENTITY_TYPE_PO_LINE,
  PO_CONFIG_NAME_PREFIX,
  PO_LINE_CONFIG_NAME_PREFIX,
  SCOPE_CUSTOM_FIELDS_MANAGE,
} from '../../../common/constants';
import { isOngoing } from '../../../common/POFields';
import {
  ORDER_TEMPLATES_ACCORDION,
  ORDER_TEMPLATES_ACCORDION_TITLES,
} from '../constants';
import OrderTemplateTagsView from './OrderTemplateTagsView';
import TemplateInformationView from './TemplateInformationView';

const sections = {
  [ORDER_TEMPLATES_ACCORDION.TEMPLATE_INFO]: true,
  [ORDER_TEMPLATES_ACCORDION.PO_INFO]: false,
  [ORDER_TEMPLATES_ACCORDION.PO_TAGS]: false,
  [ORDER_TEMPLATES_ACCORDION.PO_SUMMARY]: false,
  [ORDER_TEMPLATES_ACCORDION.PO_ONGOING]: false,
  [ORDER_TEMPLATES_ACCORDION.POL_ITEM_DETAILS]: false,
  [ORDER_TEMPLATES_ACCORDION.POL_DETAILS]: false,
  [ORDER_TEMPLATES_ACCORDION.POL_ONGOING_ORDER]: false,
  [ORDER_TEMPLATES_ACCORDION.POL_PAYMENT_TERMS]: false,
  [ORDER_TEMPLATES_ACCORDION.POL_COST_DETAILS]: false,
  [ORDER_TEMPLATES_ACCORDION.POL_VENDOR]: false,
  [ORDER_TEMPLATES_ACCORDION.POL_FUND_DISTIBUTION]: false,
  [ORDER_TEMPLATES_ACCORDION.POL_ERESOURCES]: false,
  [ORDER_TEMPLATES_ACCORDION.POL_FRESOURCES]: false,
  [ORDER_TEMPLATES_ACCORDION.POL_OTHER_RESOURCES]: false,
  [ORDER_TEMPLATES_ACCORDION.POL_LOCATION]: false,
  [ORDER_TEMPLATES_ACCORDION.POL_TAGS]: false,
  [ORDER_TEMPLATES_ACCORDION.PO_CUSTOM_FIELDS]: false,
  [ORDER_TEMPLATES_ACCORDION.POL_DONORS_INFORMATION]: false,
};

const defaultProps = {
  addresses: [],
  locations: [],
  materialTypes: [],
  orderTemplate: {},
};

const OrderTemplateView = (props) => {
  const {
    addresses = defaultProps.addresses,
    close,
    history,
    intl,
    isLoading,
    locations = defaultProps.locations,
    materialTypes = defaultProps.materialTypes,
    onDelete,
    onDuplicate,
    orderTemplate = defaultProps.orderTemplate,
    orderTemplateCategories,
    rootPath,
    stripes,
  } = props;

  const showCallout = useShowCallout();

  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [showConfirmDuplicate, setShowConfirmDuplicate] = useState(false);
  const accordionStatusRef = useRef();

  const { hasLocationRestrictedFund } = useIsFundsRestrictedByLocationIds(orderTemplate);

  useEffect(() => {
    if (hasLocationRestrictedFund) {
      showCallout({
        messageId: 'ui-orders.errors.poLineHasLocationRestrictedFund',
        type: 'error',
      });
    }
  }, [hasLocationRestrictedFund, showCallout]);

  const toggleDuplicateConfirmModal = () => {
    setShowConfirmDuplicate(prev => !prev);
  };

  const onDuplicateOrderTemplate = () => {
    toggleDuplicateConfirmModal();
    onDuplicate(orderTemplate);
  };

  const onDeleteOrderTemplate = () => {
    setShowConfirmDelete(false);
    onDelete();
  };

  const showConfirmDeleteModal = () => setShowConfirmDelete(true);

  const hideConfirmDelete = () => setShowConfirmDelete(false);

  const getActionMenu = ({ onToggle }) => {
    const id = get(orderTemplate, 'id');

    return (
      <div data-test-view-order-template-actions>
        <IfPermission perm="ui-orders.settings.order-templates.edit">
          <Button
            data-test-view-order-template-action-edit
            buttonStyle="dropdownItem"
            to={`${rootPath}/${id}/edit`}
          >
            <Icon icon="edit">
              <FormattedMessage id="ui-orders.button.edit" />
            </Icon>
          </Button>
        </IfPermission>

        <IfPermission perm="ui-orders.settings.order-templates.create">
          <Button
            data-testid="view-order-template-action-duplicate"
            buttonStyle="dropdownItem"
            onClick={() => {
              onToggle();
              toggleDuplicateConfirmModal();
            }}
          >
            <Icon icon="duplicate">
              <FormattedMessage id="ui-orders.paneBlock.cloneBtn" />
            </Icon>
          </Button>
        </IfPermission>

        <IfPermission perm="ui-orders.settings.order-templates.delete">
          <Button
            data-test-view-order-template-action-delete
            data-testid="view-order-template-action-delete"
            buttonStyle="dropdownItem"
            onClick={() => {
              onToggle();
              showConfirmDeleteModal();
            }}
          >
            <Icon icon="trash">
              <FormattedMessage id="ui-orders.button.delete" />
            </Icon>
          </Button>
        </IfPermission>
      </div>
    );
  };

  const title = get(orderTemplate, 'templateName', '');
  const orderFormat = get(orderTemplate, 'orderFormat');
  const showEresources = ERESOURCES.includes(orderFormat);
  const showPhresources = PHRESOURCES.includes(orderFormat);
  const showOther = orderFormat === ORDER_FORMATS.other;
  const orderType = get(orderTemplate, 'orderType');
  const customFieldsValues = get(orderTemplate, 'customFields', {});
  const donorOrganizationIds = get(orderTemplate, 'donorOrganizationIds', []);

  const estimatedPrice = get(orderTemplate, ['cost', 'poLineEstimatedPrice'], 0);
  const fundDistributions = get(orderTemplate, 'fundDistribution');

  const shortcuts = useMemo(() => [
    {
      name: 'cancel',
      shortcut: 'esc',
      handler: handleKeyCommand(close),
    },
    {
      name: 'edit',
      handler: handleKeyCommand(() => {
        if (stripes.hasPerm('ui-orders.settings.order-templates.edit')) history.push(`${rootPath}/${orderTemplate.id}/edit`);
      }),
    },
    {
      name: 'duplicateRecord',
      handler: handleKeyCommand(() => {
        if (stripes.hasPerm('ui-orders.settings.order-templates.create')) toggleDuplicateConfirmModal();
      }),
    },
    {
      name: 'expandAllSections',
      handler: (e) => expandAllSections(e, accordionStatusRef),
    },
    {
      name: 'collapseAllSections',
      handler: (e) => collapseAllSections(e, accordionStatusRef),
    },
  ], [close, history, orderTemplate.id, rootPath, stripes]);

  const deleteTemplateModalLabel = intl.formatMessage({ id: 'ui-orders.settings.orderTemplates.confirmDelete.heading' });

  if (isLoading) {
    return (
      <Layer isOpen>
        <LoadingPane
          defaultWidth="fill"
          dismissible
          onClose={close}
          paneTitle={title}
        />
      </Layer>
    );
  }

  return (
    <Layer
      contentLabel="Order template details"
      isOpen
    >
      <HasCommand
        commands={shortcuts}
        isWithinScope={checkScope}
        scope={document.body}
      >
        <Pane
          actionMenu={getActionMenu}
          id="order-settings-order-template-view"
          defaultWidth="fill"
          paneTitle={title}
          dismissible
          onClose={close}
        >
          <AccordionStatus ref={accordionStatusRef}>
            <Row center="xs">
              <Col xs={12} md={8}>
                <Row end="xs">
                  <Col xs={12}>
                    <ExpandAllButton />
                  </Col>
                </Row>
              </Col>
            </Row>

            <Row center="xs">
              <Col xs={12} md={8}>
                <AccordionSet initialStatus={sections}>
                  <Accordion
                    label={ORDER_TEMPLATES_ACCORDION_TITLES[ORDER_TEMPLATES_ACCORDION.TEMPLATE_INFO]}
                    id={ORDER_TEMPLATES_ACCORDION.TEMPLATE_INFO}
                  >
                    <TemplateInformationView
                      orderTemplate={orderTemplate}
                      orderTemplateCategories={orderTemplateCategories}
                    />
                  </Accordion>

                  <Accordion
                    label={ORDER_TEMPLATES_ACCORDION_TITLES[ORDER_TEMPLATES_ACCORDION.PO_INFO]}
                    id={ORDER_TEMPLATES_ACCORDION.PO_INFO}
                  >
                    <PODetailsView
                      addresses={addresses}
                      order={orderTemplate}
                    />
                  </Accordion>

                  <Accordion
                    label={ORDER_TEMPLATES_ACCORDION_TITLES[ORDER_TEMPLATES_ACCORDION.PO_TAGS]}
                    id={ORDER_TEMPLATES_ACCORDION.PO_TAGS}
                  >
                    <OrderTemplateTagsView tags={get(orderTemplate, 'poTags.tagList')} />
                  </Accordion>

                  <Accordion
                    label={ORDER_TEMPLATES_ACCORDION_TITLES[ORDER_TEMPLATES_ACCORDION.PO_SUMMARY]}
                    id={ORDER_TEMPLATES_ACCORDION.PO_SUMMARY}
                  >
                    <SummaryView order={orderTemplate} />
                  </Accordion>

                  {isOngoing(orderType) && (
                    <Accordion
                      label={ORDER_TEMPLATES_ACCORDION_TITLES[ORDER_TEMPLATES_ACCORDION.PO_ONGOING]}
                      id={ORDER_TEMPLATES_ACCORDION.PO_ONGOING}
                    >
                      <OngoingOrderInfoView order={orderTemplate} />
                    </Accordion>
                  )}

                  <Accordion
                    label={ORDER_TEMPLATES_ACCORDION_TITLES[ORDER_TEMPLATES_ACCORDION.POL_ITEM_DETAILS]}
                    id={ORDER_TEMPLATES_ACCORDION.POL_ITEM_DETAILS}
                  >
                    <ItemView poLineDetails={orderTemplate} />
                  </Accordion>

                  <Accordion
                    label={ORDER_TEMPLATES_ACCORDION_TITLES[ORDER_TEMPLATES_ACCORDION.POL_DETAILS]}
                    id={ORDER_TEMPLATES_ACCORDION.POL_DETAILS}
                  >
                    <POLineDetails line={orderTemplate} />
                  </Accordion>

                  <Accordion
                    label={ORDER_TEMPLATES_ACCORDION_TITLES[ORDER_TEMPLATES_ACCORDION.POL_DONORS_INFORMATION]}
                    id={ORDER_TEMPLATES_ACCORDION.POL_DONORS_INFORMATION}
                  >
                    <DonorsListContainer donorOrganizationIds={donorOrganizationIds} />
                  </Accordion>

                  {isOngoing(orderType) && (
                    <Accordion
                      label={ORDER_TEMPLATES_ACCORDION_TITLES[ORDER_TEMPLATES_ACCORDION.POL_ONGOING_ORDER]}
                      id={ORDER_TEMPLATES_ACCORDION.POL_ONGOING_ORDER}
                    >
                      <OngoingOrderView
                        multiYearPayment={orderTemplate.multiYearPayment}
                        renewalNote={orderTemplate.renewalNote}
                      />
                    </Accordion>
                  )}

                  <Accordion
                    label={ORDER_TEMPLATES_ACCORDION_TITLES[ORDER_TEMPLATES_ACCORDION.POL_VENDOR]}
                    id={ORDER_TEMPLATES_ACCORDION.POL_VENDOR}
                  >
                    <VendorView
                      vendorDetail={orderTemplate.vendorDetail}
                      vendorId={orderTemplate.vendor}
                    />
                  </Accordion>

                  <Accordion
                    label={ORDER_TEMPLATES_ACCORDION_TITLES[ORDER_TEMPLATES_ACCORDION.POL_COST_DETAILS]}
                    id={ORDER_TEMPLATES_ACCORDION.POL_COST_DETAILS}
                  >
                    <CostView
                      cost={orderTemplate.cost}
                      isPackage={orderTemplate.isPackage}
                      orderFormat={orderFormat}
                    />
                  </Accordion>

                  <Accordion
                    label={ORDER_TEMPLATES_ACCORDION_TITLES[ORDER_TEMPLATES_ACCORDION.POL_FUND_DISTIBUTION]}
                    id={ORDER_TEMPLATES_ACCORDION.POL_FUND_DISTIBUTION}
                  >
                    <FundDistributionView
                      fundDistributions={fundDistributions}
                      totalAmount={estimatedPrice}
                    />
                  </Accordion>

                  {isOngoing(orderType) && orderTemplate.multiYearPayment && (
                    <Accordion
                      label={ORDER_TEMPLATES_ACCORDION_TITLES[ORDER_TEMPLATES_ACCORDION.POL_PAYMENT_TERMS]}
                      id={ORDER_TEMPLATES_ACCORDION.POL_PAYMENT_TERMS}
                    >
                      <PaymentTermsViewContainer
                        currency={orderTemplate.cost?.currency}
                        paymentTerms={orderTemplate.paymentTerms}
                      />
                    </Accordion>
                  )}

                  <Accordion
                    label={ORDER_TEMPLATES_ACCORDION_TITLES[ORDER_TEMPLATES_ACCORDION.POL_LOCATION]}
                    id={ORDER_TEMPLATES_ACCORDION.POL_LOCATION}
                  >
                    <LocationView
                      instanceId={orderTemplate.instanceId}
                      lineLocations={orderTemplate.locations}
                      locations={locations}
                    />
                  </Accordion>

                  {showPhresources && (
                    <Accordion
                      label={ORDER_TEMPLATES_ACCORDION_TITLES[ORDER_TEMPLATES_ACCORDION.POL_FRESOURCES]}
                      id={ORDER_TEMPLATES_ACCORDION.POL_FRESOURCES}
                    >
                      <PhysicalView
                        materialTypes={materialTypes}
                        physical={orderTemplate.physical}
                      />
                    </Accordion>
                  )}

                  {showEresources && (
                    <Accordion
                      label={ORDER_TEMPLATES_ACCORDION_TITLES[ORDER_TEMPLATES_ACCORDION.POL_ERESOURCES]}
                      id={ORDER_TEMPLATES_ACCORDION.POL_ERESOURCES}
                    >
                      <EresourcesView
                        isTemplate
                        line={orderTemplate}
                        materialTypes={materialTypes}
                      />
                    </Accordion>
                  )}

                  {showOther && (
                    <Accordion
                      label={ORDER_TEMPLATES_ACCORDION_TITLES[ORDER_TEMPLATES_ACCORDION.POL_OTHER_RESOURCES]}
                      id={ORDER_TEMPLATES_ACCORDION.POL_OTHER_RESOURCES}
                    >
                      <OtherView
                        materialTypes={materialTypes}
                        physical={orderTemplate.physical}
                      />
                    </Accordion>
                  )}

                  <Accordion
                    label={ORDER_TEMPLATES_ACCORDION_TITLES[ORDER_TEMPLATES_ACCORDION.POL_TAGS]}
                    id={ORDER_TEMPLATES_ACCORDION.POL_TAGS}
                  >
                    <OrderTemplateTagsView tags={get(orderTemplate, 'polTags.tagList')} />
                  </Accordion>

                  <ViewCustomFieldsRecord
                    accordionId={ORDER_TEMPLATES_ACCORDION.PO_CUSTOM_FIELDS}
                    backendModuleName={CUSTOM_FIELDS_ORDERS_BACKEND_NAME}
                    customFieldsValues={customFieldsValues}
                    entityType={ENTITY_TYPE_ORDER}
                    configNamePrefix={PO_CONFIG_NAME_PREFIX}
                    scope={SCOPE_CUSTOM_FIELDS_MANAGE}
                  />

                  <ViewCustomFieldsRecord
                    accordionId={ORDER_TEMPLATES_ACCORDION.POL_CUSTOM_FIELDS}
                    backendModuleName={CUSTOM_FIELDS_ORDERS_BACKEND_NAME}
                    customFieldsValues={customFieldsValues}
                    entityType={ENTITY_TYPE_PO_LINE}
                    configNamePrefix={PO_LINE_CONFIG_NAME_PREFIX}
                    scope={SCOPE_CUSTOM_FIELDS_MANAGE}
                  />
                </AccordionSet>
              </Col>
            </Row>
          </AccordionStatus>
          {showConfirmDelete && (
            <ConfirmationModal
              aria-label={deleteTemplateModalLabel}
              id="delete-order-template-modal"
              confirmLabel={<FormattedMessage id="ui-orders.settings.orderTemplates.confirmDelete.confirmLabel" />}
              heading={deleteTemplateModalLabel}
              message={<FormattedMessage id="ui-orders.settings.orderTemplates.confirmDelete.message" />}
              onCancel={hideConfirmDelete}
              onConfirm={onDeleteOrderTemplate}
              open
            />
          )}

          {showConfirmDuplicate && (
            <ConfirmationModal
              id="duplicate-order-template-modal"
              heading={<FormattedMessage id="ui-orders.settings.orderTemplates.confirmDuplicate.heading" />}
              message={<FormattedMessage id="ui-orders.settings.orderTemplates.confirmDuplicate.message" />}
              onCancel={toggleDuplicateConfirmModal}
              onConfirm={onDuplicateOrderTemplate}
              open
            />
          )}
        </Pane>
      </HasCommand>
    </Layer>
  );
};

OrderTemplateView.propTypes = {
  addresses: PropTypes.arrayOf(PropTypes.shape({})),
  close: PropTypes.func.isRequired,
  history: ReactRouterPropTypes.history.isRequired,
  intl: PropTypes.shape({}).isRequired,
  isLoading: PropTypes.bool,
  locations: PropTypes.arrayOf(PropTypes.shape({})),
  materialTypes: PropTypes.arrayOf(PropTypes.shape({})),
  onDelete: PropTypes.func.isRequired,
  onDuplicate: PropTypes.func.isRequired,
  orderTemplate: PropTypes.shape({}),
  orderTemplateCategories: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string,
    name: PropTypes.string,
  })).isRequired,
  rootPath: PropTypes.string,
  stripes: stripesShape.isRequired,
};

export default injectIntl(OrderTemplateView);
