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
      .catch(err => {
        if (cancelled) return;
        setError(err);
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
          <FormattedMessage id="ui-orders.settings.emailTemplates.preview.error" />
          <pre>{error.message}</pre>
        </div>
      )}
      {!loading && !error && (
        <div
          style={{ whiteSpace: 'pre-line' }}
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
