import { MemoryRouter } from 'react-router-dom';

import {
  act,
  render,
  screen,
} from '@folio/jest-config-stripes/testing-library/react';
import user from '@folio/jest-config-stripes/testing-library/user-event';
import {
  HasCommand,
  expandAllSections,
} from '@folio/stripes/components';

import { history } from 'fixtures/routerMocks';
import { ORDER_TYPE } from '../../common/constants';
import POForm from './POForm';
import { usePONumberFieldValidator } from './hooks';

const mockCollapseAll = jest.fn();

jest.mock('@folio/stripes/components', () => ({
  ...jest.requireActual('@folio/stripes/components'),
  collapseAllSections: jest.fn(),
  expandAllSections: jest.fn(),
  HasCommand: jest.fn(({ children }) => <div>{children}</div>),
}));
jest.mock('../../common/hooks', () => ({
  ...jest.requireActual('../../common/hooks'),
  useAccordionErrorTrigger: jest.fn(() => ({
    onToggle: jest.fn(),
    onExpandAllToggle: jest.fn(),
    collapseAll: mockCollapseAll,
  })),
}));
jest.mock('@folio/stripes/smart-components', () => ({
  ...jest.requireActual('@folio/stripes/smart-components'),
  EditCustomFieldsRecord: jest.fn().mockReturnValue('EditCustomFieldsRecord'),
}));
jest.mock('@folio/stripes-acq-components', () => ({
  ...jest.requireActual('@folio/stripes-acq-components'),
  AcqUnitsField: jest.fn().mockReturnValue('AcqUnitsField'),
  FieldOrganization: jest.fn().mockReturnValue('FieldOrganization'),
  FieldTags: jest.fn().mockReturnValue('FieldTags'),
}));
jest.mock('./hooks', () => ({
  ...jest.requireActual('./hooks'),
  usePONumberFieldValidator: jest.fn(),
}));
jest.mock('./OngoingOrderInfo/OngoingInfoForm', () => jest.fn().mockReturnValue('OngoingInfoForm'));

const defaultProps = {
  addresses: [],
  values: {},
  generatedNumber: '1000',
  initialValues: {
    template: 'templateId',
    poNumber: '',
  },
  pristine: false,
  submitting: false,
  onSubmit: jest.fn(),
  onCancel: jest.fn(),
  change: jest.fn(),
  handleSubmit: jest.fn(),
  parentResources: {
    orderNumberSetting: {
      records: [{
        value: JSON.stringify({ canUserEditOrderNumber: true }),
      }],
    },
    prefixesSetting: {
      records: [{
        name: 'pref',
      }],
    },
    suffixesSetting: {
      records: [{
        name: 'pref',
      }],
    },
    orderTemplates: {
      records: [{
        id: 'templateId',
        label: 'label',
        templateName: 'templateName',
        templateCode: 'templateCode',
        orderType: ORDER_TYPE.ongoing,
        locations: [{
          locationId: 'locationId',
        }],
        hiddenFields: {
          ongoing: { isSubscription: true },
          approved: true,
        },
      }],
    },
  },
  form: {
    change: jest.fn(),
    batch: jest.fn(),
    getRegisteredFields: jest.fn(),
  },
  history,
};

const renderPOForm = (props = {}) => render(
  <POForm
    {...defaultProps}
    {...props}
  />,
  { wrapper: MemoryRouter },
);

describe('POForm', () => {
  const validatePONumberMock = jest.fn();

  beforeEach(() => {
    usePONumberFieldValidator.mockReturnValue({ validate: validatePONumberMock });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render \'PO form\' fields', () => {
    renderPOForm();

    expect(screen.getByText('ui-orders.settings.orderTemplates.editor.template.name')).toBeInTheDocument();
    expect(screen.getByText('ui-orders.orderSummary.totalUnits')).toBeInTheDocument();
    expect(screen.getByText('ui-orders.orderSummary.totalEstimatedPrice')).toBeInTheDocument();
    expect(screen.getByText('ui-orders.orderSummary.approved')).toBeInTheDocument();
    expect(screen.getByText('ui-orders.orderSummary.workflowStatus')).toBeInTheDocument();
    expect(screen.getByText('EditCustomFieldsRecord')).toBeInTheDocument();
  });

  it('should not render Ongoing accordion for non-ongoing order', () => {
    renderPOForm();

    expect(screen.queryByText(/OngoingInfoForm/i)).not.toBeInTheDocument();
  });

  it('should render Ongoing accordion for ongoing order', () => {
    renderPOForm({ initialValues: { ...defaultProps.initialValues, orderType: ORDER_TYPE.ongoing } });

    expect(screen.getByText(/OngoingInfoForm/i)).toBeInTheDocument();
  });

  it('should render \'Add POL\' button', () => {
    renderPOForm({ instanceId: 'id' });

    expect(screen.queryByText('ui-orders.paneMenu.addPOLine')).toBeInTheDocument();
  });

  it('should change template when another selected and show hidden fields when \'Show hidden fields\' btn was clicked', async () => {
    renderPOForm();

    const selects = await screen.findAllByLabelText('ui-orders.settings.orderTemplates.editor.template.name');
    const select = selects[0];

    await act(async () => user.click(select));

    const options = await screen.findAllByRole('option');

    await act(async () => user.click(options[1]));

    const toggleFieldsVisibility = await screen.findByTestId('toggle-fields-visibility');

    expect(screen.queryByRole('checkbox', {
      name: 'ui-orders.orderSummary.approved',
    })).not.toBeInTheDocument();

    await act(async () => user.click(toggleFieldsVisibility));

    const field = await screen.findByRole('checkbox', {
      name: 'ui-orders.orderSummary.approved',
    });

    expect(field).toBeInTheDocument();
  });

  it('should call validator when \'PO Number\' was changed', async () => {
    renderPOForm();

    await user.type(screen.getByLabelText('ui-orders.orderDetails.poNumber'), '777');

    expect(validatePONumberMock).toHaveBeenCalled();
  });
});

describe('POForm shortcuts', () => {
  beforeEach(() => {
    HasCommand.mockClear();
  });

  it('should call expandAllSections when expandAllSections shortcut is called', () => {
    renderPOForm();

    act(() => HasCommand.mock.calls[0][0].commands.find(c => c.name === 'expandAllSections').handler());

    expect(expandAllSections).toHaveBeenCalled();
  });

  it('should call collapseAll when collapseAllSections shortcut is called', () => {
    renderPOForm();

    act(() => HasCommand.mock.calls[0][0].commands.find(c => c.name === 'collapseAllSections').handler());

    expect(mockCollapseAll).toHaveBeenCalled();
  });

  it('should clear fields after template change', async () => {
    renderPOForm({ initialValues: {} });

    await user.selectOptions(screen.getByRole('combobox', { name: /orderType/ }), ORDER_TYPE.ongoing);

    /* Field is filled before template change */
    expect(screen.getByRole('combobox', { name: /orderType/ })).toHaveValue(ORDER_TYPE.ongoing);

    const selects = await screen.findAllByLabelText('ui-orders.settings.orderTemplates.editor.template.name');
    const select = selects[0];

    await act(async () => user.click(select));

    const options = await screen.findAllByRole('option');

    await act(async () => user.click(options[1]));

    /* Field is cleared after template change */
    expect(screen.getByRole('combobox', { name: /orderType/ })).toHaveValue(undefined);
  });
});
