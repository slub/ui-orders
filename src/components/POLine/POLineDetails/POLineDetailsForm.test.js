import { Form } from 'react-final-form';
import {
  QueryClient,
  QueryClientProvider,
} from 'react-query';

import {
  render,
  screen,
} from '@folio/jest-config-stripes/testing-library/react';
import userEvent from '@folio/jest-config-stripes/testing-library/user-event';
import { RECEIPT_STATUS } from '@folio/stripes-acq-components';

import { WORKFLOW_STATUS } from '../../../common/constants';
import { useAcqMethods } from '../../../common/hooks/useAcqMethods';
import { toggleAutomaticExport } from '../../Utils/toggleAutomaticExport';
import POLineDetailsForm from './POLineDetailsForm';

jest.mock('../../../common/hooks/useAcqMethods', () => ({
  useAcqMethods: jest.fn(() => ({ acqMethods: [], isLoading: false })),
}));
jest.mock('../../Utils/toggleAutomaticExport', () => ({
  ...jest.requireActual('../../Utils/toggleAutomaticExport'),
  toggleAutomaticExport: jest.fn(),
}));

const acqMethod = { id: 'acq-method-id', value: 'Purchase' };

const defaultProps = {
  materialTypes: [{
    label: 'label',
    value: 'value',
  }],
  order: {
    workflowStatus: 'Pending',
  },
  parentResources: {
    createInventory: {
      records: [],
    },
  },
};

const queryClient = new QueryClient();
const wrapper = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    {children}
  </QueryClientProvider>
);

const renderPOLineDetailsForm = (props = {}, _initialValues = {}) => render(
  <Form
    onSubmit={() => jest.fn()}
    initialValues={_initialValues}
    render={({
      initialValues,
      form: { batch, change },
      values,
    }) => (
      <POLineDetailsForm
        batch={batch}
        change={change}
        formValues={values}
        initialValues={initialValues}
        {...defaultProps}
        {...props}
      />
    )}
  />,
  { wrapper },
);

