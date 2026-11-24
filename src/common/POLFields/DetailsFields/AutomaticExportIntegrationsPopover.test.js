import { render, screen } from '@folio/jest-config-stripes/testing-library/react';
import userEvent from '@folio/jest-config-stripes/testing-library/user-event';

import AutomaticExportIntegrationsPopover from './AutomaticExportIntegrationsPopover';

const buildConfig = (id, configName, transmissionMethod) => ({
  id,
  exportTypeSpecificParameters: {
    vendorEdiOrdersExportConfig: { configName, transmissionMethod },
  },
});

const firstConfig = buildConfig('first-config', 'testConfig');
const secondConfig = buildConfig('second-config', 'secondConfig', 'Email');

const renderAutomaticExportIntegrationsPopover = (configs) => render(
  <AutomaticExportIntegrationsPopover configs={configs} />,
);

describe('AutomaticExportIntegrationsPopover', () => {
  it('should render a warning icon when no integration matches', async () => {
    renderAutomaticExportIntegrationsPopover([]);

    const warning = screen.getByRole('button', { name: 'ui-orders.poLine.automaticExport.noIntegration' });

    await userEvent.click(warning);

    expect(warning).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText('ui-orders.poLine.automaticExport.noIntegration')).toBeInTheDocument();
  });

  it('should render an info popover listing all matching integrations', async () => {
    renderAutomaticExportIntegrationsPopover([firstConfig, secondConfig]);

    await userEvent.click(screen.getByRole('button'));

    expect(screen.getByText('ui-orders.poLine.automaticExport.multipleTitle')).toBeInTheDocument();
    expect(screen.getByText('testConfig')).toBeInTheDocument();
    expect(screen.getByText('secondConfig (Email)')).toBeInTheDocument();
    expect(screen.getByText('ui-orders.poLine.automaticExport.multipleHint')).toBeInTheDocument();
  });

  it('should render nothing when exactly one integration matches', () => {
    const { container } = renderAutomaticExportIntegrationsPopover([firstConfig]);

    expect(container).toBeEmptyDOMElement();
  });

  it('should render nothing as long as there is no answer', () => {
    const { container } = renderAutomaticExportIntegrationsPopover(undefined);

    expect(container).toBeEmptyDOMElement();
  });
});
