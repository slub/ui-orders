import user from '@folio/jest-config-stripes/testing-library/user-event';
import { render, screen } from '@folio/jest-config-stripes/testing-library/react';

import { useDeprecatedAcqMethods } from '../../../common/hooks';
import OpenOrderConfirmationModal from './OpenOrderConfirmationModal';

jest.mock('../../../common/hooks', () => ({
  useDeprecatedAcqMethods: jest.fn(),
}));

const defaultProps = {
  orderNumber: '42',
  cancel: jest.fn(),
  submit: jest.fn(),
};

const renderOpenOrderConfirmationModal = (props = {}) => render(
  <OpenOrderConfirmationModal
    {...defaultProps}
    {...props}
  />,
);

describe('OpenOrderConfirmationModal', () => {
  beforeEach(() => {
    useDeprecatedAcqMethods
      .mockClear()
      .mockReturnValue({ deprecatedAcqMethods: [], isLoading: false });
  });

  it('should render open order confirmation modal ', () => {
    renderOpenOrderConfirmationModal();

    expect(screen.getByText('ui-orders.openOrderModal.title')).toBeInTheDocument();
  });

  it('should not show the deprecated methods warning when no line uses one', () => {
    renderOpenOrderConfirmationModal();

    expect(screen.queryByText('ui-orders.openOrderModal.deprecatedAcquisitionMethods')).not.toBeInTheDocument();
  });

  it('should warn about the deprecated methods used by the order lines', () => {
    useDeprecatedAcqMethods.mockReturnValue({
      deprecatedAcqMethods: [{ id: 'old', value: 'Old method', deprecated: true, poLineNumbers: ['POL-1'] }],
      isLoading: false,
    });

    renderOpenOrderConfirmationModal();

    expect(screen.getByText('ui-orders.openOrderModal.deprecatedAcquisitionMethods')).toBeInTheDocument();
  });

  it('should disable submit while the acquisition methods are loading', () => {
    useDeprecatedAcqMethods.mockReturnValue({ deprecatedAcqMethods: [], isLoading: true });

    renderOpenOrderConfirmationModal();

    expect(screen.getByText('ui-orders.openOrderModal.submit').closest('button')).toBeDisabled();
  });
});

describe('OpenOrderConfirmationModal actions', () => {
  beforeEach(() => {
    useDeprecatedAcqMethods.mockReturnValue({ deprecatedAcqMethods: [], isLoading: false });
    defaultProps.cancel.mockClear();
    defaultProps.submit.mockClear();
  });

  it('should close modal', async () => {
    renderOpenOrderConfirmationModal();

    const cancelBtn = await screen.findByText('ui-orders.openOrderModal.cancel');

    await user.click(cancelBtn);

    expect(defaultProps.cancel).toHaveBeenCalled();
  });

  it('should handle submitting', async () => {
    renderOpenOrderConfirmationModal();

    const closeBtn = await screen.findByText('ui-orders.openOrderModal.submit');

    await user.click(closeBtn);

    expect(defaultProps.submit).toHaveBeenCalled();
  });
});
