import { render, screen } from '@folio/jest-config-stripes/testing-library/react';

import AutomaticExportVia from './AutomaticExportVia';

const buildConfig = (id, configName, transmissionMethod) => ({
  id,
  exportTypeSpecificParameters: {
    vendorEdiOrdersExportConfig: { configName, transmissionMethod },
  },
});

const firstConfig = buildConfig('first-config', 'testConfig');
const secondConfig = buildConfig('second-config', 'secondConfig', 'Email');

const renderAutomaticExportVia = (configs) => render(
  <AutomaticExportVia configs={configs} />,
);

describe('AutomaticExportVia', () => {
  it('should render the single matching integration with its full label as title', () => {
    renderAutomaticExportVia([secondConfig]);

    const hint = screen.getByText('ui-orders.poLine.automaticExport.exportVia');

    expect(hint).toBeInTheDocument();
    expect(hint.closest('[title]')).toHaveAttribute('title', 'secondConfig (Email)');
  });

  it('should render nothing when no integration matches', () => {
    const { container } = renderAutomaticExportVia([]);

    expect(container).toBeEmptyDOMElement();
  });

  it('should render nothing when several integrations match', () => {
    const { container } = renderAutomaticExportVia([firstConfig, secondConfig]);

    expect(container).toBeEmptyDOMElement();
  });

  it('should render nothing as long as there is no answer', () => {
    const { container } = renderAutomaticExportVia(undefined);

    expect(container).toBeEmptyDOMElement();
  });
});
