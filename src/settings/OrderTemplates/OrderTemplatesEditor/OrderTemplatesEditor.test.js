import {
  QueryClient,
  QueryClientProvider,
} from 'react-query';
import { MemoryRouter } from 'react-router-dom';

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
} from '@folio/stripes/components';
import { ORDER_TYPES } from '@folio/stripes-acq-components';

import OrderTemplatesEditor from './OrderTemplatesEditor';

jest.mock('@folio/stripes-components/lib/Commander', () => ({
  HasCommand: jest.fn(({ children }) => <div>{children}</div>),
}));
const mockCollapseAll = jest.fn();

jest.mock('@folio/stripes/components', () => ({
  ...jest.requireActual('@folio/stripes/components'),
  collapseAllSections: jest.fn(),
  expandAllSections: jest.fn(),
  Layer: jest.fn(({ children }) => <>{children}</>),
}));
jest.mock('../../../common/hooks', () => ({
  ...jest.requireActual('../../../common/hooks'),
  useAccordionErrorTrigger: jest.fn(() => ({
    onToggle: jest.fn(),
    onExpandAllToggle: jest.fn(),
    collapseAll: mockCollapseAll,
  })),
}));
jest.mock('@folio/stripes/smart-components', () => ({
  ...jest.requireActual('@folio/stripes/smart-components'),
  EditCustomFieldsRecord: jest.fn().mockImplementation(({ accordionId }) => {
    if (accordionId === 'poCustomFields') {
      return <div>EditCustomFieldsRecord_PO</div>;
    } else if (accordionId === 'polCustomFields') {
      return <div>EditCustomFieldsRecord_POL</div>;
    }

    return <div>EditCustomFieldsRecord</div>;
  }),
}));
jest.mock('@folio/stripes-acq-components', () => ({
  ...jest.requireActual('@folio/stripes-acq-components'),
  AcqUnitsField: jest.fn().mockReturnValue('AcqUnitsField'),
  FieldOrganization: jest.fn().mockReturnValue('FieldOrganization'),
  FieldTags: jest.fn().mockReturnValue('FieldTags'),
}));

const defaultProps = {
  close: jest.fn(),
  onSubmit: jest.fn(),
  initialValues: {},
  addresses: [],
  values: {
    cost: {
      currency: 'USD',
    },
  },
  locations: [{
    id: 'locationId',
  }],
  identifierTypes: [{
    id: 'typeId',
    name: 'ISBN',
  }],
  contributorNameTypes: [{
    id: 'contributorId',
    name: 'contributorName',
  }],
  fund: [{
    id: 'fundId',
    name: 'fundName',
    code: 'fundCode',
  }],
  createInventory: [{
    value: {},
  }],
  orderTemplateCategories: [
    { id: '1', name: 'Category 1' },
    { id: '2', name: 'Category 2' },
    { id: '3', name: 'Category 3' },
  ],
  prefixesSetting: [{
    name: 'prefixName',
  }],
  suffixesSetting: [{
    name: 'suffixName',
  }],
  stripes: {
    currency: 'USD',
  },
};

const queryClient = new QueryClient();
const wrapper = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    <MemoryRouter>
      {children}
    </MemoryRouter>
  </QueryClientProvider>
);

const renderOrderTemplatesEditor = (props = {}) => render(
  <OrderTemplatesEditor
    {...defaultProps}
    {...props}
  />,
  { wrapper },
);

