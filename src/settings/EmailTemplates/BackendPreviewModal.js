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

const BackendPreviewModal = ({ open, templateId, header, onClose }) => {
  const ky = useOkapiKy();
  const kyRef = useRef(ky);

  kyRef.current = ky;

  const [renderedSubject, setRenderedSubject] = useState('');
  const [renderedBody, setRenderedBody] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!open || !templateId) return undefined;

    let cancelled = false;

    setLoading(true);
    setError(null);

    kyRef.current.post('template-request', {
      json: {
        templateId,
        lang: 'en',
        outputFormat: 'text/html',
        context: SAMPLE_PREVIEW_CONTEXT,
      },
    })
      .json()
      .then(data => {
        if (cancelled) return;
        setRenderedSubject(data?.result?.header || '');
        setRenderedBody(data?.result?.body || '');
      })
      .catch(err => {
        if (cancelled) return;
        setError(err);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [open, templateId]);

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
        <>
          {renderedSubject && (
            <h3>{renderedSubject}</h3>
          )}
          {/* eslint-disable-next-line react/no-danger */}
          <div dangerouslySetInnerHTML={{ __html: sanitizedBody }} />
        </>
      )}
    </Modal>
  );
};

BackendPreviewModal.propTypes = {
  open: PropTypes.bool.isRequired,
  templateId: PropTypes.string,
  header: PropTypes.node.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default BackendPreviewModal;
