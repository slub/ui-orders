import {
  QueryClient,
  QueryClientProvider,
} from 'react-query';
import {
  MemoryRouter,
  Route,
} from 'react-router-dom';

import {
  act,
  render,
  screen,
  waitFor,
} from '@folio/jest-config-stripes/testing-library/react';
import user from '@folio/jest-config-stripes/testing-library/user-event';
import {
  HasCommand,
  expandAllSections,
  collapseAllSections,
} from '@folio/stripes/components';
import { ORDER_STATUSES } from '@folio/stripes-acq-components';

import { history } from 'fixtures/routerMocks';
import {
  ERROR_CODES,
  ORDERS_ROUTE,
  PO_UPDATE_ACTION_TYPES,
} from '../../common/constants';
import { useOrderLinesAbandonedHoldingsCheck } from '../../common/hooks';
import {
  useOrderMutation,
  usePurchaseOrderResources,
} from './hooks';
import PO from './PO';

const mockHandleOrderUpdateError = jest.fn();

jest.mock('@folio/stripes-acq-components/lib/AcqUnits/hooks/useAcqRestrictions', () => ({
  useAcqRestrictions: jest.fn().mockReturnValue({ restrictions: {} }),
}));
jest.mock('@folio/stripes-components/lib/Commander', () => ({
  HasCommand: jest.fn(({ children }) => <div>{children}</div>),
  expandAllSections: jest.fn(),
  collapseAllSections: jest.fn(),
}));
jest.mock('@folio/stripes/smart-components', () => ({
  ...jest.requireActual('@folio/stripes/smart-components'),
  ViewCustomFieldsRecord: jest.fn().mockReturnValue('ViewCustomFieldsRecord'),
}));
jest.mock('../../common/hooks', () => ({
  ...jest.requireActual('../../common/hooks'),
  useDeprecatedAcqMethods: jest.fn(() => ({ deprecatedAcqMethods: [], isLoading: false })),
  useOrderLinesAbandonedHoldingsCheck: jest.fn(() => ({ isFetching: false, result: { type: 'withoutPieces' } })),
  useHandleOrderUpdateError: jest.fn(() => [mockHandleOrderUpdateError]),
}));
jest.mock('./hooks', () => ({
  ...jest.requireActual('./hooks'),
  useOrderMutation: jest.fn(() => ({ updateOrder: jest.fn(() => Promise.resolve()) })),
  usePurchaseOrderResources: jest.fn(),
}));

const ORDER = {
  id: '73a9b376-844f-41b5-8b3f-71f2fae63f1f',
  workflowStatus: ORDER_STATUSES.open,
  poLines: [{
    cost: {
      quantityPhysical: 1,
    },
    lastEDIExportDate: '2022-90-31T00:00:00.000Z',
  }],
};

const defaultProps = {
  refreshList: jest.fn(),
  resources: {
    closingReasons: {
      records: [{
        id: 'id',
        reason: 'reason',
      }],
    },
  },
  mutator: {
    orderDetails: {
      POST: jest.fn().mockResolvedValue(ORDER),
      PUT: jest.fn().mockResolvedValue(ORDER),
      DELETE: jest.fn().mockResolvedValue(ORDER),
    },
    updateEncumbrances: {
      POST: jest.fn().mockResolvedValue(),
    },
    generatedOrderNumber: {
      GET: jest.fn().mockResolvedValue({ poNumber: 1000 }),
    },
  },
  history,
};

const orderRelatedData = {
  exportHistory: [],
  fiscalYears: [],
  order: ORDER,
  orderInvoiceRelationships: [],
  orderLines: [],
  orderTemplate: {},
  refetchFiscalYears: jest.fn(),
  refetchOrder: jest.fn(),
  refetchOrderLines: jest.fn(),
  restrictions: {},
};

const queryClient = new QueryClient();
const wrapper = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    <MemoryRouter initialEntries={['/orders/view/73a9b376-844f-41b5-8b3f-71f2fae63f1f']}>
      {children}
    </MemoryRouter>
  </QueryClientProvider>
);

const renderComponent = (configProps = {}) => {
  return render(
    <Route
      path="/orders/view/:id"
      render={props => (
        <PO
          {...props}
          {...defaultProps}
          {...configProps}
        />
      )}
    />,
    { wrapper },
  );
};

const setOrderResources = ({
  order = {},
  ...rest
} = {}) => {
  usePurchaseOrderResources.mockReturnValue({
    ...orderRelatedData,
    ...rest,
    order: {
      ...ORDER,
      ...order,
    },
  });
};

