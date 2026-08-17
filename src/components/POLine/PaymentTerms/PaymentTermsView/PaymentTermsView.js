import PropTypes from 'prop-types';
import { useIntl } from 'react-intl';

import {
  Card,
  Col,
  KeyValue,
  Layout,
  NoValue,
  Row,
} from '@folio/stripes/components';
import {
  AmountWithCurrencyField,
  FundDistributionView,
  IfVisible,
} from '@folio/stripes-acq-components';

const mclProps = {
  visibleColumns: ['name', 'expenseClass', 'value', 'amount'],
};

export const PaymentTermsView = ({
  currency,
  fiscalYearsMap,
  hiddenFields = {},
  paymentTerms = {},
}) => {
  const intl = useIntl();

  const {
    fiscalYearDistributions = [],
    prepaymentTerm,
    startingFiscalYearId,
    totalPrice,
  } = paymentTerms;

  return (
    <>
      <Row start="xs">
        <IfVisible visible={!hiddenFields.totalPrice}>
          <Col xs={6} lg={3}>
            <KeyValue label={intl.formatMessage({ id: 'ui-orders.poLine.paymentTerms.totalPrice' })}>
              <AmountWithCurrencyField
                currency={currency}
                amount={totalPrice}
              />
            </KeyValue>
          </Col>
        </IfVisible>
        <IfVisible visible={!hiddenFields.prepaymentTerm}>
          <Col xs={6} lg={3}>
            <KeyValue
              label={intl.formatMessage({ id: 'ui-orders.poLine.paymentTerms.prepaymentTerm' })}
              value={prepaymentTerm ?? <NoValue />}
            />
          </Col>
        </IfVisible>
        <IfVisible visible={!hiddenFields.startingFiscalYearId}>
          <Col xs={6} lg={3}>
            <KeyValue
              label={intl.formatMessage({ id: 'ui-orders.poLine.paymentTerms.startingFY' })}
              value={fiscalYearsMap.get(startingFiscalYearId)?.code ?? <NoValue />}
            />
          </Col>
        </IfVisible>
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
                totalAmount={totalPrice}
              />
            </Card>
          </Layout>
        );
      })}
    </>
  );
};

PaymentTermsView.propTypes = {
  currency: PropTypes.string,
  fiscalYearsMap: PropTypes.instanceOf(Map).isRequired,
  hiddenFields: PropTypes.object,
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
