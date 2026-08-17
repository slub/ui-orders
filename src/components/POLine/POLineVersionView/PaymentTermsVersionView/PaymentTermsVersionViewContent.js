import PropTypes from 'prop-types';
import { useMemo } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';

import {
  Card,
  Col,
  Layout,
  NoValue,
  Row,
} from '@folio/stripes/components';
import {
  AmountWithCurrencyField,
  FundDistributionView,
} from '@folio/stripes-acq-components';

import { VersionKeyValue } from '../../../../common/VersionView';

export const PaymentTermsVersionViewContent = ({
  currency,
  fiscalYearsMap,
  paymentTerms = {},
}) => {
  const intl = useIntl();

  const {
    fiscalYearDistributions = [],
    prepaymentTerm,
    startingFiscalYearId,
    totalPrice,
  } = paymentTerms;

  const mclProps = useMemo(() => ({
    visibleColumns: ['name', 'expenseClass', 'value', 'amount'],
  }), []);

  return (
    <>
      <Row start="xs">
        <Col xs={6} lg={3}>
          <VersionKeyValue
            name="paymentTerms.totalPrice"
            label={<FormattedMessage id="ui-orders.poLine.paymentTerms.totalPrice" />}
            value={(
              <AmountWithCurrencyField
                currency={currency}
                amount={totalPrice}
              />
            )}
          />
        </Col>
        <Col xs={6} lg={3}>
          <VersionKeyValue
            name="paymentTerms.prepaymentTerm"
            label={<FormattedMessage id="ui-orders.poLine.paymentTerms.prepaymentTerm" />}
            value={prepaymentTerm ?? <NoValue />}
          />
        </Col>
        <Col xs={6} lg={3}>
          <VersionKeyValue
            name="paymentTerms.startingFiscalYearId"
            label={<FormattedMessage id="ui-orders.poLine.paymentTerms.startingFY" />}
            value={fiscalYearsMap.get(startingFiscalYearId)?.code ?? <NoValue />}
          />
        </Col>
      </Row>

      {fiscalYearDistributions.map((entry, index) => {
        const fyCode = fiscalYearsMap.get(entry.fiscalYearId)?.code || '—';
        const label = intl.formatMessage(
          { id: 'ui-orders.poLine.paymentTerms.FYDistributions.card.label' },
          { code: fyCode, sequenceNumber: index + 1 },
        );

        return (
          <Layout
            className="flex"
            key={entry.fiscalYearId}
          >
            <Card
              headerStart={label}
              roundedBorder
            >
              <FundDistributionView
                currency={currency}
                fundDistributions={entry.fundDistributions}
                mclProps={mclProps}
                name={`paymentTerms.fiscalYearDistributions[${index}].fundDistributions`}
                totalAmount={totalPrice}
              />
            </Card>
          </Layout>
        );
      })}
    </>
  );
};

PaymentTermsVersionViewContent.propTypes = {
  currency: PropTypes.string,
  fiscalYearsMap: PropTypes.instanceOf(Map).isRequired,
  paymentTerms: PropTypes.shape({
    fiscalYearDistributions: PropTypes.arrayOf(PropTypes.shape({
      fiscalYearId: PropTypes.string,
      fundDistributions: PropTypes.arrayOf(PropTypes.object),
    })),
    prepaymentTerm: PropTypes.number,
    startingFiscalYearId: PropTypes.string,
    totalPrice: PropTypes.number,
  }),
};
