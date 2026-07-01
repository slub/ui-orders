import PropTypes from 'prop-types';
import { FormattedMessage, injectIntl } from 'react-intl';

import {
  Col,
  Row,
} from '@folio/stripes/components';
import { TokensSection } from '@folio/stripes-template-editor';

import {
  CONTRIBUTORS_LOOP_TAG,
  FUND_DISTRIBUTION_LOOP_TAG,
  ORDERS_LOOP_TAG,
  ORDER_LINES_LOOP_TAG,
  PRODUCT_IDS_LOOP_TAG,
  TOKEN_SECTIONS,
} from '../constants';

const HANDLEBARS_DOCS_URL = 'https://handlebarsjs.com/guide/expressions.html';
const DATA_SCHEMA_URL = 'https://folio-org.atlassian.net/browse/MODEXPW-635';

const TokensList = ({
  tokens,
  onLoopSelect,
  onSectionInit,
  onTokenSelect,
  intl: { formatMessage },
}) => {
  const makeLoopConfig = (labelId, tag) => ({
    enabled: true,
    label: formatMessage({ id: labelId }),
    tag,
    isDisabledLoop: null,
  });

  const ordersLoopConfig = makeLoopConfig('ui-orders.settings.emailTemplates.tokens.multipleOrders', ORDERS_LOOP_TAG);
  const orderLinesLoopConfig = makeLoopConfig('ui-orders.settings.emailTemplates.tokens.multipleOrderLines', ORDER_LINES_LOOP_TAG);
  const contributorsLoopConfig = makeLoopConfig('ui-orders.settings.emailTemplates.tokens.multipleContributors', CONTRIBUTORS_LOOP_TAG);
  const productIdsLoopConfig = makeLoopConfig('ui-orders.settings.emailTemplates.tokens.multipleProductIds', PRODUCT_IDS_LOOP_TAG);
  const fundsLoopConfig = makeLoopConfig('ui-orders.settings.emailTemplates.tokens.multipleFunds', FUND_DISTRIBUTION_LOOP_TAG);

  return (
    <>
      <Row>
        <Col xs={12}>
          <strong>
            <FormattedMessage id="ui-orders.settings.emailTemplates.tokens.help.title" />
          </strong>
          <ul>
            <li>
              <FormattedMessage
                id="ui-orders.settings.emailTemplates.tokens.help.handlebars"
                values={{
                  handlebarsLink: (
                    <a href={HANDLEBARS_DOCS_URL} target="_blank" rel="noopener noreferrer">Handlebars</a>
                  ),
                  schemaLink: (
                    <a href={DATA_SCHEMA_URL} target="_blank" rel="noopener noreferrer">MODEXPW-635</a>
                  ),
                }}
              />
            </li>
            <li>
              <FormattedMessage
                id="ui-orders.settings.emailTemplates.tokens.help.loops"
                values={{ label: <em>Multiple</em> }}
              />
            </li>
            <li>
              <FormattedMessage
                id="ui-orders.settings.emailTemplates.tokens.help.optional"
                values={{ pattern: <code>{'{{#field}}…{{/field}}'}</code> }}
              />
            </li>
            <li>
              <FormattedMessage
                id="ui-orders.settings.emailTemplates.tokens.help.tripleBraces"
                values={{ pattern: <code>{'{{{order.shipTo.address}}}'}</code> }}
              />
            </li>
            <li>
              <FormattedMessage
                id="ui-orders.settings.emailTemplates.tokens.help.customFields"
                values={{ pattern: <code>{'{{orderLine.customFields.fieldName}}'}</code> }}
              />
            </li>
          </ul>
        </Col>
      </Row>
      <Row data-testid="emailTemplateTokenListWrapper">
        <Col xs={6}>
          <TokensSection
            section={TOKEN_SECTIONS.GENERAL}
            header={formatMessage({ id: 'ui-orders.settings.emailTemplates.tokens.general' })}
            tokens={tokens[TOKEN_SECTIONS.GENERAL]}
            onSectionInit={onSectionInit}
            onTokenSelect={onTokenSelect}
          />
          <TokensSection
            section={TOKEN_SECTIONS.ORGANIZATION}
            header={formatMessage({ id: 'ui-orders.settings.emailTemplates.tokens.organization' })}
            tokens={tokens[TOKEN_SECTIONS.ORGANIZATION]}
            onSectionInit={onSectionInit}
            onTokenSelect={onTokenSelect}
          />
          <TokensSection
            section={TOKEN_SECTIONS.ORDER}
            header={formatMessage({ id: 'ui-orders.settings.emailTemplates.tokens.order' })}
            tokens={tokens[TOKEN_SECTIONS.ORDER]}
            loopConfig={ordersLoopConfig}
            onLoopSelect={onLoopSelect}
            onSectionInit={onSectionInit}
            onTokenSelect={onTokenSelect}
          />
        </Col>
        <Col xs={6}>
          <TokensSection
            section={TOKEN_SECTIONS.ORDER_LINES}
            header={formatMessage({ id: 'ui-orders.settings.emailTemplates.tokens.orderLines' })}
            tokens={tokens[TOKEN_SECTIONS.ORDER_LINES]}
            loopConfig={orderLinesLoopConfig}
            onLoopSelect={onLoopSelect}
            onSectionInit={onSectionInit}
            onTokenSelect={onTokenSelect}
          />
          <TokensSection
            section={TOKEN_SECTIONS.CONTRIBUTORS}
            header={formatMessage({ id: 'ui-orders.settings.emailTemplates.tokens.contributors' })}
            tokens={tokens[TOKEN_SECTIONS.CONTRIBUTORS]}
            loopConfig={contributorsLoopConfig}
            onLoopSelect={onLoopSelect}
            onSectionInit={onSectionInit}
            onTokenSelect={onTokenSelect}
          />
          <TokensSection
            section={TOKEN_SECTIONS.PRODUCT_IDS}
            header={formatMessage({ id: 'ui-orders.settings.emailTemplates.tokens.productIds' })}
            tokens={tokens[TOKEN_SECTIONS.PRODUCT_IDS]}
            loopConfig={productIdsLoopConfig}
            onLoopSelect={onLoopSelect}
            onSectionInit={onSectionInit}
            onTokenSelect={onTokenSelect}
          />
          <TokensSection
            section={TOKEN_SECTIONS.FUNDS}
            header={formatMessage({ id: 'ui-orders.settings.emailTemplates.tokens.funds' })}
            tokens={tokens[TOKEN_SECTIONS.FUNDS]}
            loopConfig={fundsLoopConfig}
            onLoopSelect={onLoopSelect}
            onSectionInit={onSectionInit}
            onTokenSelect={onTokenSelect}
          />
        </Col>
      </Row>
    </>
  );
};

TokensList.propTypes = {
  tokens: PropTypes.object.isRequired,
  onLoopSelect: PropTypes.func.isRequired,
  onSectionInit: PropTypes.func.isRequired,
  onTokenSelect: PropTypes.func.isRequired,
  intl: PropTypes.object.isRequired,
};

export default injectIntl(TokensList);