describe('PO', () => {
  beforeEach(() => {
    setOrderResources();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render update encumbrance', async () => {
    renderComponent();
    await act(() => Promise.resolve());

    expect(await screen.findByTestId('update-encumbrances-button')).toBeInTheDocument();
  });

  it('should render custom fields accordion', () => {
    renderComponent();

    expect(screen.queryByText('ViewCustomFieldsRecord')).toBeInTheDocument();
  });
});

describe('PO actions', () => {
  const updateOrder = jest.fn(() => Promise.resolve());

  beforeEach(() => {
    defaultProps.mutator.orderDetails.POST.mockClear();
    defaultProps.mutator.orderDetails.PUT.mockClear();
    defaultProps.mutator.orderDetails.PUT.mockResolvedValue(ORDER);
    history.push.mockClear();
    mockHandleOrderUpdateError.mockClear().mockResolvedValue();
    useOrderLinesAbandonedHoldingsCheck.mockClear();
    useOrderMutation.mockClear().mockReturnValue({ updateOrder });
  });

  describe('an open order', () => {
    it('should translate to receiving when receive button was clicked', async () => {
      renderComponent();

      const receiveBtn = await screen.findByTestId('order-receiving-button');

      await act((async () => user.click(receiveBtn)));

      expect(history.push).toHaveBeenCalled();
    });

    it('should translate to edit page when edit button was pressed', async () => {
      renderComponent();

      const editBtn = await screen.findByTestId('button-edit-order');

      await act((async () => user.click(editBtn)));

      expect(history.push).toHaveBeenCalled();
    });

    it('should close order after confirmation', async () => {
      renderComponent();

      const closeBtn = await screen.findByTestId('close-order-button');

      await act(async () => user.click(closeBtn));

      const confirmCloseBtn = await screen.findByText('ui-orders.closeOrderModal.submit');
      const selectReason = await screen.findByLabelText('ui-orders.closeOrderModal.reason');

      await act(async () => {
        await user.selectOptions(selectReason, 'reason');
        await user.click(confirmCloseBtn);
      });

      expect(defaultProps.mutator.orderDetails.PUT).toHaveBeenCalled();
    });

    it('should pass close action options to order update error handler', async () => {
      defaultProps.mutator.orderDetails.PUT.mockRejectedValueOnce({});

      renderComponent();

      const closeBtn = await screen.findByTestId('close-order-button');

      await act(async () => user.click(closeBtn));

      const confirmCloseBtn = await screen.findByText('ui-orders.closeOrderModal.submit');
      const selectReason = await screen.findByLabelText('ui-orders.closeOrderModal.reason');

      await act(async () => {
        await user.selectOptions(selectReason, 'reason');
        await user.click(confirmCloseBtn);
      });

      await waitFor(() => (
        expect(mockHandleOrderUpdateError).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({
          actionType: PO_UPDATE_ACTION_TYPES.CLOSE,
          genericCode: 'closeOrder',
          openModal: expect.any(Function),
        }))
      ));
    });

    it('should cancel order after confirmation', async () => {
      renderComponent();

      const cancelBtn = await screen.findByTestId('cancel-order-button');

      await act(async () => user.click(cancelBtn));

      const confirmCloseBtn = await screen.findByText('ui-orders.closeOrderModal.submit');

      await act(async () => user.click(confirmCloseBtn));

      expect(defaultProps.mutator.orderDetails.PUT).toHaveBeenCalled();
    });

    it('should unopen order after confirmation', async () => {
      renderComponent();

      const unopenBtn = await screen.findByTestId('unopen-order-button');

      await act(async () => user.click(unopenBtn));

      const confirmBtn = await screen.findByText('ui-orders.unopenOrderModal.confirmLabel');

      await act(async () => user.click(confirmBtn));

      expect(updateOrder).toHaveBeenCalledWith(
        expect.objectContaining({
          changedData: expect.objectContaining({
            workflowStatus: ORDER_STATUSES.pending,
          }),
        }),
      );
    });

    it('should update encumbrances when corresponding button was clicked', async () => {
      renderComponent();

      const updateEncumbBtn = await screen.findByTestId('update-encumbrances-button');

      await act(async () => user.click(updateEncumbBtn));

      expect(defaultProps.mutator.updateEncumbrances.POST).toHaveBeenCalled();
    });

    it('should clone order after confirmation', async () => {
      renderComponent();

      const cloneBtn = await screen.findByTestId('clone-order-button');

      await act(async () => user.click(cloneBtn));

      const confirmBtn = await screen.findByText('ui-orders.order.clone.confirmLabel');

      await act(async () => user.click(confirmBtn));

      expect(defaultProps.mutator.generatedOrderNumber.GET).toHaveBeenCalled();
    });

    it('should pass clone error options to order update error handler', async () => {
      defaultProps.mutator.generatedOrderNumber.GET.mockRejectedValueOnce({});

      renderComponent();

      const cloneBtn = await screen.findByTestId('clone-order-button');

      await act(async () => user.click(cloneBtn));

      const confirmBtn = await screen.findByText('ui-orders.order.clone.confirmLabel');

      await act(async () => user.click(confirmBtn));

      await waitFor(() => (
        expect(mockHandleOrderUpdateError).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({
          genericCode: 'clone.error',
          openModal: expect.any(Function),
        }))
      ));
    });

    it('should delete order after confirmation', async () => {
      renderComponent();

      const deleteBtn = await screen.findByTestId('button-delete-order');

      await act(async () => user.click(deleteBtn));

      const confirmBtn = await screen.findByText('ui-orders.order.delete.confirmLabel');

      await act(async () => user.click(confirmBtn));

      expect(defaultProps.mutator.orderDetails.DELETE).toHaveBeenCalled();
    });

    it('should process delete order error without navigation', async () => {
      defaultProps.mutator.orderDetails.DELETE.mockRejectedValueOnce({});
      history.replace.mockClear();

      renderComponent();

      const deleteBtn = await screen.findByTestId('button-delete-order');

      await act(async () => user.click(deleteBtn));

      const confirmBtn = await screen.findByText('ui-orders.order.delete.confirmLabel');

      await act(async () => user.click(confirmBtn));

      await waitFor(() => expect(defaultProps.mutator.orderDetails.DELETE).toHaveBeenCalled());
      expect(history.replace).not.toHaveBeenCalled();
    });

    it('should approve order', async () => {
      renderComponent({
        resources: {
          ...defaultProps.resources,
          approvalsSetting: {
            records: [{
              value: JSON.stringify({ isApprovalRequired: true }),
            }],
          },
        },
      });

      const approveBtn = await screen.findByTestId('approve-order-button');

      await act(async () => user.click(approveBtn));

      expect(defaultProps.mutator.orderDetails.PUT).toHaveBeenCalled();
    });

    it('should pass approve action options to order update error handler', async () => {
      defaultProps.mutator.orderDetails.PUT.mockRejectedValueOnce({});

      renderComponent({
        resources: {
          ...defaultProps.resources,
          approvalsSetting: {
            records: [{
              value: JSON.stringify({ isApprovalRequired: true }),
            }],
          },
        },
      });

      const approveBtn = await screen.findByTestId('approve-order-button');

      await act(async () => user.click(approveBtn));

      await waitFor(() => (
        expect(mockHandleOrderUpdateError).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({
          actionType: PO_UPDATE_ACTION_TYPES.APPROVE,
          openModal: expect.any(Function),
        }))
      ));
    });

    it('should update order details after reexport', async () => {
      renderComponent();

      const reexportBtn = await screen.findByTestId('reexport-order-button');

      await act(async () => user.click(reexportBtn));

      const reexportConfirmBtn = await screen.findByTestId('confirm-reexport-button');

      await act(async () => user.click(reexportConfirmBtn));

      expect(orderRelatedData.refetchOrder).toHaveBeenCalled();
    });
  });

  describe('a pending order', () => {
    it('should open order after confirmation', async () => {
      setOrderResources({
        order: {
          workflowStatus: ORDER_STATUSES.pending,
        },
      });

      renderComponent();

      const openBtn = await screen.findByTestId('open-order-button');

      await act(async () => user.click(openBtn));

      const confirmBtn = await screen.findByText('ui-orders.openOrderModal.submit');

      await act(async () => user.click(confirmBtn));

      expect(defaultProps.mutator.orderDetails.PUT).toHaveBeenCalled();
    });

    it('should pass open action options to order update error handler', async () => {
      setOrderResources({
        order: {
          workflowStatus: ORDER_STATUSES.pending,
        },
      });
      defaultProps.mutator.orderDetails.PUT.mockRejectedValueOnce({});

      renderComponent();

      const openBtn = await screen.findByTestId('open-order-button');

      await act(async () => user.click(openBtn));

      const confirmOpenBtn = await screen.findByText('ui-orders.openOrderModal.submit');

      await act(async () => user.click(confirmOpenBtn));

      await waitFor(() => (
        expect(mockHandleOrderUpdateError).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({
          actionType: PO_UPDATE_ACTION_TYPES.OPEN,
          genericCode: ERROR_CODES.orderGenericError1,
          openModal: expect.any(Function),
          toggleDeletePieces: expect.any(Function),
        }))
      ));
    });

    it('should show different account modal when opening with multiple export accounts', async () => {
      setOrderResources({
        order: {
          workflowStatus: ORDER_STATUSES.pending,
          manualPo: false,
        },
        orderLines: [{
          cost: { currency: 'USD' },
          automaticExport: true,
          vendorDetail: { vendorAccount: 'ACC-1' },
        }, {
          cost: { currency: 'USD' },
          automaticExport: true,
          vendorDetail: { vendorAccount: 'ACC-2' },
        }],
      });

      renderComponent();

      const openBtn = await screen.findByTestId('open-order-button');

      await act(async () => user.click(openBtn));

      const confirmOpenBtn = await screen.findByText('ui-orders.openOrderModal.submit');

      await act(async () => user.click(confirmOpenBtn));

      expect(await screen.findByText('ui-orders.differentAccounts.title')).toBeInTheDocument();
      expect(defaultProps.mutator.orderDetails.PUT).not.toHaveBeenCalled();
    });
  });

  describe('a closed order', () => {
    it('should reopen order', async () => {
      setOrderResources({
        order: {
          workflowStatus: ORDER_STATUSES.closed,
        },
      });

      renderComponent();

      const reopenBtn = await screen.findByTestId('reopen-order-button');

      await act(async () => user.click(reopenBtn));

      expect(defaultProps.mutator.orderDetails.PUT).toHaveBeenCalled();
    });

    it('should pass reopen action options to order update error handler', async () => {
      setOrderResources({
        order: {
          workflowStatus: ORDER_STATUSES.closed,
        },
      });
      defaultProps.mutator.orderDetails.PUT.mockRejectedValueOnce({});

      renderComponent();

      const reopenBtn = await screen.findByTestId('reopen-order-button');

      await act(async () => user.click(reopenBtn));

      await waitFor(() => (
        expect(mockHandleOrderUpdateError).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({
          actionType: PO_UPDATE_ACTION_TYPES.REOPEN,
          openModal: expect.any(Function),
        }))
      ));
    });
  });

  describe('adding PO Line', () => {
    it('should create new POLine if the linelimit is not exceeded', async () => {
      setOrderResources({
        order: {
          workflowStatus: ORDER_STATUSES.pending,
        },
      });

      renderComponent();

      const addPOLineBtn = await screen.findByTestId('add-line-button');

      await act(async () => {
        await user.click(addPOLineBtn);
      });

      expect(history.push).toHaveBeenCalled();
    });

    it('should create new PO if the line limit is exceeded', async () => {
      setOrderResources({
        order: {
          workflowStatus: ORDER_STATUSES.pending,
        },
        orderLines: [{
          id: 'po-line-id',
          cost: {
            currency: 'USD',
          },
        }],
      });

      renderComponent();

      const addPOLineBtn = await screen.findByTestId('add-line-button');

      await act(async () => {
        await user.click(addPOLineBtn);
      });

      const createOrderBtn = await screen.findByText('ui-orders.linesLimit.createBtn');

      await act(async () => {
        await user.click(createOrderBtn);
      });

      expect(defaultProps.mutator.generatedOrderNumber.GET).toHaveBeenCalled();
    });
  });

  it('should close pane when close icon was clicked', async () => {
    renderComponent();

    await waitFor(async () => expect(await screen.findByText('ui-orders.order.paneTitle.details')).toBeInTheDocument());

    const closeBtn = await screen.findByRole('button', { name: 'stripes-components.closeItem' });

    await act(async () => user.click(closeBtn));

    expect(history.push).toHaveBeenCalled();
  });

  it('should open PO version history pane', async () => {
    renderComponent();

    const openPaneBtn = await screen.findByRole('button', { name: 'stripes-acq-components.versionHistory.pane.header' });

    await act(async () => user.click(openPaneBtn));

    expect(defaultProps.history.push).toHaveBeenCalledWith(expect.objectContaining({
      pathname: `${ORDERS_ROUTE}/view/${ORDER.id}/versions`,
    }));
  });
});

