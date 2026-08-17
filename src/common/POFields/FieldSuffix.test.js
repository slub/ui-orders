import { Form } from 'react-final-form';

import { render, screen } from '@folio/jest-config-stripes/testing-library/react';

import { PO_FORM_FIELDS } from '../constants';
import FieldSuffix from './FieldSuffix';

const mockFieldSelectFinal = jest.fn(({ label }) => label);

jest.mock('@folio/stripes-acq-components', () => {
  const PropTypes = jest.requireActual('prop-types');

  return {
    FieldSelectFinal: (props) => mockFieldSelectFinal(props),
    fieldSelectOptionsShape: PropTypes.arrayOf(PropTypes.shape({})),
  };
});

const defaultProps = {
  suffixes: [],
};

const renderFieldSuffix = (props = {}) => render(
  <Form
    onSubmit={() => jest.fn()}
    render={() => (
      <FieldSuffix
        {...defaultProps}
        {...props}
      />
    )}
  />,
);

describe('FieldSuffix', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render the suffix field', () => {
    renderFieldSuffix();

    expect(screen.getByText('ui-orders.orderDetails.orderNumberSuffix')).toBeInTheDocument();
  });

  it('should not validate PO number when shouldValidate is false', () => {
    renderFieldSuffix({ shouldValidate: false });

    expect(mockFieldSelectFinal).toHaveBeenCalledWith(expect.objectContaining({
      validateFields: [],
    }));
  });

  it('should validate PO number when shouldValidate is true', () => {
    renderFieldSuffix({ shouldValidate: true });

    expect(mockFieldSelectFinal).toHaveBeenCalledWith(expect.objectContaining({
      validateFields: [PO_FORM_FIELDS.poNumber],
    }));
  });
});
