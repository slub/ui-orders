import { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import DOMPurify from 'dompurify';

import {
  Button,
  KeyValue,
  Loading,
  Modal,
  ModalFooter,
} from '@folio/stripes/components';
import { useOkapiKy } from '@folio/stripes/core';

import { SAMPLE_PREVIEW_CONTEXT } from './samplePreviewContext';

const EXCERPT_WINDOW = 45;

// How much detail mod-template-engine returns depends on the resolver.
// handlebars, verified against the preview endpoint:
//   ... inline@f691f91:1:17: found: '}}}', expected: '}}'
//   Hallo {{user.name}}} {{order.poNumber}}
//                    ^
// mustache returns the message alone, no position, no caret.
//
// Turn that into { message, excerpt }, excerpt being a short slice of the
// source line with our own caret. Without a caret line it stays null and the
// caller shows the message on its own.
const extractBackendError = async (err) => {
  const fallback = { message: err.message, excerpt: null };

  try {
    const body = await err.response?.text();

    if (!body) return fallback;

    let text;

    try {
      const json = JSON.parse(body);

      text = json.errors?.[0]?.message || json.message || body;
    } catch {
      text = body;
    }

    const lines = text.split(/\r?\n/);
    const message = lines[0].trim() || err.message;

    // Search from the end: the caret closes the diagnostic, a stray one could
    // sit in the quoted source above it. A plain loop, not findLastIndex -
    // this code is headed for a shared library.
    let caretIndex = -1;

    for (let i = lines.length - 1; i > 0; i--) {
      if (/^\s*\^+\s*$/.test(lines[i])) {
        caretIndex = i;
        break;
      }
    }

    if (caretIndex < 1) return { message, excerpt: null };

    // Tabs would shift our caret against the rendered source, so flatten them.
    const sourceLine = lines[caretIndex - 1].replace(/\t/g, ' ');
    const caretCol = Math.min(lines[caretIndex].indexOf('^'), sourceLine.length);
    const start = Math.max(0, caretCol - EXCERPT_WINDOW);
    const end = Math.min(sourceLine.length, caretCol + EXCERPT_WINDOW);
    const prefix = start > 0 ? '…' : '';
    const suffix = end < sourceLine.length ? '…' : '';
    const excerptLine = prefix + sourceLine.slice(start, end) + suffix;
    const caretLine = ' '.repeat(prefix.length + (caretCol - start)) + '^';

    return { message, excerpt: `${excerptLine}\n${caretLine}` };
  } catch {
    return fallback;
  }
};

const BackendPreviewModal = ({ open, bodyTemplate, subjectTemplate, templateResolver, header, onClose }) => {
  const ky = useOkapiKy();
  const kyRef = useRef(ky);

  kyRef.current = ky;

  const [renderedBody, setRenderedBody] = useState('');
  const [renderedSubject, setRenderedSubject] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!open) return undefined;

    let cancelled = false;

    setLoading(true);
    setError(null);

    // MODTEMPENG-135: non-persisted preview, no saved templateId required.
    // The subject carries tokens too, so it goes through the same engine and
    // comes back as data.header.
    //
    // The resolver comes from the record, so the preview uses the engine the
    // real dispatch will use. Records saved before the field existed have none;
    // JSON.stringify drops the undefined key and the backend default applies.
    kyRef.current.post('template-request/preview', {
      json: {
        header: subjectTemplate || '',
        body: bodyTemplate || '',
        templateResolver,
        context: SAMPLE_PREVIEW_CONTEXT,
      },
    })
      .json()
      .then(data => {
        if (cancelled) return;
        setRenderedBody(data?.body || '');
        setRenderedSubject(data?.header || '');
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
  }, [open, bodyTemplate, subjectTemplate, templateResolver]);

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
        <>
          {/* Rendered as text, not markup: the subject is a plain-text mail
              header, and an empty one is worth seeing in a preview. */}
          <KeyValue
            label={<FormattedMessage id="ui-orders.settings.emailTemplates.subject" />}
            value={renderedSubject}
          />
          <div
            // eslint-disable-next-line react/no-danger
            dangerouslySetInnerHTML={{ __html: sanitizedBody }}
          />
        </>
      )}
    </Modal>
  );
};

BackendPreviewModal.propTypes = {
  open: PropTypes.bool.isRequired,
  bodyTemplate: PropTypes.string,
  subjectTemplate: PropTypes.string,
  templateResolver: PropTypes.string,
  header: PropTypes.node.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default BackendPreviewModal;
