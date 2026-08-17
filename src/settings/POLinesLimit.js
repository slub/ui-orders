import get from 'lodash/get';
import PropTypes from 'prop-types';
import React, { useCallback } from 'react';
import { useIntl } from 'react-intl';

import { Layout } from '@folio/stripes/components';
import { TitleManager } from '@folio/stripes/core';
import {
  ORDERS_STORAGE_SETTINGS_API,
  useShowCallout,
} from '@folio/stripes-acq-components';

import { CONFIG_LINES_LIMIT } from '../components/Utils/const';
import POLinesLimitForm from './POLinesLimitForm';

const successMessageId = 'ui-orders.settings.setPOLInesLimit.changed';

function POLinesLimit({ label, resources, mutator }) {
  const intl = useIntl();
  const sendCallout = useShowCallout();

  const onChangePOLinesLimitFormSubmit = useCallback(
    values => {
      const { linesLimit } = mutator;

      if (values.id) {
        if (values.value) {
          linesLimit
            .PUT(values)
            .then(() => {
              sendCallout({ messageId: successMessageId });
            });
        } else {
          linesLimit
            .DELETE({ id: values.id })
            .then(() => {
              sendCallout({ messageId: successMessageId });
            });
        }
      } else {
        linesLimit
          .POST({
            key: CONFIG_LINES_LIMIT,
            value: values.value,
          })
          .then(() => {
            sendCallout({ messageId: successMessageId });
          });
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [sendCallout],
  );

  const initialValues = get(resources, ['linesLimit', 'records', 0], {});

  return (
    <TitleManager record={intl.formatMessage({ id: 'ui-orders.settings.polinesLimit' })}>
      <Layout
        data-test-order-settings-lines-limit
        className="full"
      >
        <POLinesLimitForm
          initialValues={initialValues}
          onSubmit={onChangePOLinesLimitFormSubmit}
          paneTitle={label}
        />
      </Layout>
    </TitleManager>
  );
}

POLinesLimit.manifest = Object.freeze({
  linesLimit: {
    type: 'okapi',
    records: 'settings',
    path: ORDERS_STORAGE_SETTINGS_API,
    GET: {
      params: {
        query: `key=="${CONFIG_LINES_LIMIT}"`,
      },
    },
  },
});

POLinesLimit.propTypes = {
  label: PropTypes.node.isRequired,
  mutator: PropTypes.shape({
    linesLimit: PropTypes.shape({
      POST: PropTypes.func.isRequired,
      PUT: PropTypes.func.isRequired,
      DELETE: PropTypes.func.isRequired,
    }),
  }).isRequired,
  resources: PropTypes.shape({
    linesLimit: PropTypes.shape({
      records: PropTypes.arrayOf(PropTypes.object),
    }),
  }),
};

export default POLinesLimit;
