import { Form } from 'react-final-form';

import { render, screen } from '@folio/jest-config-stripes/testing-library/react';

import { PO_FORM_FIELDS } from '../constants';
import FieldPrefix from './FieldPrefix';

const mockFieldSelectFinal = jest.fn(({ label }) => label);

jest.mock('@folio/stripes-acq-components', () => {
  const React = jest.requireActual('react');
  const PropTypes = jest.requireActual('prop-types');

  return {
    FieldSelectFinal: (props) => mockFieldSelectFinal(props),
    fieldSelectOptionsShape: PropTypes.arrayOf(PropTypes.shape({})),
  };
});

const defaultProps = {
  prefixes: [],
};

const renderFieldPrefix = (props = {}) => render(
  <Form
    onSubmit={() => jest.fn()}
    render={() => (
      <FieldPrefix
        {...defaultProps}
        {...props}
      />
    )}
  />,
);

describe('FieldPrefix', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render the prefix field', () => {
    renderFieldPrefix();

    expect(screen.getByText('ui-orders.orderDetails.orderNumberPrefix')).toBeInTheDocument();
  });

  it('should not validate PO number when shouldValidate is false', () => {
    renderFieldPrefix({ shouldValidate: false });

    expect(mockFieldSelectFinal).toHaveBeenCalledWith(expect.objectContaining({
      validateFields: [],
    }));
  });

  it('should validate PO number when shouldValidate is true', () => {
    renderFieldPrefix({ shouldValidate: true });

    expect(mockFieldSelectFinal).toHaveBeenCalledWith(expect.objectContaining({
      validateFields: [PO_FORM_FIELDS.poNumber],
    }));
  });
});
