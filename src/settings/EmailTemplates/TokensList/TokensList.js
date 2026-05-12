import PropTypes from 'prop-types';
import { injectIntl } from 'react-intl';

import {
  Col,
  Row,
} from '@folio/stripes/components';
import { TokensSection } from '@folio/stripes-template-editor';

import { TOKEN_SECTIONS, ORDER_LINES_LOOP_TAG } from '../constants';

const TokensList = ({
  tokens,
  onLoopSelect,
  onSectionInit,
  onTokenSelect,
  intl: { formatMessage },
}) => {
  const orderLinesLoopConfig = {
    enabled: true,
    label: formatMessage({ id: 'ui-orders.settings.emailTemplates.tokens.multipleOrderLines' }),
    tag: ORDER_LINES_LOOP_TAG,
    isDisabledLoop: null,
  };

  return (
    <Row data-testid="emailTemplateTokenListWrapper">
      <Col xs={6}>
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
      </Col>
    </Row>
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
