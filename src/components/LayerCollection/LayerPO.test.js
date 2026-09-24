import { MemoryRouter } from 'react-router';

import {
  render,
  screen,
  waitFor,
} from '@folio/jest-config-stripes/testing-library/react';
import {
  ORDER_TYPES,
  useAddresses,
} from '@folio/stripes-acq-components';

import {
  address,
  order,
  user as userMock,
} from 'fixtures';
import {
  history,
  location,
} from 'fixtures/routerMocks';
import { SUBMIT_ACTION_FIELD } from '../../common/constants';
import { useOrder } from '../../common/hooks';
import { SUBMIT_ACTION } from '../PurchaseOrder/constants';
import POForm from '../PurchaseOrder/POForm';
import LayerPO from './LayerPO';

jest.mock('@folio/stripes-acq-components', () => ({
  ...jest.requireActual('@folio/stripes-acq-components'),
  useAddresses: jest.fn(),
}));
jest.mock('../../common/hooks', () => ({
  ...jest.requireActual('../../common/hooks'),
  useOrder: jest.fn(),
}));
jest.mock('../PurchaseOrder/POForm', () => jest.fn().mockReturnValue('POForm'));

const defaultProps = {
  resourses: {
    orderNumber: {
      records: [{ poNumber: '10000' }],
    },
  },
  mutator: {
    order: {
      POST: jest.fn().mockResolvedValue([order]),
      PUT: jest.fn().mockResolvedValue([order]),
    },
    users: {
      GET: jest.fn().mockResolvedValue([userMock]),
    },
    orderNumber: {
      GET: jest.fn().mockResolvedValue([]),
      reset: jest.fn(),
    },
    orderNumberSetting: {
      GET: jest.fn().mockResolvedValue([]),
    },
    prefixesSetting: {
      GET: jest.fn().mockResolvedValue([]),
    },
    suffixesSetting: {
      GET: jest.fn().mockResolvedValue([]),
    },
    orderTemplates: {
      GET: jest.fn().mockResolvedValue([]),
    },
    expenseClass: {
      GET: jest.fn().mockResolvedValue([]),
    },
  },
  match: { params: { id: '' } },
  location,
  history,
};

const renderLayerPO = (props = {}) => render(
  <LayerPO
    {...defaultProps}
    {...props}
  />,
  { wrapper: MemoryRouter },
);

describe('LayerPO', () => {
  beforeEach(() => {
    useAddresses.mockReturnValue({ addresses: [address] });
    useOrder.mockReturnValue({
      order,
      refetch: jest.fn(),
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render PO form', async () => {
    renderLayerPO();

    const form = await screen.findByText('POForm');

    expect(form).toBeInTheDocument();
  });

  it('should call onCancel when close icon was clicked', async () => {
    renderLayerPO();

    await waitFor(() => POForm.mock.calls[0][0].onCancel());

    expect(history.push).toHaveBeenCalled();
  });

  it('should call onSubmit when form was submitted', async () => {
    renderLayerPO();

    await waitFor(() => POForm.mock.calls[0][0].onSubmit({
      orderType: ORDER_TYPES.ongoing,
    }));

    expect(history.push).toHaveBeenCalledWith(expect.objectContaining({
      pathname: expect.stringMatching(/orders\/view/),
    }));
  });

  it('should keep edit form opened if saveAndKeepEditing action was selected', async () => {
    renderLayerPO();

    await waitFor(() => POForm.mock.calls[0][0].onSubmit({
      orderType: ORDER_TYPES.ongoing,
      [SUBMIT_ACTION_FIELD]: SUBMIT_ACTION.saveAndKeepEditing,
    }));

    expect(history.push).toHaveBeenCalledWith(expect.objectContaining({
      pathname: expect.stringMatching(/orders\/edit/),
    }));
  });

  describe('Create from inventory', () => {
    it('should call onSubmit when form was submitted 2', async () => {
      const locationState = {
        instanceId: 'instanceId',
        instanceTenantId: 'instanceTenantId',
      };

      renderLayerPO({
        location: {
          ...defaultProps.location,
          state: locationState,
        },
      });

      await waitFor(() => POForm.mock.calls[0][0].onSubmit({
        orderType: ORDER_TYPES.ongoing,
        [SUBMIT_ACTION_FIELD]: SUBMIT_ACTION.saveAndClose,
      }));

      expect(history.push).toHaveBeenCalledWith(expect.objectContaining({
        pathname: expect.stringMatching(/^\/orders\/view\/(?<orderId>.+)\/po-line\/create$/),
        state: locationState,
      }));
    });
  });
});
