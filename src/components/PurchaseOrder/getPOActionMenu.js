/* eslint-disable react/prop-types */
import React from 'react';
import { get } from 'lodash';
import { FormattedMessage } from 'react-intl';

import {
  Button,
  Icon,
  MenuSection,
} from '@folio/stripes/components';
import { IfPermission } from '@folio/stripes/core';
import { getConfigSetting } from '@folio/stripes-acq-components';

import { ReexportActionButton } from '../../common/ReexportActionButton';
import {
  isOpenAvailableForOrder,
  isReceiveAvailableForOrder,
  isWorkflowStatusClosed,
  isWorkflowStatusOpen,
} from './util';

export function getPOActionMenu({
  approvalsSetting,
  clickApprove,
  clickCancel,
  clickClone,
  clickClose,
  clickCreateInvoice,
  clickDelete,
  clickEdit,
  clickManualExport,
  clickOpen,
  clickReceive,
  clickReexport,
  clickReopen,
  clickUnopen,
  clickUpdateEncumbrances,
  handlePrint,
  isRestrictionsLoading,
  order,
  restrictions,
  toggleForceVisibility,
  hiddenFields,
  orderTemplate,
}) {
  const { isApprovalRequired } = getConfigSetting(approvalsSetting);
  const isApproved = get(order, 'approved');
  const isOpenOrderButtonVisible = isOpenAvailableForOrder(isApprovalRequired, order);
  const isApproveOrderButtonVisible = isApprovalRequired && !isApproved;
  const isReceiveButtonVisible = isReceiveAvailableForOrder(order);
  const isOrderInClosedStatus = isWorkflowStatusClosed(order);
  const isOrderInOpenStatus = isWorkflowStatusOpen(order);
  const isManualOrder = order.manualPo;
  const isUpdateDisabled = isRestrictionsLoading || restrictions.protectUpdate;
  const isNewInvoiceButtonVisible = Boolean(
    (isOrderInOpenStatus || isOrderInClosedStatus) && order.poLines?.length,
  );

  const exportedOrderLines = order.poLines.filter(({ lastEDIExportDate }) => lastEDIExportDate);
  const isOrderReexportDisabled = !(isOrderInOpenStatus && !isManualOrder && exportedOrderLines.length);

  // "Export now" sends the order to the vendor, so it only makes sense once the
  // order is OPEN (placed): a pending order is not placed yet (and still editable),
  // a closed order is done. Manual POs are excluded too (like Reexport): the
  // order-level "Manual" flag means the order is placed outside FOLIO and must not
  // be transmitted at all. Unlike Reexport we do NOT require an earlier export
  // (this covers first-time / never-exported lines). PoC: opens the modal only.
  const isManualExportDisabled = !isOrderInOpenStatus || isManualOrder || !order.poLines?.length;

  return ({ onToggle }) => (
    <MenuSection id="order-details-actions">
      <IfPermission perm="orders.item.put">
        <Button
          buttonStyle="dropdownItem"
          data-test-button-edit-order
          data-testid="button-edit-order"
          disabled={isUpdateDisabled}
          onClick={() => {
            onToggle();
            clickEdit();
          }}
        >
          <Icon size="small" icon="edit">
            <FormattedMessage id="ui-orders.button.edit" />
          </Icon>
        </Button>
      </IfPermission>
      <IfPermission perm="orders.item.put">
        <IfPermission perm="orders.item.approve">
          {isApproveOrderButtonVisible && (
            <Button
              buttonStyle="dropdownItem"
              data-test-approve-order-button
              data-testid="approve-order-button"
              disabled={isUpdateDisabled}
              onClick={clickApprove}
            >
              <FormattedMessage id="ui-orders.paneBlock.approveBtn" />
            </Button>
          )}
        </IfPermission>
        {isOrderInOpenStatus && (
          <Button
            buttonStyle="dropdownItem"
            data-test-close-order-button
            data-testid="close-order-button"
            disabled={isUpdateDisabled}
            onClick={clickClose}
          >
            <Icon size="small" icon="archive">
              <FormattedMessage id="ui-orders.paneBlock.closeBtn" />
            </Icon>
          </Button>
        )}
        {isOpenOrderButtonVisible && (
          <Button
            buttonStyle="dropdownItem"
            data-test-open-order-button
            data-testid="open-order-button"
            disabled={isUpdateDisabled}
            onClick={clickOpen}
          >
            <Icon size="small" icon="cart">
              <FormattedMessage id="ui-orders.paneBlock.openBtn" />
            </Icon>
          </Button>
        )}
        <IfPermission perm="ui-orders.order.cancel">
          {isOrderInOpenStatus && (
            <Button
              buttonStyle="dropdownItem"
              data-testid="cancel-order-button"
              disabled={isUpdateDisabled}
              onClick={clickCancel}
            >
              <Icon size="small" icon="cancel">
                <FormattedMessage id="ui-orders.buttons.line.cancel" />
              </Icon>
            </Button>
          )}
        </IfPermission>
        <IfPermission perm="orders.item.unopen">
          {isOrderInOpenStatus && (
            <Button
              buttonStyle="dropdownItem"
              data-test-unopen-order-button
              data-testid="unopen-order-button"
              disabled={isUpdateDisabled}
              onClick={clickUnopen}
            >
              <Icon size="small" icon="arrow-left">
                <FormattedMessage id="ui-orders.paneBlock.unopenBtn" />
              </Icon>
            </Button>
          )}
        </IfPermission>
      </IfPermission>
      <IfPermission perm="ui-receiving.view">
        {isReceiveButtonVisible && (
          <Button
            buttonStyle="dropdownItem"
            data-test-receiving-button
            data-testid="order-receiving-button"
            onClick={() => {
              onToggle();
              Promise.resolve().then(() => clickReceive()); // Delay to ensure toggle is complete before redirection
            }}
          >
            <Icon size="small" icon="receive">
              <FormattedMessage id="ui-orders.paneBlock.receiveBtn" />
            </Icon>
          </Button>
        )}
      </IfPermission>
      <IfPermission perm="ui-orders.order.updateEncumbrances">
        {isOrderInOpenStatus && (
          <Button
            buttonStyle="dropdownItem"
            data-testid="update-encumbrances-button"
            onClick={clickUpdateEncumbrances}
          >
            <Icon size="small" icon="arrow-up">
              <FormattedMessage id="ui-orders.paneBlock.updateEncumbrances" />
            </Icon>
          </Button>
        )}
      </IfPermission>
      <IfPermission perm="ui-invoice.invoice.create">
        {isNewInvoiceButtonVisible && (
          <Button
            buttonStyle="dropdownItem"
            onClick={clickCreateInvoice}
          >
            <Icon size="small" icon="plus-sign">
              <FormattedMessage id="ui-orders.paneBlock.createInvoice" />
            </Icon>
          </Button>
        )}
      </IfPermission>
      <IfPermission perm="orders.item.post">
        <Button
          buttonStyle="dropdownItem"
          data-test-clone-order-button
          data-testid="clone-order-button"
          onClick={clickClone}
        >
          <Icon size="small" icon="duplicate">
            <FormattedMessage id="ui-orders.paneBlock.cloneBtn" />
          </Icon>
        </Button>
      </IfPermission>

      <ReexportActionButton
        id="reexport-order-button"
        disabled={isOrderReexportDisabled}
        onClick={() => {
          onToggle();
          clickReexport();
        }}
      />

      <IfPermission perm="orders.po-lines.item.put">
        <Button
          buttonStyle="dropdownItem"
          data-testid="manual-export-order-button"
          disabled={isManualExportDisabled}
          onClick={() => {
            onToggle();
            clickManualExport();
          }}
        >
          <Icon size="small" icon="envelope">
            <FormattedMessage id="ui-orders.button.manualExport" />
          </Icon>
        </Button>
      </IfPermission>

      {isOrderInClosedStatus && (
        <Button
          buttonStyle="dropdownItem"
          data-test-reopen-order-button
          data-testid="reopen-order-button"
          disabled={isUpdateDisabled}
          onClick={() => {
            onToggle();
            clickReopen();
          }}
        >
          <Icon size="small" icon="arrow-right">
            <FormattedMessage id="ui-orders.paneBlock.reopenBtn" />
          </Icon>
        </Button>
      )}
      <IfPermission perm="orders.item.delete">
        <Button
          buttonStyle="dropdownItem"
          data-test-button-delete-order
          data-testid="button-delete-order"
          disabled={isRestrictionsLoading || restrictions.protectDelete}
          onClick={clickDelete}
        >
          <Icon size="small" icon="trash">
            <FormattedMessage id="ui-orders.button.delete" />
          </Icon>
        </Button>
      </IfPermission>
      <Button
        buttonStyle="dropdownItem"
        data-testid="button-print-order"
        onClick={() => {
          onToggle();
          handlePrint();
        }}
      >
        <Icon size="small" icon="print">
          <FormattedMessage id="ui-orders.button.printOrder" />
        </Icon>
      </Button>
      {Boolean(orderTemplate.hiddenFields) && (
        <IfPermission perm="ui-orders.order.showHidden">
          <Button
            id="order-clickable-show-hidden"
            data-testid="order-toggle-key-values-visibility"
            buttonStyle="dropdownItem"
            onClick={() => {
              toggleForceVisibility();
              onToggle();
            }}
          >
            <Icon size="small" icon={`eye-${hiddenFields ? 'open' : 'closed'}`}>
              <FormattedMessage id={`ui-orders.order.${hiddenFields ? 'showHidden' : 'hideFields'}`} />
            </Icon>
          </Button>
        </IfPermission>
      )}
    </MenuSection>
  );
}