describe('PO errors', () => {
  it('should handle errors on update order', async () => {
    defaultProps.mutator.orderDetails.PUT.mockRejectedValue({});

    setOrderResources({
      order: {
        workflowStatus: ORDER_STATUSES.pending,
        approved: true,
      },
    });

    renderComponent();

    const openOrderBtn = await screen.findByTestId('open-order-button');

    await act(async () => user.click(openOrderBtn));

    await waitFor(() => {
      expect(screen.getByText('ui-orders.openOrderModal.submit')).toBeInTheDocument();
    });

    await act(async () => user.click(screen.getByText('ui-orders.openOrderModal.submit')));

    await waitFor(() => {
      expect(defaultProps.mutator.orderDetails.PUT).toHaveBeenCalled();
    });
  });

  it('should open and close update error modal from open order flow', async () => {
    defaultProps.mutator.orderDetails.PUT.mockRejectedValueOnce({});

    mockHandleOrderUpdateError.mockImplementationOnce(async (_error, { openModal }) => {
      openModal([{ code: ERROR_CODES.vendorNotFound }]);
    });

    setOrderResources({
      order: {
        workflowStatus: ORDER_STATUSES.pending,
      },
    });

    renderComponent();

    const openOrderBtn = await screen.findByTestId('open-order-button');

    await act(async () => user.click(openOrderBtn));

    await act(async () => user.click(screen.getByText('ui-orders.openOrderModal.submit')));

    expect(await screen.findByText('ui-orders.errors.vendorNotFound')).toBeInTheDocument();

    await act(async () => user.click(screen.getByText('ui-orders.openOrderModal.cancel')));

    await waitFor(() => expect(screen.queryByText('ui-orders.errors.vendorNotFound')).not.toBeInTheDocument());
  });

  it('should close close-order modal without submitting', async () => {
    setOrderResources({
      order: {
        workflowStatus: ORDER_STATUSES.open,
      },
    });

    renderComponent();
    defaultProps.mutator.orderDetails.PUT.mockClear();

    const closeBtn = await screen.findByTestId('close-order-button');

    await act(async () => user.click(closeBtn));

    expect(await screen.findByText('ui-orders.closeOrderModal.submit')).toBeInTheDocument();

    await act(async () => user.click(screen.getByText('ui-orders.closeOrderModal.cancel')));

    await waitFor(() => expect(screen.queryByText('ui-orders.closeOrderModal.submit')).not.toBeInTheDocument());
    expect(defaultProps.mutator.orderDetails.PUT).not.toHaveBeenCalled();
  });
});

