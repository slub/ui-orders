import { Form } from 'react-final-form';

import { render, screen } from '@folio/jest-config-stripes/testing-library/react';
import { useAcqMethodsOptions } from '@folio/stripes-acq-components';

import { useAcqMethods } from '../../hooks/useAcqMethods';
import FieldAcquisitionMethod from './FieldAcquisitionMethod';

jest.mock('@folio/stripes-acq-components', () => ({
  ...jest.requireActual('@folio/stripes-acq-components'),
  useAcqMethodsOptions: jest.fn(),
}));
jest.mock('../../hooks/useAcqMethods', () => ({
  useAcqMethods: jest.fn(),
}));

const acqMethods = [
  { id: 'active-id', value: 'Active method' },
  { id: 'deprecated-id', value: 'Old method', deprecated: true },
];

const renderFieldAcquisitionMethod = (props = {}, formProps = {}) => render(
  <Form
    onSubmit={jest.fn()}
    {...formProps}
    render={() => (
      <FieldAcquisitionMethod
        {...props}
      />
    )}
  />,
);

describe('FieldAcquisitionMethod', () => {
  beforeEach(() => {
    useAcqMethods.mockClear().mockReturnValue({ acqMethods, isLoading: false });
    useAcqMethodsOptions.mockClear().mockReturnValue([]);
  });

  it('should render \'acquisition method\' field', () => {
    renderFieldAcquisitionMethod();

    expect(screen.getByText('ui-orders.poLine.acquisitionMethod')).toBeInTheDocument();
  });

  it('should exclude deprecated methods and request the suffix on a new line', () => {
    renderFieldAcquisitionMethod();

    expect(useAcqMethodsOptions).toHaveBeenCalledWith(acqMethods, {
      excludeDeprecated: true,
      selectedValue: undefined,
      withDeprecatedSuffix: true,
    });
  });

  it('should keep the initial (saved) method selectable when editing an existing line', () => {
    renderFieldAcquisitionMethod({}, {
      initialValues: { acquisitionMethod: 'deprecated-id' },
    });

    expect(useAcqMethodsOptions).toHaveBeenCalledWith(acqMethods, {
      excludeDeprecated: true,
      selectedValue: 'deprecated-id',
      withDeprecatedSuffix: true,
    });
  });
});
