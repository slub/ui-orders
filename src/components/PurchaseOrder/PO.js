import get from 'lodash/get';
import PropTypes from 'prop-types';
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  FormattedMessage,
  useIntl,
} from 'react-intl';
import ReactRouterPropTypes from 'react-router-prop-types';

import {
  IfPermission,
  TitleManager,
  stripesConnect,
} from '@folio/stripes/core';
import {
  baseManifest,
  CUSTOM_FIELDS_ORDERS_BACKEND_NAME,
  getErrorCodeFromResponse,
  handleKeyCommand,
  IfVisible,
  Tags,
  TagsBadge,
  useModalToggle,
  useShowCallout,
  VersionHistoryButton,
} from '@folio/stripes-acq-components';
import {
  Accordion,
  AccordionSet,
  AccordionStatus,
  Button,
  checkScope,
  Col,
  collapseAllSections,
  ConfirmationModal,
  Dropdown,
  DropdownMenu,
  ErrorModal,
  ExpandAllButton,
  expandAllSections,
  HasCommand,
  Icon,
  Loading,
  LoadingPane,
  MenuSection,
  Pane,
  PaneMenu,
  Row,
} from '@folio/stripes/components';
import {
  ColumnManagerMenu,
  useColumnManager,
  ViewCustomFieldsRecord,
} from '@folio/stripes/smart-components';

import {
  ExportDetailsAccordion,
  ReexportModal,
} from '../../common';
import {
  ENTITY_TYPE_ORDER,
  ERROR_CODES,
  INVOICES_ROUTE,
  ORDERS_ROUTE,
  PO_CONFIG_NAME_PREFIX,
  REEXPORT_SOURCES,
  SCOPE_CUSTOM_FIELDS_MANAGE,
  WORKFLOW_STATUS,
} from '../../common/constants';
import { useHandleOrderUpdateError } from '../../common/hooks';
import { isOngoing } from '../../common/POFields';
import {
  reasonsForClosureResource,
  updateEncumbrancesResource,
} from '../../common/resources';
import {
  getCommonErrorMessage,
  getExportAccountNumbers,
} from '../../common/utils';
import {
  PrintOrder,
} from '../../PrintOrder';
import ModalDeletePieces from '../ModalDeletePieces';
import { LINES_LIMIT_DEFAULT } from '../Utils/const';
import {
  cloneOrder,
  updateOrderResource,
} from '../Utils/orderResource';
import {
  APPROVALS_SETTING,
  FUND,
  LINES_LIMIT,
  ORDER_NUMBER,
  ORDER,
} from '../Utils/resources';
import CloseOrderModal from './CloseOrder';
import { LINE_LISTING_COLUMN_MAPPING } from './constants';
import { getPOActionMenu } from './getPOActionMenu';
import {
  useOrderMutation,
  usePurchaseOrderResources,
} from './hooks';
import LineListing from './LineListing';
import LinesLimit from './LinesLimit';
import { ManualExportModal } from './ManualExportModal';
import { OngoingOrderInfoView } from './OngoingOrderInfo';
import OpenOrderConfirmationModal from './OpenOrderConfirmationModal';
import { PODetailsView } from './PODetails';
import POInvoicesContainer from './POInvoices';
import { SummaryView } from './Summary';
import { UnopenOrderConfirmationModal } from './UnopenOrderConfirmationModal';
import { UpdateOrderErrorModal } from './UpdateOrderErrorModal';