describe('OrderTemplatesEditor', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render \'order templates editor\' form fields', async () => {
    renderOrderTemplatesEditor();

    await waitFor(() => {
      expect(screen.getByText('ui-orders.settings.orderTemplates.accordion.template')).toBeInTheDocument();
      expect(screen.getByText('ui-orders.settings.orderTemplates.accordion.poInfo')).toBeInTheDocument();
      expect(screen.getByText('ui-orders.settings.orderTemplates.accordion.poNotes')).toBeInTheDocument();
      expect(screen.getByText('ui-orders.settings.orderTemplates.accordion.poTags')).toBeInTheDocument();
      expect(screen.getByText('ui-orders.settings.orderTemplates.accordion.poSummary')).toBeInTheDocument();
      expect(screen.getByText('ui-orders.settings.orderTemplates.accordion.poItemDetails')).toBeInTheDocument();
      expect(screen.getByText('ui-orders.settings.orderTemplates.accordion.polDetails')).toBeInTheDocument();
      expect(screen.getByText('ui-orders.settings.orderTemplates.accordion.polCostDetails')).toBeInTheDocument();
      expect(screen.getByText('ui-orders.settings.orderTemplates.accordion.polVendor')).toBeInTheDocument();
      expect(screen.getByText('ui-orders.settings.orderTemplates.accordion.polFundDistribution')).toBeInTheDocument();
      expect(screen.getByText('ui-orders.settings.orderTemplates.accordion.polLocation')).toBeInTheDocument();
      expect(screen.getByText('ui-orders.settings.orderTemplates.accordion.polTags')).toBeInTheDocument();
      expect(screen.getByText('EditCustomFieldsRecord_PO')).toBeInTheDocument();
      expect(screen.getByText('EditCustomFieldsRecord_POL')).toBeInTheDocument();
    });
  });

  it('should set `physical.createInventory` and `checkinItems` fields when isBindaryActive is true', async () => {
    renderOrderTemplatesEditor({
      initialValues: {
        orderFormat: 'Physical Resource',
      },
    });

    const binderyActiveField = screen.getByRole('checkbox', { name: 'ui-orders.poLine.isBinderyActive' });

    expect(binderyActiveField).toBeInTheDocument();

    await user.click(binderyActiveField);

    expect(binderyActiveField).toBeChecked();
    expect(screen.getByLabelText(/physical.createInventory/)).toBeDisabled();
    expect(screen.getByLabelText(/workflow/i)).toBeDisabled();
  });

  describe('Form values', () => {
    it('should NOT populate ongoing fields when order type is not ongoing', async () => {
      renderOrderTemplatesEditor({
        initialValues: { templateName: 'Test' },
      });

      await act(async () => {
        await user.selectOptions(screen.getByRole('combobox', { name: /orderDetails.orderType/ }), [ORDER_TYPES.oneTime]);
      });
      await act(async () => {
        await user.click(screen.getByRole('button', { name: /editor.save/ }));
      });

      const formValues = defaultProps.onSubmit.mock.calls[0][0];

      expect(formValues.ongoing).toBeUndefined();
      expect(formValues).toEqual(expect.objectContaining({
        templateName: 'Test',
        orderType: ORDER_TYPES.oneTime,
      }));
    }, 10000);

    it('should populate ongoing fields when order type is ongoing', async () => {
      renderOrderTemplatesEditor({
        initialValues: { templateName: 'Test' },
      });

      await act(async () => {
        await user.selectOptions(screen.getByRole('combobox', { name: /orderDetails.orderType/ }), [ORDER_TYPES.ongoing]);
      });
      await act(async () => {
        await user.click(screen.getByRole('checkbox', { name: /renewals.subscription/ }));
      });
      await act(async () => {
        await user.click(screen.getByRole('button', { name: /editor.save/ }));
      });

      const formValues = defaultProps.onSubmit.mock.calls[0][0];

      expect(formValues.ongoing).toBeDefined();
      expect(formValues).toEqual(expect.objectContaining({
        templateName: 'Test',
        orderType: ORDER_TYPES.ongoing,
      }));
    }, 10000);
  });

  describe('OrderTemplatesEditor shortcuts', () => {
    beforeEach(() => {
      HasCommand.mockClear();
      defaultProps.close.mockClear();
    });

    it('should call expandAllSections when expandAllSections shortcut is called', () => {
      renderOrderTemplatesEditor();

      HasCommand.mock.calls[0][0].commands.find(c => c.name === 'expandAllSections').handler();

      expect(expandAllSections).toHaveBeenCalled();
    });

    it('should call collapseAll when collapseAllSections shortcut is called', () => {
      renderOrderTemplatesEditor();

      HasCommand.mock.calls[0][0].commands.find(c => c.name === 'collapseAllSections').handler();

      expect(mockCollapseAll).toHaveBeenCalled();
    });

    it('should call close when cancel shortcut is called', () => {
      renderOrderTemplatesEditor();

      HasCommand.mock.calls[0][0].commands.find(c => c.name === 'cancel').handler();

      expect(defaultProps.close).toHaveBeenCalled();
    });
  });
});
