import { Form } from 'react-final-form';

import { render, screen } from '@folio/jest-config-stripes/testing-library/react';

import FieldAutomaticExport from './FieldAutomaticExport';

const renderFieldAutomaticExport = (props = {}) => render(
  <Form
    onSubmit={() => jest.fn()}
    render={() => (
      <FieldAutomaticExport
        {...props}
      />
    )}
  />,
);

describe('FieldAutomaticExport', () => {
  it('should render \'Automatic export\' field', () => {
    renderFieldAutomaticExport();

    expect(screen.getByText('ui-orders.poLine.automaticExport')).toBeInTheDocument();
  });

  it('should render the manual order info for a manual order', () => {
    renderFieldAutomaticExport({ isManualOrder: true });

    expect(screen.getByRole('button')).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: /ui-orders.poLine.automaticExport/ })).toBeInTheDocument();
  });

  it('should render the export info inside the label', () => {
    renderFieldAutomaticExport({ exportInfo: <span>export info</span> });

    expect(screen.getByRole('checkbox', { name: /export info/ })).toBeInTheDocument();
  });
});
