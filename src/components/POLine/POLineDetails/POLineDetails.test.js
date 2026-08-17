import { FormattedMessage } from 'react-intl';
import { QueryClient, QueryClientProvider } from 'react-query';

import { render, screen } from '@folio/jest-config-stripes/testing-library/react';
import { ACQUISITION_METHOD } from '@folio/stripes-acq-components';

import POLineDetails, {
  getAcquisitionMethodValue,
  getReceivingWorkflowValue,
} from './POLineDetails';

jest.mock('../hooks', () => ({
  ...jest.requireActual('../hooks'),
  useIsFundsRestrictedByLocationIds: jest.fn().mockReturnValue({ hasLocationRestrictedFund: true }),
}));

const queryClient = new QueryClient();

// eslint-disable-next-line react/prop-types
const wrapper = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    {children}
  </QueryClientProvider>
);

const renderPOLineDetails = (props = {}) => render(
  <POLineDetails
    {...props}
  />,
  { wrapper },
);

describe('POLineDetails', () => {
  it('should render \'POLine details\' view', () => {
    renderPOLineDetails();

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
    expect(screen.getByText('ui-orders.poLine.cancellationRestriction')).toBeInTheDocument();
    expect(screen.getByText('ui-orders.poLine.rush')).toBeInTheDocument();
    expect(screen.getByText('ui-orders.poLine.claimingActive')).toBeInTheDocument();
    expect(screen.getByText('ui-orders.poLine.claimingInterval')).toBeInTheDocument();
    expect(screen.getByText('ui-orders.poLine.сollection')).toBeInTheDocument();
    expect(screen.getByText('ui-orders.poLine.receivingWorkflow')).toBeInTheDocument();
    expect(screen.getByText('ui-orders.poLine.cancellationRestrictionNote')).toBeInTheDocument();
    expect(screen.getByText('ui-orders.poLine.poLineDescription')).toBeInTheDocument();
  });

  describe('getAcquisitionMethodValue', () => {
    const intl = { formatMessage: ({ id }) => id };

    it('should return \'null\' if PO Line \'acquisitionMethod\' is undefined or null', () => {
      const acqMethodValue = getAcquisitionMethodValue(null, null, intl);

      expect(acqMethodValue).toBeNull();
    });

    it('should return \'invalid reference\' label if acq method with specified ID was not loaded', () => {
      const acqMethodValue = getAcquisitionMethodValue('testAcqMethod', null, intl);

      expect(acqMethodValue).toEqual(<FormattedMessage id="ui-orders.acquisitionMethod.invalid" />);
    });

    it('should return translated label for acq method', () => {
      const acqMethodValue = getAcquisitionMethodValue('acqMethod', { value: ACQUISITION_METHOD.approvalPlan }, intl);

      expect(acqMethodValue).toBe('stripes-acq-components.acquisition_method.approvalPlan');
    });

    it('should suffix a deprecated acq method label', () => {
      const acqMethodValue = getAcquisitionMethodValue(
        'acqMethod',
        { value: ACQUISITION_METHOD.approvalPlan, deprecated: true },
        intl,
      );

      expect(acqMethodValue).toBe('stripes-acq-components.acquisition_method.deprecatedSuffix');
    });
  });

  describe('getReceivingWorkflowValue', () => {
    it('should return \'null\' if PO Line \'checkinItems\' is undefined or null', () => {
      const acqMethodValue = getReceivingWorkflowValue(null);

      expect(acqMethodValue).toBeNull();
    });

    it('should return translated label for receiving workflow', () => {
      expect(getReceivingWorkflowValue(false)).toEqual(<FormattedMessage id="ui-orders.poLine.receivingWorkflow.synchronized" />);
      expect(getReceivingWorkflowValue(true)).toEqual(<FormattedMessage id="ui-orders.poLine.receivingWorkflow.independent" />);
    });
  });
});
