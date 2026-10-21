import { render, screen } from '@folio/jest-config-stripes/testing-library/react';
import userEvent from '@folio/jest-config-stripes/testing-library/user-event';

import { integrationConfig } from 'fixtures';
import AutomaticExportInfo from './AutomaticExportInfo';

const acquisitionMethod = integrationConfig
  .exportTypeSpecificParameters
  .vendorEdiOrdersExportConfig
  .ediConfig
  .defaultAcquisitionMethods[0];
const vendorAccount = integrationConfig
  .exportTypeSpecificParameters
  .vendorEdiOrdersExportConfig
  .ediConfig
  .accountNoList[0];

const secondConfig = {
  ...integrationConfig,
  id: 'second-config',
  exportTypeSpecificParameters: {
    vendorEdiOrdersExportConfig: {
      ...integrationConfig.exportTypeSpecificParameters.vendorEdiOrdersExportConfig,
      configName: 'secondConfig',
      transmissionMethod: 'Email',
    },
  },
};

const defaultProps = {
  acquisitionMethod,
  automaticExport: true,
  integrationConfigs: [integrationConfig],
  vendorAccount,
};

const renderAutomaticExportInfo = (props = {}) => render(
  <AutomaticExportInfo
    {...defaultProps}
    {...props}
  />,
);

describe('AutomaticExportInfo', () => {
  describe('placement "below"', () => {
    it('should render the single matching integration with its full label as title', () => {
      renderAutomaticExportInfo({ placement: 'below' });

      const hint = screen.getByText('ui-orders.poLine.automaticExport.exportVia');

      expect(hint).toBeInTheDocument();
      expect(hint.closest('[title]')).toHaveAttribute('title', 'testConfig');
    });

    it('should include the transmission method in the label', () => {
      renderAutomaticExportInfo({
        placement: 'below',
        integrationConfigs: [secondConfig],
      });

      expect(screen.getByText('ui-orders.poLine.automaticExport.exportVia').closest('[title]'))
        .toHaveAttribute('title', 'secondConfig (Email)');
    });

    it('should render nothing when no integration matches', () => {
      const { container } = renderAutomaticExportInfo({
        placement: 'below',
        integrationConfigs: [],
      });

      expect(container).toBeEmptyDOMElement();
    });

    it('should render nothing when several integrations match', () => {
      const { container } = renderAutomaticExportInfo({
        placement: 'below',
        integrationConfigs: [integrationConfig, secondConfig],
      });

      expect(container).toBeEmptyDOMElement();
    });
  });

  describe('placement "label"', () => {
    it('should render a warning icon when no integration matches', async () => {
      renderAutomaticExportInfo({
        placement: 'label',
        integrationConfigs: [],
      });

      const warning = screen.getByRole('button', { name: 'ui-orders.poLine.automaticExport.noIntegration' });

      await userEvent.click(warning);

      expect(warning).toHaveAttribute('aria-expanded', 'true');
      expect(screen.getByText('ui-orders.poLine.automaticExport.noIntegration')).toBeInTheDocument();
    });

    it('should render an info popover listing all matching integrations', async () => {
      renderAutomaticExportInfo({
        placement: 'label',
        integrationConfigs: [integrationConfig, secondConfig],
      });

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

  it('should render nothing when automatic export is off', () => {
    const { container } = renderAutomaticExportInfo({
      placement: 'label',
      automaticExport: false,
      integrationConfigs: [],
    });

    expect(container).toBeEmptyDOMElement();
  });

  it('should render nothing without integration configs (order templates)', () => {
    const { container } = renderAutomaticExportInfo({
      placement: 'label',
      integrationConfigs: undefined,
    });

    expect(container).toBeEmptyDOMElement();
  });

  it('should render nothing while the integration configs are loading', () => {
    const { container } = renderAutomaticExportInfo({
      placement: 'label',
      isLoading: true,
      integrationConfigs: [],
    });

    expect(container).toBeEmptyDOMElement();
  });

  it('should render nothing for a manual order', () => {
    const { container } = renderAutomaticExportInfo({
      placement: 'label',
      manualOrder: true,
      integrationConfigs: [],
    });

    expect(container).toBeEmptyDOMElement();
  });
});
