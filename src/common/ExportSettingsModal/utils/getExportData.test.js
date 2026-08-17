import { useIntl } from 'react-intl';

import { renderHook } from '@folio/jest-config-stripes/testing-library/react';
import { useStripes } from '@folio/stripes/core';
import {
  fetchConsortiumHoldingsByIds,
  fetchConsortiumLocations,
  fetchTenantAddressesByIds,
} from '@folio/stripes-acq-components';

import {
  address,
  orderLine,
  order,
  vendor,
} from 'fixtures';
import { fetchExportDataByIds } from '../../utils';
import { getExportData } from './getExportData';

jest.mock('@folio/stripes-acq-components', () => ({
  ...jest.requireActual('@folio/stripes-acq-components'),
  fetchConsortiumHoldingsByIds: jest.fn(() => () => Promise.resolve({ holdings: [] })),
  fetchConsortiumLocations: jest.fn(() => () => Promise.resolve({ locations: [] })),
  fetchTenantAddressesByIds: jest.fn(),
}));

jest.mock('./createExportReport', () => ({
  createExportReport: jest.fn().mockReturnValue('test report'),
}));

jest.mock('../../utils', () => ({
  fetchExportDataByIds: jest.fn(),
}));

const mockMutator = {
  acquisitionMethods: {
    GET: jest.fn(),
    reset: jest.fn(),
  },
  exportVendors: {
    GET: jest.fn().mockReturnValue([vendor]),
    reset: jest.fn(),
  },
  exportUsers: {
    GET: jest.fn(),
    reset: jest.fn(),
  },
  exportAcqUnits: {
    GET: jest.fn(),
    reset: jest.fn(),
  },
  exportMaterialTypes: {
    GET: jest.fn(),
    reset: jest.fn(),
  },
  exportLocations: {
    GET: jest.fn(),
    reset: jest.fn(),
  },
  exportHoldings: {
    GET: jest.fn(),
    reset: jest.fn(),
  },
  exportContributorNameTypes: {
    GET: jest.fn(),
    reset: jest.fn(),
  },
  exportIdentifierTypes: {
    GET: jest.fn(),
    reset: jest.fn(),
  },
  exportExpenseClasses: {
    GET: jest.fn(),
    reset: jest.fn(),
  },
  fiscalYears: {
    GET: jest.fn(),
    reset: jest.fn(),
  },
  organizationTypes: {
    GET: jest.fn().mockResolvedValue([]),
    reset: jest.fn(),
  },
};

const kyMock = {
  extend: jest.fn().mockReturnThis(),
  get: jest.fn(),
};

describe('getExportData', () => {
  beforeEach(() => {
    fetchTenantAddressesByIds.mockReturnValue(() => Promise.resolve({ addresses: [address] }));
    fetchExportDataByIds.mockImplementation((mutator) => {
      if (mutator === mockMutator.exportVendors) {
        return Promise.resolve([vendor]);
      }

      return Promise.resolve([]);
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should get export data', async () => {
    const { result } = renderHook(() => useIntl());
    const { result: stripesResult } = renderHook(() => useStripes());
    const intl = result.current;
    const stripes = stripesResult.current;

    const report = await getExportData(mockMutator, kyMock, { intl, stripes })([orderLine], [order], []);

    expect(report).toEqual('test report');

    expect(fetchConsortiumHoldingsByIds).not.toHaveBeenCalled();
    expect(fetchConsortiumLocations).not.toHaveBeenCalled();
  });

  describe('Central ordering enabled', () => {
    it('should get export data', async () => {
      const { result } = renderHook(() => useIntl());
      const { result: stripesResult } = renderHook(() => useStripes());
      const intl = result.current;
      const stripes = stripesResult.current;
      const configs = {
        isCentralOrderingEnabled: true,
        intl,
        stripes,
      };

      const report = await getExportData(mockMutator, kyMock, configs)([orderLine], [order], []);

      expect(report).toEqual('test report');

      expect(fetchConsortiumHoldingsByIds).toHaveBeenCalled();
      expect(fetchConsortiumLocations).toHaveBeenCalled();
    });
  });

  it('should request fiscal year and expense class ids from payment terms distributions', async () => {
    const { result } = renderHook(() => useIntl());
    const { result: stripesResult } = renderHook(() => useStripes());
    const intl = result.current;
    const stripes = stripesResult.current;

    const lineWithPaymentTerms = {
      ...orderLine,
      paymentTerms: {
        fiscalYearDistributions: [
          {
            fiscalYearId: 'fy-2026',
            fundDistributions: [{ expenseClassId: 'expense-class-2' }],
          },
          {
            fiscalYearId: 'fy-2027',
            fundDistributions: [{ expenseClassId: 'expense-class-3' }],
          },
        ],
      },
    };

    const orderWithFiscalYear = {
      ...order,
      fiscalYearId: 'fy-order',
    };

    await getExportData(mockMutator, kyMock, { intl, stripes })([lineWithPaymentTerms], [orderWithFiscalYear], []);

    expect(fetchExportDataByIds).toHaveBeenCalledWith(
      mockMutator.fiscalYears,
      expect.arrayContaining(['fy-order', 'fy-2026', 'fy-2027']),
    );
    expect(fetchExportDataByIds).toHaveBeenCalledWith(
      mockMutator.exportExpenseClasses,
      expect.arrayContaining(['test-expense-class-id', 'expense-class-2', 'expense-class-3']),
    );
  });
});
