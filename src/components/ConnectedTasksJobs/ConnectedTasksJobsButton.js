import PropTypes from 'prop-types';

import { CONNECTED_RECORD_TYPES } from '../../common/constants';

import { ConnectedTasksJobsPlugin } from './ConnectedTasksJobsPlugin';

export const ConnectedTasksJobsButton = props => {
  return (
    <ConnectedTasksJobsPlugin
      {...props}
      componentType="ConnectedTasksJobsButton"
    />
  );
};

ConnectedTasksJobsButton.propTypes = {
  recordId: PropTypes.string.isRequired,
  recordObject: PropTypes.object,
  recordType: PropTypes.oneOf(Object.values(CONNECTED_RECORD_TYPES)).isRequired,
};

ConnectedTasksJobsButton.defaultProps = {
  recordObject: undefined,
};
