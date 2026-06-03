import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';

import {
  KeyValue,
  MessageBanner,
} from '@folio/stripes/components';

import { getApplicableIntegrations } from '../../../components/Utils/toggleAutomaticExport';

const getOrderingConfig = (config) => config?.exportTypeSpecificParameters?.vendorEdiOrdersExportConfig;

const formatConfigLabel = (config) => {
  const orderingConfig = getOrderingConfig(config);
  const name = orderingConfig?.configName;
  const method = orderingConfig?.transmissionMethod;

  return method ? `${name} (${method})` : name;
};

// Read-only hint next to the "Automatic export" checkbox showing which
// integration(s) would pick up this PO line. Reuses getApplicableIntegrations
// so the hint stays consistent with the checkbox value. Only shown while
// automatic export is enabled: with the checkbox off the order is handled
// manually (e.g. placed by phone), so there is nothing to surface.
const AutomaticExportInfo = ({
  acquisitionMethod,
  automaticExport = false,
  integrationConfigs = [],
  vendorAccount,
}) => {
  if (!automaticExport) return null;

  const applicableIntegrations = getApplicableIntegrations({ vendorAccount, acquisitionMethod, integrationConfigs });

  if (applicableIntegrations.length === 0) {
    return (
      <MessageBanner type="warning">
        <FormattedMessage id="ui-orders.poLine.automaticExport.noIntegration" />
      </MessageBanner>
    );
  }

  if (applicableIntegrations.length === 1) {
    return (
      <KeyValue label={<FormattedMessage id="ui-orders.poLine.automaticExport.sentViaLabel" />}>
        {formatConfigLabel(applicableIntegrations[0])}
      </KeyValue>
    );
  }

  // Pipe-separated (not comma) so an integration name containing a comma stays readable.
  const names = applicableIntegrations.map(formatConfigLabel).join(' | ');

  return (
    <KeyValue label={<FormattedMessage id="ui-orders.poLine.automaticExport.sentViaOneOfLabel" />}>
      {names}
      <MessageBanner type="default">
        <FormattedMessage id="ui-orders.poLine.automaticExport.multipleHint" />
      </MessageBanner>
    </KeyValue>
  );
};

AutomaticExportInfo.propTypes = {
  acquisitionMethod: PropTypes.string,
  automaticExport: PropTypes.bool,
  integrationConfigs: PropTypes.arrayOf(PropTypes.object),
  vendorAccount: PropTypes.string,
};

export default AutomaticExportInfo;