describe('PO shortcuts', () => {
  beforeEach(() => {
    HasCommand.mockClear();
  });

  it('should expand all sections', async () => {
    renderComponent();

    await waitFor(() => HasCommand.mock.calls[0][0].commands.find(c => c.name === 'expandAllSections').handler());

    expect(expandAllSections).toHaveBeenCalled();
  });

  it('should collapse all sections', async () => {
    renderComponent();

    await waitFor(() => HasCommand.mock.calls[0][0].commands.find(c => c.name === 'collapseAllSections').handler());

    expect(collapseAllSections).toHaveBeenCalled();
  });

  it('should translate to order creation', async () => {
    renderComponent();

    await waitFor(() => HasCommand.mock.calls[0][0].commands.find(c => c.name === 'new').handler());

    expect(history.push).toHaveBeenCalled();
  });

  it('should translate to order edit page', async () => {
    renderComponent();

    await waitFor(() => HasCommand.mock.calls[0][0].commands.find(c => c.name === 'edit').handler());

    expect(history.push).toHaveBeenCalled();
  });

  it('should open duplication confirmation modal', async () => {
    renderComponent();

    await waitFor(() => HasCommand.mock.calls[0][0].commands.find(c => c.name === 'duplicateRecord').handler());

    expect(screen.getByText('ui-orders.order.clone.message')).toBeInTheDocument();
  });

  it('should translate to POL creation form', async () => {
    setOrderResources({
      order: {
        workflowStatus: ORDER_STATUSES.pending,
      },
    });

    renderComponent();

    await waitFor(() => HasCommand.mock.calls[0][0].commands.find(c => c.name === 'addPOL').handler());

    expect(history.push).toHaveBeenCalledWith({
      pathname: `/orders/view/${ORDER.id}/po-line/create`,
      search: '',
    });
  });
});
