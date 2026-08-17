import { useIntl } from 'react-intl';

import { renderHook } from '@folio/jest-config-stripes/testing-library/react';
import { dayjs } from '@folio/stripes/components';

import {
  orderLine,
  order,
  vendor,
  user,
  acqUnit,
  materialType,
  location,
  contributorNameType,
  identifierType,
  expenseClass,
  address,
  exportReport,
} from '../../../../test/jest/fixtures';
import { createExportReport } from './createExportReport';

jest.mock('react-intl', () => ({
  ...jest.requireActual('react-intl'),
  useIntl: jest.fn(),
}));

const customFieldsOrder = {
  customFields: {
    singleselect: 'opt_1',
    textfield: 'abc',
  },
};

const customFieldsOrderLine = {
  customFields: {
    multiselect: ['opt_1', 'opt_0', 'opt_3'],
  },
};

const customFieldsResolved = {
  singleselect: 'Value 2',
  textfield: 'abc',
  multiselect: 'A|B|opt_3',
};

const customFields = [
  {
    refId: 'singleselect',
    name: 'Single select',
    selectField: {
      options: {
        values: [
          {
            id: 'opt_1',
            value: 'Value 2',
          },
          {
            id: 'opt_0',
            value: 'Value 1',
          },
        ],
        sortingOrder: 'CUSTOM',
      },
    },
  },
  {
    refId: 'textfield',
    name: 'Text field',
  },
  {
    refId: 'multiselect',
    name: 'Multi select',
    selectField: {
      options: {
        values: [
          {
            id: 'opt_1',
            value: 'B',
          },
          {
            id: 'opt_0',
            value: 'A',
          },
        ],
        sortingOrder: 'CUSTOM',
      },
    },
  },
];

describe('createExportReport', () => {
  beforeEach(() => {
    useIntl.mockReturnValue({
      formatMessage: ({ id }) => id,
      formatDate: (date) => (typeof date === 'string' ? date.substring(0, 10) : date.toISOString()),
      formatNumber: (number) => number,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return export report object', () => {
    const { result } = renderHook(() => useIntl());
    const intl = result.current;

    expect(createExportReport(
      intl,
      [orderLine],
      [order],
      [], // customFields
      [vendor],
      [user],
      [acqUnit],
      [materialType],
      [location],
      [],
      [contributorNameType],
      [identifierType],
      [expenseClass],
      [address],
      [{ id: orderLine.acquisitionMethod, value: 'Purchase' }],
      [{ id: vendor?.organizationTypes?.[0], name: 'Test type' }],
    )).toEqual(expect.arrayContaining([expect.objectContaining(exportReport[0])]));
  });

  it('should properly parse activation due date', () => {
    const { result } = renderHook(() => useIntl());
    const intl = result.current;

    const report = createExportReport(
      intl,
      [{
        ...orderLine,
        eresource: {
          ...orderLine.eresource,
          activationDue: 3,
        },
      }],
      [order],
      [],
      [vendor],
      [user],
      [acqUnit],
      [materialType],
      [location],
      [],
      [contributorNameType],
      [identifierType],
      [expenseClass],
      [address],
      [{ id: orderLine.acquisitionMethod, value: 'Purchase' }],
      [{ id: vendor?.organizationTypes?.[0], name: 'Test type' }],
    );

    expect(dayjs(report[0].activationDue).format('YYYY-MM-DD')).toEqual('2021-08-18');
  });

  it('should return export report object with custom fields', () => {
    const { result } = renderHook(() => useIntl());
    const intl = result.current;

    const [exportRow] = createExportReport(
      intl,
      [{ ...orderLine, ...customFieldsOrderLine }],
      [{ ...order, ...customFieldsOrder }],
      customFields,
    );

    expect(exportRow.customFields).toEqual(customFieldsResolved);
  });

  it('should build rows with orders data even if there are no PO Lines in the order', () => {
    const { result } = renderHook(() => useIntl());
    const intl = result.current;

    const [exportRow] = createExportReport(
      intl,
      undefined,
      [order],
    );

    expect(exportRow.poNumber).toEqual(order.poNumber);
    expect(exportRow.orderType).toEqual(order.orderType);
    expect(exportRow.workflowStatus).toEqual(order.workflowStatus);
    expect(exportRow.note).toEqual(order.notes.join('|'));
  });

  it('should include prepayment data for multi-year payment line', () => {
    const { result } = renderHook(() => useIntl());
    const intl = result.current;

    const paymentTermsLine = {
      ...orderLine,
      multiYearPayment: true,
      paymentTerms: {
        totalPrice: 3500,
        prepaymentTerm: 2,
        startingFiscalYearId: 'fy-2026',
        fiscalYearDistributions: [
          {
            fiscalYearId: 'fy-2026',
            fundDistributions: [
              {
                code: 'USHIST',
                value: 50,
                distributionType: 'percentage',
                expenseClassId: expenseClass.id,
              },
            ],
          },
          {
            fiscalYearId: 'fy-2027',
            fundDistributions: [
              {
                code: 'USHIST',
                value: 50,
                distributionType: 'percentage',
                expenseClassId: expenseClass.id,
              },
            ],
          },
        ],
      },
    };

    const fiscalYears = [
      { id: 'fy-2026', code: 'FY2026' },
      { id: 'fy-2027', code: 'FY2027' },
    ];

    const [exportRow] = createExportReport(
      intl,
      [paymentTermsLine],
      [order],
      [],
      [vendor],
      [user],
      [acqUnit],
      [materialType],
      [location],
      [],
      [contributorNameType],
      [identifierType],
      [expenseClass],
      [address],
      [{ id: orderLine.acquisitionMethod, value: 'Purchase' }],
      [{ id: vendor?.organizationTypes?.[0], name: 'Test type' }],
      fiscalYears,
    );

    expect(exportRow.multiYearPayment).toBe(true);
    expect(exportRow.prepaymentTotalPrice).toBe(3500);
    expect(exportRow.prepaymentTerm).toBe(2);
    expect(exportRow.prepaymentStartingFY).toBe('FY2026');
    expect(typeof exportRow.prepaymentFYDistribution).toBe('string');
    expect(exportRow.prepaymentFYDistribution).toContain('"FY2026"');
    expect(exportRow.prepaymentFYDistribution).toContain('"FY2027"');
    expect(exportRow.prepaymentFYDistribution).toContain(expenseClass.name);
    expect(exportRow.prepaymentFYDistribution).toContain('"1750"');
  });
});
