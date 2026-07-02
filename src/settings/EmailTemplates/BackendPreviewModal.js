import { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import DOMPurify from 'dompurify';

import {
  Button,
  Loading,
  Modal,
  ModalFooter,
} from '@folio/stripes/components';
import { useOkapiKy } from '@folio/stripes/core';

import { SAMPLE_PREVIEW_CONTEXT } from './samplePreviewContext';

const EXCERPT_WINDOW = 45;

// mod-template-engine returns a diagnostic on a template error: a first
// line with the error type + position (e.g. "... :1:3372: found: '}'"),
// then the whole template on one line, then a caret line pointing at the
// spot. Turn that into { message, excerpt } where excerpt is a short,
// readable slice of the template around the error with our own caret.
// The raw position (a character offset) alone is useless to a human.
const extractBackendError = async (err) => {
  const fallback = { message: err.message, excerpt: null };

  try {
    const body = await err.response?.text();

    if (!body) return fallback;

    let text = body;

    try {
      const json = JSON.parse(body);

      text = json.errors?.[0]?.message || json.message || body;
    } catch {
      text = body;
    }

    const lines = text.split('\n');
    const message = lines[0].trim() || err.message;

    // The caret line is all whitespace followed by a single '^'.
    const caretIndex = lines.findIndex((line) => /^\s*\^\s*$/.test(line));

    if (caretIndex < 1) return { message, excerpt: null };

    const templateLine = lines[caretIndex - 1];
    const caretCol = lines[caretIndex].indexOf('^');
    const start = Math.max(0, caretCol - EXCERPT_WINDOW);
    const end = Math.min(templateLine.length, caretCol + EXCERPT_WINDOW);
    const prefix = start > 0 ? '…' : '';
    const suffix = end < templateLine.length ? '…' : '';
    const excerptLine = prefix + templateLine.slice(start, end) + suffix;
    const caretLine = ' '.repeat(prefix.length + (caretCol - start)) + '^';

    return { message, excerpt: `${excerptLine}\n${caretLine}` };
  } catch {
    return fallback;
  }
};

const BackendPreviewModal = ({ open, bodyTemplate, header, onClose }) => {
  const ky = useOkapiKy();
  const kyRef = useRef(ky);

  kyRef.current = ky;

  const [renderedBody, setRenderedBody] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!open) return undefined;

    let cancelled = false;

    setLoading(true);
    setError(null);

    // MODTEMPENG-135: non-persisted preview - renders the inline body
    // against the sample context, no saved templateId required.
    // Subject/header is omitted: the preview mirrors the editor's
    // single-field (body) preview, like @folio/stripes-template-editor.
    kyRef.current.post('template-request/preview', {
      json: {
        body: bodyTemplate || '',
        context: SAMPLE_PREVIEW_CONTEXT,
      },
    })
      .json()
      .then(data => {
        if (cancelled) return;
        setRenderedBody(data?.body || '');
      })
      .catch(async (err) => {
        if (cancelled) return;

        const detail = await extractBackendError(err);

        if (!cancelled) setError(detail);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [open, bodyTemplate]);

  const footer = (
    <ModalFooter>
      <Button onClick={onClose}>
        <FormattedMessage id="stripes-core.button.close" />
      </Button>
    </ModalFooter>
  );

  const sanitizedBody = DOMPurify.sanitize(renderedBody);

  return (
    <Modal
      open={open}
      label={header}
      onClose={onClose}
      footer={footer}
      dismissible
      size="medium"
    >
      {loading && <Loading size="large" />}
      {error && (
        <div data-testid="preview-error">
          <strong>
            <FormattedMessage id="ui-orders.settings.emailTemplates.preview.error" />
          </strong>
          <pre
            style={{
              overflowX: 'auto',
              marginTop: '0.5rem',
              fontSize: '0.85rem',
              whiteSpace: 'pre',
            }}
          >
            {error.excerpt ? `${error.message}\n\n${error.excerpt}` : error.message}
          </pre>
        </div>
      )}
      {!loading && !error && (
        <div
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: sanitizedBody }}
        />
      )}
    </Modal>
  );
};

BackendPreviewModal.propTypes = {
  open: PropTypes.bool.isRequired,
  bodyTemplate: PropTypes.string,
  header: PropTypes.node.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default BackendPreviewModal;
