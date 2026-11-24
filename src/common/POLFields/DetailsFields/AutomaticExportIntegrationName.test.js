import { render, screen } from '@folio/jest-config-stripes/testing-library/react';

import AutomaticExportIntegrationName from './AutomaticExportIntegrationName';

const buildConfig = (id, configName, transmissionMethod) => ({
  id,
  exportTypeSpecificParameters: {
    vendorEdiOrdersExportConfig: { configName, transmissionMethod },
  },
});

const firstConfig = buildConfig('first-config', 'testConfig');
const secondConfig = buildConfig('second-config', 'secondConfig', 'Email');

const renderAutomaticExportIntegrationName = (configs) => render(
  <AutomaticExportIntegrationName configs={configs} />,
);

describe('AutomaticExportIntegrationName', () => {
  it('should render the single matching integration with its full label as title', () => {
    renderAutomaticExportIntegrationName([secondConfig]);

    const hint = screen.getByText('ui-orders.poLine.automaticExport.exportVia');

    expect(hint).toBeInTheDocument();
    expect(hint.closest('[title]')).toHaveAttribute('title', 'secondConfig (Email)');
  });

  it('should render nothing when no integration matches', () => {
    const { container } = renderAutomaticExportIntegrationName([]);

    expect(container).toBeEmptyDOMElement();
  });

  it('should render nothing when several integrations match', () => {
    const { container } = renderAutomaticExportIntegrationName([firstConfig, secondConfig]);

    expect(container).toBeEmptyDOMElement();
  });

  it('should render nothing as long as there is no answer', () => {
    const { container } = renderAutomaticExportIntegrationName(undefined);

    expect(container).toBeEmptyDOMElement();
  });
});
