import React from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import PropTypes from 'prop-types';

import { Button, MessageBanner, Modal } from '@folio/stripes/components';
import { getAcqMethodLabel } from '@folio/stripes-acq-components';

import { useDeprecatedAcqMethods } from '../../../common/hooks';

const OpenOrderConfirmationModal = ({
  orderNumber,
  orderLines,
  submit,
  cancel,
}) => {
  const intl = useIntl();
  const { deprecatedAcqMethods, isLoading } = useDeprecatedAcqMethods(orderLines);

  const modalLabel = intl.formatMessage(
    { id: 'ui-orders.openOrderModal.title' },
    { orderNumber },
  );

  const deprecatedMethodsList = deprecatedAcqMethods
    .map((method) => {
      const label = getAcqMethodLabel(method, { intl });

      return method.poLineNumbers?.length
        ? `${label} (${method.poLineNumbers.join(', ')})`
        : label;
    })
    .join(', ');

  const footer = (
    <div>
      <Button
        onClick={cancel}
        data-test-open-order-confirmation-modal-cancel
        marginBottom0
      >
        <FormattedMessage id="ui-orders.openOrderModal.cancel" />
      </Button>

      <Button
        buttonStyle="primary"
        data-test-open-order-confirmation-modal-submit
        disabled={isLoading}
        marginBottom0
        onClick={submit}
      >
        <FormattedMessage id="ui-orders.openOrderModal.submit" />
      </Button>
    </div>
  );

  return (
    <Modal
      aria-label={modalLabel}
      label={modalLabel}
      open
      data-test-open-order-confirmation-modal
      footer={footer}
    >
      <div data-test-open-order-confirmation-modal-content>
        {deprecatedAcqMethods.length > 0 && (
          <MessageBanner
            type="warning"
            data-test-open-order-deprecated-acq-method-warning
          >
            <FormattedMessage
              id="ui-orders.openOrderModal.deprecatedAcquisitionMethods"
              values={{
                count: deprecatedAcqMethods.length,
                methods: deprecatedMethodsList,
              }}
            />
          </MessageBanner>
        )}

        <div>
          <FormattedMessage id="ui-orders.openOrderModal.message" />
        </div>
      </div>
    </Modal>
  );
};

OpenOrderConfirmationModal.propTypes = {
  orderNumber: PropTypes.string.isRequired,
  orderLines: PropTypes.arrayOf(PropTypes.object),
  submit: PropTypes.func.isRequired,
  cancel: PropTypes.func.isRequired,
};

export default OpenOrderConfirmationModal;