const PO = ({
  history,
  location,
  match,
  mutator,
  resources,
  refreshList,
  stripes,
}) => {
  const intl = useIntl();
  const sendCallout = useShowCallout();
  const accordionStatusRef = useRef();
  const [handleErrorResponse] = useHandleOrderUpdateError(mutator.expenseClass);
  const { visibleColumns, toggleColumn } = useColumnManager('line-listing-column-manager', LINE_LISTING_COLUMN_MAPPING);
  const { updateOrder } = useOrderMutation();

  const [isLoading, setIsLoading] = useState(false);
  const [updateOrderErrors, setUpdateOrderErrors] = useState();
  const [hiddenFields, setHiddenFields] = useState({});
  const [accountNumbers, setAccountNumbers] = useState([]);
  const [isCancelReason, setIsCancelReason] = useState(false);
  const [selectedFiscalYear, setSelectedFiscalYear] = useState(null);

  const [isErrorsModalOpened, toggleErrorsModal] = useModalToggle();
  const [isCloneConfirmation, toggleCloneConfirmation] = useModalToggle();
  const [isTagsPaneOpened, toggleTagsPane] = useModalToggle();
  const [isLinesLimitExceededModalOpened, toggleLinesLimitExceededModal] = useModalToggle();
  const [isCloseOrderModalOpened, toggleCloseOrderModal] = useModalToggle();
  const [showConfirmDelete, toggleDeleteOrderConfirm] = useModalToggle();
  const [isOpenOrderModalOpened, toggleOpenOrderModal] = useModalToggle();
  const [isUnopenOrderModalOpened, toggleUnopenOrderModal] = useModalToggle();
  const [isDeletePiecesOpened, toggleDeletePieces] = useModalToggle();
  const [isPrintModalOpened, togglePrintModal] = useModalToggle();
  const [isDifferentAccountModalOpened, toggleDifferentAccountModal] = useModalToggle();
  const [isCreateInvoiceModalOpened, toggleCreateInvoiceModal] = useModalToggle();
  const [isOrderReexportModalOpened, toggleOrderReexportModal] = useModalToggle();
  const [isManualExportModalOpened, toggleManualExportModal] = useModalToggle();

  const orderId = match.params.id;

  const {
    addresses,
    exportHistory,
    fiscalYearsGrouped,
    isAddressesLoading,
    isExportHistoryLoading,
    isFiscalYearsFetching,
    isOrderInvoiceRelationshipsLoading,
    isOrderLinesFetching,
    isOrderLoading,
    isOrderTemplateLoading,
    isRestrictionsLoading,
    order,
    orderInvoiceRelationships,
    orderLines,
    orderTemplate,
    refetchFiscalYears,
    refetchOrder: refetch,
    refetchOrderLines,
    restrictions,
  } = usePurchaseOrderResources(orderId, selectedFiscalYear);

  useEffect(() => {
    // Reset the selected fiscal year if PO has changed.
    setSelectedFiscalYear(null);
  }, [orderId]);

  useEffect(() => {
    // Set default fiscal year if not selected
    if (!selectedFiscalYear && fiscalYearsGrouped?.current?.length) {
      setSelectedFiscalYear(fiscalYearsGrouped.current[0].id);
    }
  }, [fiscalYearsGrouped, selectedFiscalYear]);

  const reasonsForClosure = get(resources, 'closingReasons.records');
  const orderNumber = get(order, 'poNumber', '');
  const poLinesCount = orderLines?.length || 0;
  const workflowStatus = get(order, 'workflowStatus');
  const isAbleToAddLines = workflowStatus === WORKFLOW_STATUS.pending;
  const tags = get(order, 'tags.tagList', []);
  const orderType = get(order, 'orderType');
  const funds = get(resources, 'fund.records', []);
  const approvalsSetting = get(resources, 'approvalsSetting.records', {});
  const customFieldsValues = get(order, 'customFields', {});

  const deleteOrderModalLabel = intl.formatMessage(
    { id: 'ui-orders.order.delete.heading' },
    { orderNumber },
  );
  const cloneOrderModalLabel = intl.formatMessage({ id: 'ui-orders.order.clone.heading' });
  const differentAccountModalLabel = intl.formatMessage({ id: 'ui-orders.differentAccounts.title' });
  const createInvoiceModalLabel = intl.formatMessage({ id: 'ui-orders.createInvoice.confirmationModal.title' });

  const orderInvoicesIds = useMemo(() => {
    return orderInvoiceRelationships.map(({ invoiceId }) => invoiceId);
  }, [orderInvoiceRelationships]);

  const openVersionHistory = useCallback(() => {
    history.push({
      pathname: `${ORDERS_ROUTE}/view/${order.id}/versions`,
      search: location.search,
    });
  }, [history, location.search, order.id]);

  const lastMenu = (
    <PaneMenu>
      <TagsBadge
        tagsToggle={toggleTagsPane}
        tagsQuantity={tags.length}
      />
      <VersionHistoryButton onClick={openVersionHistory} />
    </PaneMenu>
  );

  useEffect(() => {
    setHiddenFields(orderTemplate.hiddenFields);
  }, [orderTemplate]);

  const orderErrorModalShow = useCallback((errors) => {
    toggleErrorsModal();
    setUpdateOrderErrors(errors);
  }, [toggleErrorsModal]);

  const orderErrorModalClose = useCallback(() => {
    toggleErrorsModal();
    setUpdateOrderErrors();
  }, [toggleErrorsModal]);

  const onCloneOrder = useCallback(() => {
    toggleCloneConfirmation();
    setIsLoading(true);
    cloneOrder(order, mutator.orderDetails, mutator.generatedOrderNumber, orderLines)
      .then(newOrder => {
        sendCallout({
          message: <FormattedMessage id="ui-orders.order.clone.success" />,
          type: 'success',
        });
        history.push({
          pathname: `/orders/view/${newOrder.id}`,
          search: location.search,
        });
        refreshList();
      })
      .catch(e => {
        return handleErrorResponse(e, orderErrorModalShow, 'clone.error');
      })
      .finally(() => setIsLoading(false));
  }, [
    toggleCloneConfirmation,
    order,
    mutator.orderDetails,
    mutator.generatedOrderNumber,
    orderLines,
    sendCallout,
    history,
    location.search,
    refreshList,
    handleErrorResponse,
    orderErrorModalShow,
  ]);

  const deletePO = useCallback(() => {
    toggleDeleteOrderConfirm();
    setIsLoading(true);
    mutator.orderDetails.DELETE(order, { silent: true })
      .then(() => {
        sendCallout({
          message: <FormattedMessage id="ui-orders.order.delete.success" values={{ orderNumber }} />,
          type: 'success',
        });
        refreshList();
        history.replace({
          pathname: '/orders',
          search: location.search,
        });
      })
      .catch(async (errorResponse) => {
        const errorCode = await getErrorCodeFromResponse(errorResponse);
        const defaultMessage = intl.formatMessage({ id: 'ui-orders.errors.orderWasNotDeleted' });
        const message = getCommonErrorMessage(errorCode, defaultMessage);

        sendCallout({
          message,
          type: 'error',
        });
      })
      .finally(() => setIsLoading(false));
  }, [
    toggleDeleteOrderConfirm,
    mutator.orderDetails,
    order,
    sendCallout,
    orderNumber,
    refreshList,
    history,
    location.search,
    intl,
  ]);

  const closeOrder = useCallback((reason, note) => {
    const closeOrderProps = {
      workflowStatus: WORKFLOW_STATUS.closed,
      closeReason: {
        reason,
        note,
      },
    };

    setIsCancelReason(false);
    toggleCloseOrderModal();
    setIsLoading(true);
    updateOrderResource(order, mutator.orderDetails, closeOrderProps)
      .then(
        () => {
          sendCallout({ message: <FormattedMessage id="ui-orders.closeOrder.success" /> });
          refreshList();
          refetchFiscalYears();

          return refetch();
        },
        e => handleErrorResponse(e, orderErrorModalShow, 'closeOrder'),
      )
      .finally(() => setIsLoading(false));
  }, [
    toggleCloseOrderModal,
    order,
    mutator.orderDetails,
    sendCallout,
    refreshList,
    refetch,
    refetchFiscalYears,
    handleErrorResponse,
    orderErrorModalShow,
  ]);

  const cancelClosingOrder = useCallback(() => {
    setIsCancelReason(false);
    toggleCloseOrderModal();
  }, [toggleCloseOrderModal]);

  const approveOrder = useCallback(() => {
    setIsLoading(true);
    updateOrderResource(order, mutator.orderDetails, { approved: true })
      .then(
        () => {
          sendCallout({
            message: <FormattedMessage id="ui-orders.order.approved.success" values={{ orderNumber }} />,
          });
          refreshList();

          return refetch();
        },
        e => {
          return handleErrorResponse(e, orderErrorModalShow);
        },
      )
      .finally(() => setIsLoading(false));
  }, [
    order,
    mutator.orderDetails,
    sendCallout,
    orderNumber,
    refreshList,
    refetch,
    handleErrorResponse,
    orderErrorModalShow,
  ]);

  const openOrder = useCallback(() => {
    const openOrderProps = {
      workflowStatus: WORKFLOW_STATUS.open,
    };

    if (isOpenOrderModalOpened) toggleOpenOrderModal();

    const exportAccountNumbers = getExportAccountNumbers(orderLines);

    if (!order.manualPo && exportAccountNumbers.length > 1) {
      setAccountNumbers(exportAccountNumbers);

      return toggleDifferentAccountModal();
    }

    setIsLoading(true);

    return updateOrderResource(order, mutator.orderDetails, openOrderProps)
      .then(
        () => {
          sendCallout({
            message: <FormattedMessage id="ui-orders.order.open.success" values={{ orderNumber: order?.poNumber }} />,
            type: 'success',
          });
          refreshList();
          refetchFiscalYears();
          refetchOrderLines();

          return refetch();
        },
        e => {
          return handleErrorResponse(e, orderErrorModalShow, ERROR_CODES.orderGenericError1, toggleDeletePieces);
        },
      )
      .finally(() => setIsLoading(false));
  }, [
    isOpenOrderModalOpened,
    toggleOpenOrderModal,
    orderLines,
    order,
    mutator.orderDetails,
    toggleDifferentAccountModal,
    sendCallout,
    refreshList,
    refetch,
    refetchOrderLines,
    refetchFiscalYears,
    handleErrorResponse,
    orderErrorModalShow,
    toggleDeletePieces,
  ]);

  const reopenOrder = useCallback(() => {
    const openOrderProps = {
      workflowStatus: WORKFLOW_STATUS.open,
    };

    setIsLoading(true);
    updateOrderResource(order, mutator.orderDetails, openOrderProps)
      .then(
        () => {
          sendCallout({
            message: <FormattedMessage id="ui-orders.order.reopen.success" values={{ orderNumber }} />,
            type: 'success',
          });
          refreshList();
          refetchFiscalYears();
          refetchOrderLines();

          return refetch();
        },
        e => {
          return handleErrorResponse(e, orderErrorModalShow);
        },
      )
      .finally(() => setIsLoading(false));
  }, [
    order,
    mutator.orderDetails,
    sendCallout,
    orderNumber,
    refreshList,
    refetch,
    refetchOrderLines,
    refetchFiscalYears,
    handleErrorResponse,
    orderErrorModalShow,
  ]);

  const unopenOrder = useCallback(({ deleteHoldings }) => {
    const searchParams = { deleteHoldings };
    const changedData = {
      workflowStatus: WORKFLOW_STATUS.pending,
    };

    toggleUnopenOrderModal();
    setIsLoading(true);
    updateOrder({ searchParams, order, changedData })
      .then(
        () => {
          sendCallout({
            message: <FormattedMessage id="ui-orders.order.unopen.success" values={{ orderNumber }} />,
            type: 'success',
          });
          refreshList();
          refetchFiscalYears();
          refetchOrderLines();

          return refetch();
        },
        (e) => {
          return handleErrorResponse(e?.response, orderErrorModalShow);
        },
      )
      .finally(() => setIsLoading(false));
  }, [
    handleErrorResponse,
    order,
    orderErrorModalShow,
    orderNumber,
    refetch,
    refetchFiscalYears,
    refreshList,
    refetchOrderLines,
    sendCallout,
    toggleUnopenOrderModal,
    updateOrder,
  ]);

  const createNewOrder = useCallback(() => {
    toggleLinesLimitExceededModal();
    setIsLoading(true);
    cloneOrder(order, mutator.orderDetails, mutator.generatedOrderNumber)
      .then(newOrder => {
        history.push({
          pathname: `/orders/view/${newOrder.id}/po-line/create`,
          search: location.search,
        });
      })
      .catch(e => {
        return handleErrorResponse(e, orderErrorModalShow, 'noCreatedOrder');
      })
      .finally(() => setIsLoading(false));
  }, [
    handleErrorResponse,
    history,
    location.search,
    mutator.generatedOrderNumber,
    mutator.orderDetails,
    order,
    orderErrorModalShow,
    toggleLinesLimitExceededModal,
  ]);

  const gotToOrdersList = useCallback(() => {
    history.push({
      pathname: '/orders',
      search: location.search,
    });
  }, [history, location.search]);

  const goToReceiving = useCallback(() => {
    history.push({
      pathname: '/receiving',
      search: `qindex=purchaseOrder.poNumber&query=${orderNumber}`,
    });
  }, [orderNumber, history]);

  const onEdit = useCallback(() => {
    history.push({
      pathname: `/orders/edit/${match.params.id}`,
      search: location.search,
    });
  }, [location.search, match.params.id, history]);

  const onAddPOLine = useCallback(() => {
    const linesLimit = Number(get(resources, ['linesLimit', 'records', '0', 'value'], LINES_LIMIT_DEFAULT));

    if (linesLimit <= poLinesCount) {
      toggleLinesLimitExceededModal();
    } else {
      history.push({
        pathname: `/orders/view/${match.params.id}/po-line/create`,
        search: location.search,
      });
    }
  }, [
    resources,
    match.params.id,
    history,
    location.search,
    poLinesCount,
    toggleLinesLimitExceededModal,
  ]);

  const lineListingActionMenu = useMemo(() => (
    <Dropdown
      data-testid="line-listing-action-dropdown"
      label={<FormattedMessage id="stripes-components.paneMenuActionsToggleLabel" />}
      buttonProps={{ buttonStyle: 'primary' }}
    >
      <DropdownMenu>
        <MenuSection>
          <IfPermission perm="orders.po-lines.item.post">
            <Button
              data-test-add-line-button
              data-testid="add-line-button"
              buttonStyle="dropdownItem"
              disabled={!isAbleToAddLines}
              onClick={onAddPOLine}
            >
              <Icon size="small" icon="plus-sign">
                <FormattedMessage id="ui-orders.button.addLine" />
              </Icon>
            </Button>
          </IfPermission>
        </MenuSection>

        <ColumnManagerMenu
          prefix="line-listing"
          columnMapping={LINE_LISTING_COLUMN_MAPPING}
          visibleColumns={visibleColumns}
          toggleColumn={toggleColumn}
          excludeColumns={['arrow']}
        />
      </DropdownMenu>
    </Dropdown>
  ), [isAbleToAddLines, onAddPOLine, toggleColumn, visibleColumns]);

  const updateOrderCB = useCallback(async (orderWithTags) => {
    await mutator.orderDetails.PUT(orderWithTags);
    await refetch();
  }, [mutator.orderDetails, refetch]);

  const updateEncumbrances = useCallback(() => {
    setIsLoading(true);
    mutator.updateEncumbrances.POST({})
      .then(
        () => {
          sendCallout({ message: <FormattedMessage id="ui-orders.order.updateEncumbrances.success" /> });

          return refetch();
        },
        e => {
          return handleErrorResponse(e, orderErrorModalShow, 'ui-orders.order.updateEncumbrances.error');
        },
      )
      .finally(() => setIsLoading(false));
  }, [
    mutator.updateEncumbrances,
    sendCallout,
    refetch,
    handleErrorResponse,
    orderErrorModalShow,
  ]);

  const onCreateInvoice = useCallback(() => {
    history.push(`${INVOICES_ROUTE}/create`, { orderIds: [order.id] });
  }, [history, order]);

  const toggleForceVisibility = () => {
    setHiddenFields(prevHiddenFields => (
      prevHiddenFields
        ? undefined
        : (orderTemplate?.hiddenFields || {})
    ));
  };

  const onReexportConfirm = useCallback(() => {
    toggleOrderReexportModal();
    refetch();
  }, [refetch, toggleOrderReexportModal]);

  const shortcuts = [
    {
      name: 'new',
      handler: handleKeyCommand(() => {
        if (stripes.hasPerm('ui-orders.orders.create')) history.push('/orders/create');
      }),
    },
    {
      name: 'edit',
      handler: handleKeyCommand(() => {
        if (
          stripes.hasPerm('ui-orders.orders.edit') &&
          !isRestrictionsLoading &&
          !restrictions.protectUpdate
        ) onEdit();
      }),
    },
    {
      name: 'duplicateRecord',
      handler: handleKeyCommand(() => {
        if (stripes.hasPerm('ui-orders.orders.create')) toggleCloneConfirmation();
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
    {
      name: 'addPOL',
      shortcut: 'alt+a',
      handler: handleKeyCommand(() => {
        if (stripes.hasPerm('orders.po-lines.item.post') && isAbleToAddLines) onAddPOLine();
      }),
    },
  ];

  if (
    isLoading
    || order?.id !== match.params.id
    || isOrderLoading
    || isOrderTemplateLoading
    || isFiscalYearsFetching
    || isAddressesLoading
  ) {
    return (
      <LoadingPane
        id="order-details"
        dismissible
        defaultWidth="fill"
        onClose={gotToOrdersList}
      />
    );
  }

  const POPane = (
    <HasCommand
      commands={shortcuts}
      isWithinScope={checkScope}
      scope={document.body}
    >
      <TitleManager record={orderNumber} />
      <Pane
        id="order-details"
        actionMenu={getPOActionMenu({
          approvalsSetting,
          clickApprove: approveOrder,
          clickCancel: () => {
            setIsCancelReason(true);
            toggleCloseOrderModal();
          },
          clickClone: toggleCloneConfirmation,
          clickClose: toggleCloseOrderModal,
          clickCreateInvoice: toggleCreateInvoiceModal,
          clickDelete: toggleDeleteOrderConfirm,
          clickEdit: onEdit,
          clickManualExport: toggleManualExportModal,
          clickOpen: toggleOpenOrderModal,
          clickReceive: goToReceiving,
          clickReexport: toggleOrderReexportModal,
          clickReopen: reopenOrder,
          clickUnopen: toggleUnopenOrderModal,
          clickUpdateEncumbrances: updateEncumbrances,
          handlePrint: togglePrintModal,
          isRestrictionsLoading,
          order,
          restrictions,
          toggleForceVisibility,
          hiddenFields,
          orderTemplate,
        })}
        data-test-order-details
        defaultWidth="fill"
        paneTitle={<FormattedMessage id="ui-orders.order.paneTitle.details" values={{ orderNumber }} />}
        lastMenu={lastMenu}
        dismissible
        onClose={gotToOrdersList}
      >
        <AccordionStatus ref={accordionStatusRef}>
          <Row
            end="xs"
            bottom="xs"
          >
            <Col xs={10}>
              {isPrintModalOpened && <Loading size="large" />}

              {isCloseOrderModalOpened && (
                <CloseOrderModal
                  cancel={cancelClosingOrder}
                  closeOrder={closeOrder}
                  closingReasons={reasonsForClosure}
                  orderNumber={orderNumber}
                  isCancelReason={isCancelReason}
                />
              )}

              {isOpenOrderModalOpened && (
                <OpenOrderConfirmationModal
                  orderNumber={orderNumber}
                  submit={openOrder}
                  cancel={toggleOpenOrderModal}
                />
              )}
            </Col>

            <Col xs={2}>
              <ExpandAllButton />
            </Col>
          </Row>
          <AccordionSet>
            <Accordion
              id="purchaseOrder"
              label={<FormattedMessage id="ui-orders.paneBlock.purchaseOrder" />}
            >
              <PODetailsView
                addresses={addresses}
                order={order}
                hiddenFields={hiddenFields}
              />
            </Accordion>
            {isOngoing(orderType) && (
              <Accordion
                id="ongoing"
                label={<FormattedMessage id="ui-orders.paneBlock.ongoingInfo" />}
              >
                <OngoingOrderInfoView
                  order={order}
                  hiddenFields={hiddenFields}
                />
              </Accordion>
            )}
            <Accordion
              id="POSummary"
              label={<FormattedMessage id="ui-orders.paneBlock.POSummary" />}
            >
              <SummaryView
                fiscalYearsGrouped={fiscalYearsGrouped}
                hiddenFields={hiddenFields}
                onSelectFiscalYear={setSelectedFiscalYear}
                order={order}
                orderLines={orderLines}
                selectedFiscalYear={selectedFiscalYear}
              />
            </Accordion>
            <Accordion
              displayWhenOpen={lineListingActionMenu}
              id="POListing"
              label={<FormattedMessage id="ui-orders.paneBlock.POLines" />}
            >
              {
                isOrderLinesFetching
                  ? <Loading />
                  : (
                    <LineListing
                      baseUrl={`${ORDERS_ROUTE}/view/${order.id}`}
                      funds={funds}
                      poLines={orderLines}
                      visibleColumns={visibleColumns}
                    />
                  )
              }
            </Accordion>
            <POInvoicesContainer
              isLoading={isOrderInvoiceRelationshipsLoading}
              label={<FormattedMessage id="ui-orders.paneBlock.relatedInvoices" />}
              orderInvoicesIds={orderInvoicesIds}
            />

            <IfVisible visible={!hiddenFields?.customPOFields}>
              <ViewCustomFieldsRecord
                accordionId="customFieldsPO"
                backendModuleName={CUSTOM_FIELDS_ORDERS_BACKEND_NAME}
                customFieldsValues={customFieldsValues}
                entityType={ENTITY_TYPE_ORDER}
                configNamePrefix={PO_CONFIG_NAME_PREFIX}
                scope={SCOPE_CUSTOM_FIELDS_MANAGE}
              />
            </IfVisible>

            {Boolean(exportHistory?.length) && (
              <ExportDetailsAccordion
                id="exportDetails"
                exportHistory={exportHistory}
                isLoading={isExportHistoryLoading}
              />
            )}
          </AccordionSet>
        </AccordionStatus>
        {isLinesLimitExceededModalOpened && (
          <LinesLimit
            cancel={toggleLinesLimitExceededModal}
            createOrder={createNewOrder}
          />
        )}
        {isErrorsModalOpened && (
          <UpdateOrderErrorModal
            orderNumber={orderNumber}
            errors={updateOrderErrors}
            cancel={orderErrorModalClose}
          />
        )}
        {showConfirmDelete && (
          <ConfirmationModal
            ariaLabel={deleteOrderModalLabel}
            id="delete-order-confirmation"
            confirmLabel={<FormattedMessage id="ui-orders.order.delete.confirmLabel" />}
            heading={deleteOrderModalLabel}
            message={<FormattedMessage id="ui-orders.order.delete.message" />}
            onCancel={toggleDeleteOrderConfirm}
            onConfirm={deletePO}
            open
          />
        )}
        {isCloneConfirmation && (
          <ConfirmationModal
            aria-label={cloneOrderModalLabel}
            id="order-clone-confirmation"
            confirmLabel={<FormattedMessage id="ui-orders.order.clone.confirmLabel" />}
            heading={cloneOrderModalLabel}
            message={<FormattedMessage id="ui-orders.order.clone.message" />}
            onCancel={toggleCloneConfirmation}
            onConfirm={onCloneOrder}
            open
          />
        )}
        {isUnopenOrderModalOpened && (
          <UnopenOrderConfirmationModal
            onCancel={toggleUnopenOrderModal}
            onConfirm={unopenOrder}
            compositeOrder={order}
          />
        )}
        {isDeletePiecesOpened && (
          <ModalDeletePieces
            onCancel={toggleDeletePieces}
            onSubmit={openOrder}
            poLines={orderLines}
          />
        )}
        {isDifferentAccountModalOpened && (
          <ErrorModal
            aria-label={differentAccountModalLabel}
            id="order-open-different-account"
            label={differentAccountModalLabel}
            content={<FormattedMessage id="ui-orders.differentAccounts.message" values={{ accountNumber: accountNumbers.length }} />}
            onClose={toggleDifferentAccountModal}
            open
          />
        )}
        {isCreateInvoiceModalOpened && (
          <ConfirmationModal
            aria-label={createInvoiceModalLabel}
            id="create-invoice-from-order"
            heading={createInvoiceModalLabel}
            message={<FormattedMessage id="ui-orders.createInvoice.confirmationModal.order.message" />}
            onCancel={toggleCreateInvoiceModal}
            onConfirm={onCreateInvoice}
            open
          />
        )}
        {isOrderReexportModalOpened && (
          <ReexportModal
            id="reexport-order-confirm-modal"
            onCancel={toggleOrderReexportModal}
            onConfirm={onReexportConfirm}
            order={order}
            poLines={orderLines}
            exportHistory={exportHistory}
            isLoading={isExportHistoryLoading}
            source={REEXPORT_SOURCES.order}
          />
        )}
        {isManualExportModalOpened && (
          <ManualExportModal
            id="manual-export-order-modal"
            order={order}
            poLines={orderLines}
            onClose={toggleManualExportModal}
          />
        )}
      </Pane>
    </HasCommand>
  );

  return (
    <>
      {POPane}
      {isTagsPaneOpened && (
        <Tags
          putMutator={updateOrderCB}
          recordObj={order}
          onClose={toggleTagsPane}
        />
      )}

      {isPrintModalOpened && (
        <PrintOrder
          onCancel={togglePrintModal}
          order={order}
        />
      )}
    </>
  );
};

PO.manifest = Object.freeze({
  orderDetails: {
    ...ORDER,
    accumulate: true,
    fetch: false,
  },
  linesLimit: LINES_LIMIT,
  closingReasons: reasonsForClosureResource,
  fund: FUND,
  approvalsSetting: APPROVALS_SETTING,
  expenseClass: {
    ...baseManifest,
    accumulate: true,
    fetch: false,
  },
  generatedOrderNumber: ORDER_NUMBER,
  updateEncumbrances: updateEncumbrancesResource,
});

PO.propTypes = {
  history: ReactRouterPropTypes.history.isRequired,
  location: ReactRouterPropTypes.location.isRequired,
  match: ReactRouterPropTypes.match.isRequired,
  mutator: PropTypes.object.isRequired,
  resources: PropTypes.object.isRequired,
  refreshList: PropTypes.func.isRequired,
  stripes: PropTypes.object.isRequired,
};

export default stripesConnect(PO);
