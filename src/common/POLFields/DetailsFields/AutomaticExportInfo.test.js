import { render, screen } from '@folio/jest-config-stripes/testing-library/react';
import userEvent from '@folio/jest-config-stripes/testing-library/user-event';

import { useAutomaticExportConfigs } from '../../hooks/useAutomaticExportConfigs';
import AutomaticExportInfo from './AutomaticExportInfo';

jest.mock('../../hooks/useAutomaticExportConfigs', () => ({
  useAutomaticExportConfigs: jest.fn(),
}));

const buildConfig = (id, configName, transmissionMethod) => ({
  id,
  exportTypeSpecificParameters: {
    vendorEdiOrdersExportConfig: { configName, transmissionMethod },
  },
});

const firstConfig = buildConfig('first-config', 'testConfig');
const secondConfig = buildConfig('second-config', 'secondConfig', 'Email');

const defaultProps = {
  acquisitionMethod: 'acq-method-id',
  automaticExport: true,
  vendorAccount: '12345',
  vendorId: 'vendor-id',
};

const renderAutomaticExportInfo = (props = {}) => render(
  <AutomaticExportInfo
    {...defaultProps}
    {...props}
  />,
);

const mockConfigs = (configs) => useAutomaticExportConfigs.mockReturnValue({ configs });

describe('AutomaticExportInfo', () => {
  beforeEach(() => {
    useAutomaticExportConfigs.mockClear();
    mockConfigs([firstConfig]);
  });

  describe('placement "below"', () => {
    it('should render the single matching integration with its full label as title', () => {
      renderAutomaticExportInfo({ placement: 'below' });

      const hint = screen.getByText('ui-orders.poLine.automaticExport.exportVia');

      expect(hint).toBeInTheDocument();
      expect(hint.closest('[title]')).toHaveAttribute('title', 'testConfig');
    });

    it('should include the transmission method in the label', () => {
      mockConfigs([secondConfig]);

      renderAutomaticExportInfo({ placement: 'below' });

      expect(screen.getByText('ui-orders.poLine.automaticExport.exportVia').closest('[title]'))
        .toHaveAttribute('title', 'secondConfig (Email)');
    });

    it('should render nothing when no integration matches', () => {
      mockConfigs([]);

      const { container } = renderAutomaticExportInfo({ placement: 'below' });

      expect(container).toBeEmptyDOMElement();
    });

    it('should render nothing when several integrations match', () => {
      mockConfigs([firstConfig, secondConfig]);

      const { container } = renderAutomaticExportInfo({ placement: 'below' });

      expect(container).toBeEmptyDOMElement();
    });
  });

  describe('placement "label"', () => {
    it('should render a warning icon when no integration matches', async () => {
      mockConfigs([]);

      renderAutomaticExportInfo({ placement: 'label' });

      const warning = screen.getByRole('button', { name: 'ui-orders.poLine.automaticExport.noIntegration' });

      await userEvent.click(warning);

      expect(warning).toHaveAttribute('aria-expanded', 'true');
      expect(screen.getByText('ui-orders.poLine.automaticExport.noIntegration')).toBeInTheDocument();
    });

    it('should render an info popover listing all matching integrations', async () => {
      mockConfigs([firstConfig, secondConfig]);

      renderAutomaticExportInfo({ placement: 'label' });

      await userEvent.click(screen.getByRole('button'));

      expect(screen.getByText('ui-orders.poLine.automaticExport.multipleTitle')).toBeInTheDocument();
      expect(screen.getByText('testConfig')).toBeInTheDocument();
      expect(screen.getByText('secondConfig (Email)')).toBeInTheDocument();
      expect(screen.getByText('ui-orders.poLine.automaticExport.multipleHint')).toBeInTheDocument();
    });

    it('should render nothing when exactly one integration matches', () => {
      const { container } = renderAutomaticExportInfo({ placement: 'label' });

      expect(container).toBeEmptyDOMElement();
    });
  });

  it('should render nothing as long as there is no answer', () => {
    mockConfigs(undefined);

    const { container } = renderAutomaticExportInfo({ placement: 'label' });

    expect(container).toBeEmptyDOMElement();
  });

  it('should look up the integrations for the values of the line', () => {
    renderAutomaticExportInfo();

    expect(useAutomaticExportConfigs).toHaveBeenCalledWith(
      {
        vendorId: defaultProps.vendorId,
        acquisitionMethod: defaultProps.acquisitionMethod,
        vendorAccount: defaultProps.vendorAccount,
      },
      { enabled: true },
    );
  });

  it('should switch the lookup off when automatic export is off', () => {
    renderAutomaticExportInfo({ automaticExport: false });

    expect(useAutomaticExportConfigs).toHaveBeenCalledWith(expect.any(Object), { enabled: false });
  });

  it('should switch the lookup off for a manual order', () => {
    renderAutomaticExportInfo({ manualOrder: true });

    expect(useAutomaticExportConfigs).toHaveBeenCalledWith(expect.any(Object), { enabled: false });
  });
});
