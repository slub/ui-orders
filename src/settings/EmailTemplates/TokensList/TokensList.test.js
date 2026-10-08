import { FormattedMessage } from 'react-intl';

import {
  render,
  screen,
} from '@folio/jest-config-stripes/testing-library/react';
import { TokensSection } from '@folio/stripes-template-editor';

import {
  CONTRIBUTORS_LOOP_TAG,
  FUND_DISTRIBUTION_LOOP_TAG,
  ORDER_EMAIL_TOKENS,
  ORDER_LINES_LOOP_TAG,
  ORDERS_LOOP_TAG,
  PRODUCT_IDS_LOOP_TAG,
  TOKEN_SECTIONS,
} from '../constants';
import TokensList from './TokensList';

jest.mock('@folio/stripes-template-editor', () => ({
  TokensSection: jest.fn(() => null),
}));

const defaultProps = {
  tokens: ORDER_EMAIL_TOKENS,
  onLoopSelect: jest.fn(),
  onSectionInit: jest.fn(),
  onTokenSelect: jest.fn(),
};

const getSectionProps = (section) => TokensSection.mock.calls
  .map(([props]) => props)
  .find((props) => props.section === section);

describe('TokensList', () => {
  beforeEach(() => {
    TokensSection.mockClear();
    render(<TokensList {...defaultProps} />);
  });

  it('should render one section per token group', () => {
    expect(screen.getByTestId('emailTemplateTokenListWrapper')).toBeInTheDocument();
    expect(TokensSection).toHaveBeenCalledTimes(Object.keys(TOKEN_SECTIONS).length);

    Object.values(TOKEN_SECTIONS).forEach((section) => {
      expect(getSectionProps(section)).toEqual(expect.objectContaining({
        tokens: ORDER_EMAIL_TOKENS[section],
        onSectionInit: defaultProps.onSectionInit,
        onTokenSelect: defaultProps.onTokenSelect,
      }));
    });
  });

  it('should offer loops for orders, order lines and their nested lists only', () => {
    const loopTags = {
      [TOKEN_SECTIONS.ORDER]: ORDERS_LOOP_TAG,
      [TOKEN_SECTIONS.ORDER_LINES]: ORDER_LINES_LOOP_TAG,
      [TOKEN_SECTIONS.CONTRIBUTORS]: CONTRIBUTORS_LOOP_TAG,
      [TOKEN_SECTIONS.PRODUCT_IDS]: PRODUCT_IDS_LOOP_TAG,
      [TOKEN_SECTIONS.FUNDS]: FUND_DISTRIBUTION_LOOP_TAG,
    };

    Object.entries(loopTags).forEach(([section, tag]) => {
      expect(getSectionProps(section).loopConfig).toEqual(expect.objectContaining({ enabled: true, tag }));
      expect(getSectionProps(section).onLoopSelect).toBe(defaultProps.onLoopSelect);
    });

    expect(getSectionProps(TOKEN_SECTIONS.GENERAL).loopConfig).toBeUndefined();
    expect(getSectionProps(TOKEN_SECTIONS.ORGANIZATION).loopConfig).toBeUndefined();
  });

  it('should show the tips with a link to the data schema', () => {
    expect(screen.getByText('ui-orders.settings.emailTemplates.tokens.help.title')).toBeInTheDocument();

    // The react-intl mock renders message ids only, so the link is checked on the props.
    const handlebarsTip = FormattedMessage.mock.calls
      .map(([props]) => props)
      .find((props) => props.id === 'ui-orders.settings.emailTemplates.tokens.help.handlebars');

    expect(handlebarsTip.values.schemaLink.props.href).toBe('https://github.com/folio-org/mod-data-export-worker');
  });
});
