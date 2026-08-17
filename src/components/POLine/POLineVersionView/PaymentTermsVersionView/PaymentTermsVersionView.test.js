import {
  render,
  screen,
} from '@folio/jest-config-stripes/testing-library/react';

import { PaymentTermsVersionViewContent } from './PaymentTermsVersionViewContent';
import { PaymentTermsVersionView } from './PaymentTermsVersionView';

jest.mock('./PaymentTermsVersionViewContent', () => ({
  PaymentTermsVersionViewContent: jest.fn(() => 'PaymentTermsVersionViewContent'),
}));

const defaultVersion = {
  cost: { currency: 'USD' },
  paymentTerms: {
    startingFiscalYearId: 'fy1',
    totalPrice: 1000,
    fiscalYearDistributions: [],
  },
  paymentTermsFiscalYears: [],
};

const renderComponent = (version = defaultVersion) => render(
  <PaymentTermsVersionView version={version} />,
);

const getContentProps = () => PaymentTermsVersionViewContent.mock.calls.at(-1)[0];

describe('PaymentTermsVersionView', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render PaymentTermsVersionViewContent', () => {
    renderComponent();

    expect(screen.getByText('PaymentTermsVersionViewContent')).toBeInTheDocument();
  });

  it('should pass currency and paymentTerms from version', () => {
    renderComponent();

    expect(getContentProps().currency).toBe('USD');
    expect(getContentProps().paymentTerms).toBe(defaultVersion.paymentTerms);
  });

  it('should build fiscalYearsMap from version.paymentTermsFiscalYears', () => {
    const fy = { id: 'fy1', code: 'FY2026' };
    const version = { ...defaultVersion, paymentTermsFiscalYears: [fy] };

    renderComponent(version);

    expect(getContentProps().fiscalYearsMap.get('fy1')).toBe(fy);
  });

  it('should pass an empty fiscalYearsMap when paymentTermsFiscalYears is absent', () => {
    const version = { cost: defaultVersion.cost, paymentTerms: defaultVersion.paymentTerms };

    renderComponent(version);

    expect(getContentProps().fiscalYearsMap.size).toBe(0);
  });
});