describe('POLineDetailsForm', () => {
  it('should render \'POLine details form\' fields', () => {
    renderPOLineDetailsForm();

    expect(screen.getByText('ui-orders.poLine.number')).toBeInTheDocument();
    expect(screen.getByText('ui-orders.poLine.acquisitionMethod')).toBeInTheDocument();
    expect(screen.getByText('ui-orders.poLine.orderFormat')).toBeInTheDocument();
    expect(screen.getByText('ui-orders.poLine.createdOn')).toBeInTheDocument();
    expect(screen.getByText('ui-orders.poLine.receiptDate')).toBeInTheDocument();
    expect(screen.getByText('ui-orders.poLine.receiptStatus')).toBeInTheDocument();
    expect(screen.getByText('ui-orders.poLine.paymentStatus')).toBeInTheDocument();
    expect(screen.getByText('ui-orders.poLine.source')).toBeInTheDocument();
    expect(screen.getByText('ui-orders.poLine.donor')).toBeInTheDocument();
    expect(screen.getByText('ui-orders.poLine.selector')).toBeInTheDocument();
    expect(screen.getByText('ui-orders.poLine.requester')).toBeInTheDocument();
    expect(screen.getByText('ui-orders.poLine.claimingActive')).toBeInTheDocument();
    expect(screen.getByText('ui-orders.poLine.claimingInterval')).toBeInTheDocument();
    expect(screen.getByText('ui-orders.poLine.cancellationRestriction')).toBeInTheDocument();
    expect(screen.getByText('ui-orders.poLine.rush')).toBeInTheDocument();
    expect(screen.getByText('ui-orders.poLine.сollection')).toBeInTheDocument();
    expect(screen.getByText('ui-orders.poLine.receivingWorkflow')).toBeInTheDocument();
    expect(screen.getByText('ui-orders.poLine.cancellationRestrictionNote')).toBeInTheDocument();
    expect(screen.getByText('ui-orders.poLine.poLineDescription')).toBeInTheDocument();
  });

  describe('Receipt status change', () => {
    it('should set to \'Independent order and receipt quantity\' if a user selects \'Receipt not required\'', async () => {
      renderPOLineDetailsForm(null, { checkinItems: false });

      const receiptStatusField = screen.getByRole('combobox', { name: 'ui-orders.poLine.receiptStatus' });
      const receivingWorkflowField = screen.getByRole('combobox', { name: /ui-orders.poLine.receivingWorkflow/ });

      expect(receivingWorkflowField).toHaveValue('false');

      await userEvent.selectOptions(receiptStatusField, RECEIPT_STATUS.receiptNotRequired);

      expect(receivingWorkflowField).toHaveValue('true');
      expect(receivingWorkflowField).toBeDisabled();
    });

    it('should confirm modal when a user selects \'Receipt not required\' on open order', async () => {
      renderPOLineDetailsForm(
        {
          order: { workflowStatus: WORKFLOW_STATUS.open },
        },
        { checkinItems: false },
      );

      const receiptStatusField = screen.getByRole('combobox', { name: 'ui-orders.poLine.receiptStatus' });
      const receivingWorkflowField = screen.getByRole('combobox', { name: /ui-orders.poLine.receivingWorkflow/ });

      expect(receivingWorkflowField).toHaveValue('false');

      await userEvent.selectOptions(receiptStatusField, RECEIPT_STATUS.receiptNotRequired);

      expect(receivingWorkflowField).toHaveValue('false');
      expect(screen.getByText('ui-orders.poLine.receivingWorkflow.confirmModal.heading')).toBeInTheDocument();

      await userEvent.click(screen.getByRole('button', { name: 'stripes-core.button.confirm' }));

      expect(receiptStatusField).toHaveValue(RECEIPT_STATUS.receiptNotRequired);
      expect(receivingWorkflowField).toHaveValue('true');
      expect(receivingWorkflowField).toBeDisabled();
    });

    it('should cancel modal when a user selects \'Receipt not required\' on open order', async () => {
      renderPOLineDetailsForm(
        {
          order: { workflowStatus: WORKFLOW_STATUS.open },
        },
        {
          checkinItems: false,
          receiptStatus: RECEIPT_STATUS.awaitingReceipt,
        },
      );

      const receiptStatusField = screen.getByRole('combobox', { name: 'ui-orders.poLine.receiptStatus' });
      const receivingWorkflowField = screen.getByRole('combobox', { name: /ui-orders.poLine.receivingWorkflow/ });

      expect(receivingWorkflowField).toHaveValue('false');

      await userEvent.selectOptions(receiptStatusField, RECEIPT_STATUS.receiptNotRequired);

      expect(receivingWorkflowField).toHaveValue('false');
      expect(screen.getByText('ui-orders.poLine.receivingWorkflow.confirmModal.heading')).toBeInTheDocument();

      await userEvent.click(screen.getByRole('button', { name: 'stripes-components.cancel' }));

      /* No changes */
      expect(receiptStatusField).toHaveValue(RECEIPT_STATUS.awaitingReceipt);
      expect(receivingWorkflowField).toHaveValue('false');
      expect(receivingWorkflowField).not.toBeDisabled();
    });

    it('should confirm modal when a user activates \'Bindery active\' on post-pending order', async () => {
      renderPOLineDetailsForm(
        {
          order: { workflowStatus: WORKFLOW_STATUS.open },
        },
        { checkinItems: false },
      );

      const binderyActiveField = screen.getByRole('checkbox', { name: /poLine.isBinderyActive/ });
      const receivingWorkflowField = screen.getByRole('combobox', { name: /ui-orders.poLine.receivingWorkflow/ });

      expect(receivingWorkflowField).toHaveValue('false');

      await userEvent.click(binderyActiveField);

      expect(receivingWorkflowField).toHaveValue('false');
      expect(screen.getByText('ui-orders.poLine.receivingWorkflow.confirmModal.heading')).toBeInTheDocument();

      await userEvent.click(screen.getByRole('button', { name: 'stripes-core.button.confirm' }));

      expect(binderyActiveField).toBeChecked();
      expect(receivingWorkflowField).toHaveValue('true');
      expect(receivingWorkflowField).toBeDisabled();
    });

    it('should cancel modal when a user selects \'Bindery active\' on post-pending order', async () => {
      renderPOLineDetailsForm(
        {
          order: { workflowStatus: WORKFLOW_STATUS.open },
        },
        { checkinItems: false },
      );

      const binderyActiveField = screen.getByRole('checkbox', { name: /poLine.isBinderyActive/ });
      const receivingWorkflowField = screen.getByRole('combobox', { name: /ui-orders.poLine.receivingWorkflow/ });

      expect(receivingWorkflowField).toHaveValue('false');

      await userEvent.click(binderyActiveField);

      expect(receivingWorkflowField).toHaveValue('false');
      expect(screen.getByText('ui-orders.poLine.receivingWorkflow.confirmModal.heading')).toBeInTheDocument();

      await userEvent.click(screen.getByRole('button', { name: 'stripes-components.cancel' }));

      /* No changes */
      expect(binderyActiveField).not.toBeChecked();
      expect(receivingWorkflowField).toHaveValue('false');
      expect(receivingWorkflowField).not.toBeDisabled();
    });
  });

  describe('Receiving workflow change', () => {
    it('should confirm modal when a user selects \'Independent order and receipt quantity\' on open order', async () => {
      renderPOLineDetailsForm(
        {
          order: { workflowStatus: WORKFLOW_STATUS.open },
        },
        { checkinItems: false },
      );

      const receivingWorkflowField = screen.getByRole('combobox', { name: /ui-orders.poLine.receivingWorkflow/ });

      expect(receivingWorkflowField).toHaveValue('false');

      await userEvent.selectOptions(receivingWorkflowField, 'true');

      expect(screen.getByText('ui-orders.poLine.receivingWorkflow.confirmModal.heading')).toBeInTheDocument();

      await userEvent.click(screen.getByRole('button', { name: 'stripes-core.button.confirm' }));

      expect(receivingWorkflowField).toHaveValue('true');
    });

    it('should cancel modal when a user selects \'Independent order and receipt quantity\' on open order', async () => {
      renderPOLineDetailsForm(
        {
          order: { workflowStatus: WORKFLOW_STATUS.open },
        },
        { checkinItems: false },
      );

      const receivingWorkflowField = screen.getByRole('combobox', { name: /ui-orders.poLine.receivingWorkflow/ });

      expect(receivingWorkflowField).toHaveValue('false');

      await userEvent.selectOptions(receivingWorkflowField, 'true');

      expect(screen.getByText('ui-orders.poLine.receivingWorkflow.confirmModal.heading')).toBeInTheDocument();

      await userEvent.click(screen.getByRole('button', { name: 'stripes-components.cancel' }));

      /* No changes */
      expect(receivingWorkflowField).toHaveValue('false');
    });
  });

  it('should clear the \'Claiming interval\' field when a user unchecked \'Claiming active\' checkbox', async () => {
    renderPOLineDetailsForm(null, { claimingActive: false });

    const claimingActiveField = screen.getByRole('checkbox', { name: 'ui-orders.poLine.claimingActive' });
    const claimingIntervalField = screen.getByLabelText('ui-orders.poLine.claimingInterval');

    await userEvent.click(claimingActiveField);
    await userEvent.type(claimingIntervalField, '42');

    expect(claimingActiveField).toBeChecked();
    expect(claimingIntervalField).toHaveValue(42);

    await userEvent.click(claimingActiveField);

    expect(claimingActiveField).not.toBeChecked();
    expect(claimingIntervalField).toHaveValue(null);
  });

  it('should validate \'Claiming interval\' field', async () => {
    renderPOLineDetailsForm(null, { claimingActive: false });

    const claimingActiveField = screen.getByRole('checkbox', { name: 'ui-orders.poLine.claimingActive' });
    const claimingIntervalField = screen.getByLabelText('ui-orders.poLine.claimingInterval');

    // Shouldn't be required if "Claiming active" unchecked
    expect(claimingIntervalField).not.toBeRequired();
    expect(claimingIntervalField).toBeValid();

    await userEvent.click(claimingActiveField);
    expect(claimingIntervalField).toBeRequired();
    expect(claimingIntervalField).not.toBeValid();

    await userEvent.type(claimingIntervalField, '-1');
    expect(claimingIntervalField).toHaveValue(-1);
    expect(claimingIntervalField).not.toBeValid();

    await userEvent.clear(claimingIntervalField);
    await userEvent.type(claimingIntervalField, '0');
    expect(claimingIntervalField).toHaveValue(0);
    expect(claimingIntervalField).not.toBeValid();

    await userEvent.clear(claimingIntervalField);
    await userEvent.type(claimingIntervalField, '42');
    expect(claimingIntervalField).toHaveValue(42);
    expect(claimingIntervalField).toBeValid();
  });

  describe('Acquisition method change', () => {
    const selectAcqMethod = async () => {
      await userEvent.click(screen.getByRole('button', { name: /ui-orders.poLine.acquisitionMethod/ }));
      await userEvent.click(screen.getByRole('option', { name: /acquisition_method/ }));
    };

    beforeEach(() => {
      toggleAutomaticExport.mockClear();
      useAcqMethods.mockReturnValue({ acqMethods: [acqMethod], isLoading: false });
    });

    it('should recalculate automatic export', async () => {
      renderPOLineDetailsForm({ integrationConfigs: [] });

      await selectAcqMethod();

      expect(toggleAutomaticExport).toHaveBeenCalled();
    });

    it('should not recalculate automatic export for a manual order', async () => {
      renderPOLineDetailsForm({
        integrationConfigs: [],
        order: { workflowStatus: 'Pending', manualPo: true },
      });

      await selectAcqMethod();

      expect(toggleAutomaticExport).not.toHaveBeenCalled();
    });
  });

  it('should `Bindary Active` field be disabled if "orderFormat" is not `physicalResource` nor `PEMix`', async () => {
    renderPOLineDetailsForm(null, { orderFormat: 'Electronic' });

    const binderyActiveField = screen.getByRole('checkbox', { name: 'ui-orders.poLine.isBinderyActive' });

    expect(binderyActiveField).toBeDisabled();
  });
});
