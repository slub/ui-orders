import PropTypes from 'prop-types';
import { FormattedMessage, injectIntl } from 'react-intl';

import {
  Col,
  Row,
} from '@folio/stripes/components';
import { TokensSection } from '@folio/stripes-template-editor';

const DOCUMENTATION_URL = 'https://folio-org.atlassian.net/wiki/x/CYD_kg';

const TokensListBase = ({
  loopsHelpId,
  sections,
  tokens,
  onLoopSelect,
  onSectionInit,
  onTokenSelect,
  intl: { formatMessage },
}) => {
  const renderSection = ({ key, headerId, loop }) => (
    <TokensSection
      key={key}
      section={key}
      header={formatMessage({ id: headerId })}
      tokens={tokens[key]}
      loopConfig={loop && {
        enabled: true,
        label: formatMessage({ id: loop.labelId }),
        tag: loop.tag,
        isDisabledLoop: null,
      }}
      onLoopSelect={loop && onLoopSelect}
      onSectionInit={onSectionInit}
      onTokenSelect={onTokenSelect}
    />
  );

  // Two columns, the second one takes the odd section.
  const leftColumnLength = Math.floor(sections.length / 2);

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
                  documentationLink: (
                    <a href={DOCUMENTATION_URL} target="_blank" rel="noopener noreferrer">
                      <FormattedMessage id="ui-orders.settings.emailTemplates.tokens.help.documentationLink" />
                    </a>
                  ),
                }}
              />
            </li>
            <li>
              <FormattedMessage id={loopsHelpId} />
            </li>
            <li>
              <FormattedMessage
                id="ui-orders.settings.emailTemplates.tokens.help.optional"
                values={{ pattern: <code>{'{{#field}}…{{/field}}'}</code> }}
              />
            </li>
            <li>
              <FormattedMessage
                id="ui-orders.settings.emailTemplates.tokens.help.customFields"
                values={{
                  single: <code>{'{{orderLine.customFields.<key>.value}}'}</code>,
                  multi: <code>{'{{#orderLine.customFields.<key>.values}}{{label}}{{/…}}'}</code>,
                }}
              />
            </li>
          </ul>
        </Col>
      </Row>
      <Row data-testid="emailTemplateTokenListWrapper">
        <Col xs={6}>
          {sections.slice(0, leftColumnLength).map(renderSection)}
        </Col>
        <Col xs={6}>
          {sections.slice(leftColumnLength).map(renderSection)}
        </Col>
      </Row>
    </>
  );
};

export const tokenSectionsPropType = PropTypes.arrayOf(PropTypes.shape({
  key: PropTypes.string.isRequired,
  headerId: PropTypes.string.isRequired,
  loop: PropTypes.shape({
    labelId: PropTypes.string.isRequired,
    tag: PropTypes.string.isRequired,
  }),
}));

TokensListBase.propTypes = {
  loopsHelpId: PropTypes.string.isRequired,
  sections: tokenSectionsPropType.isRequired,
  tokens: PropTypes.object.isRequired,
  onLoopSelect: PropTypes.func.isRequired,
  onSectionInit: PropTypes.func.isRequired,
  onTokenSelect: PropTypes.func.isRequired,
  intl: PropTypes.object.isRequired,
};

const TokensList = injectIntl(TokensListBase);

// TemplateEditor instantiates the list itself with the editor's props only,
// so the sections are bound up front.
export const bindTokensList = (sections, loopsHelpId) => {
  const BoundTokensList = (props) => (
    <TokensList
      {...props}
      sections={sections}
      loopsHelpId={loopsHelpId}
    />
  );

  return BoundTokensList;
};

export default TokensList;
