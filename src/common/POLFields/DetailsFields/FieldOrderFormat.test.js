import { Form } from 'react-final-form';

import user from '@folio/jest-config-stripes/testing-library/user-event';
import {
  act,
  render,
  screen,
} from '@folio/jest-config-stripes/testing-library/react';
import { INVENTORY_RECORDS_TYPE, ORDER_FORMATS } from '@folio/stripes-acq-components';

import { vendor } from 'fixtures';
import FieldOrderFormat from './FieldOrderFormat';

const defaultProps = {
  formValues: {
    isPackage: true,
    locations: [{}],
  },
  vendor,
  createInventorySetting: {},
  disabled: false,
};

// Read the resulting nested values from a real form, not only the selected option.
const renderFieldOrderFormat = (props = {}, initialValues = defaultProps.formValues) => {
  let formApi;
  const view = render(
    <Form
      initialValues={initialValues}
      onSubmit={jest.fn()}
      render={({ form, values }) => {
        formApi = form;

        return <FieldOrderFormat {...defaultProps} {...props} formValues={values} />;
      }}
    />,
  );

  return { ...view, getValues: () => formApi.getState().values };
};

describe('FieldOrderFormat', () => {
  it('should render \'order format\' field', () => {
    renderFieldOrderFormat();

    expect(screen.getByText('ui-orders.poLine.orderFormat')).toBeInTheDocument();
  });

  it('should change field value when an option was selected', async () => {
    renderFieldOrderFormat();

    const options = screen.getAllByRole('option');
    const select = await screen.findByRole('combobox');

    await user.selectOptions(select, ORDER_FORMATS.electronicResource);

    expect(options[1].selected).toBeTruthy();

    await user.selectOptions(select, ORDER_FORMATS.physicalResource);

    expect(options[2].selected).toBeTruthy();

    await user.selectOptions(select, ORDER_FORMATS.PEMix);

    expect(options[3].selected).toBeTruthy();

    await user.selectOptions(select, ORDER_FORMATS.other);

    expect(options[4].selected).toBeTruthy();

    await user.selectOptions(select, '');

    expect(options[0].selected).toBeTruthy();
  });

  describe.each([
    ['initial physical selection', undefined, ORDER_FORMATS.physicalResource],
    ['physical to mixed', ORDER_FORMATS.physicalResource, ORDER_FORMATS.PEMix],
    ['mixed to physical', ORDER_FORMATS.PEMix, ORDER_FORMATS.physicalResource],
  ])('with Bindery active: %s', (_description, previousFormat, nextFormat) => {
    it.each([...Object.values(INVENTORY_RECORDS_TYPE), undefined])(
      'should keep all inventory records instead of tenant default %s',
      async (physicalDefault) => {
        const { getValues } = renderFieldOrderFormat({
          createInventorySetting: { physical: physicalDefault, eresource: INVENTORY_RECORDS_TYPE.instance },
        }, {
          orderFormat: previousFormat,
          details: { isBinderyActive: true },
          physical: { createInventory: INVENTORY_RECORDS_TYPE.all },
        });

        await act(async () => user.selectOptions(screen.getByRole('combobox'), nextFormat));

        expect(getValues().physical?.createInventory).toBe(INVENTORY_RECORDS_TYPE.all);

        if (nextFormat === ORDER_FORMATS.PEMix) {
          expect(getValues().eresource.createInventory).toBe(INVENTORY_RECORDS_TYPE.instance);
        } else {
          expect(getValues().eresource).toBeUndefined();
        }
      },
    );
  });

  it.each([ORDER_FORMATS.physicalResource, ORDER_FORMATS.PEMix])(
    'should use the tenant physical default for %s when Bindery is inactive',
    async (nextFormat) => {
      const { getValues } = renderFieldOrderFormat({
        createInventorySetting: { physical: INVENTORY_RECORDS_TYPE.instance },
      }, { details: { isBinderyActive: false } });

      await act(async () => user.selectOptions(screen.getByRole('combobox'), nextFormat));

      expect(getValues().physical.createInventory).toBe(INVENTORY_RECORDS_TYPE.instance);
    },
  );
});
