import { get } from 'lodash';
import PropTypes from 'prop-types';

import { stripesConnect } from '@folio/stripes/core';
import {
  DICT_FUNDS,
  fundsManifest,
  useCentralOrderingContext,
} from '@folio/stripes-acq-components';
import { OrderLinesFilters } from '@folio/plugin-find-po-line';

import {
  MATERIAL_TYPES,
} from '../components/Utils/resources';

const OrderLinesFiltersContainer = ({
  resources,
  activeFilters,
  applyFilters,
  customFields = [],
  disabled,
}) => {
  const funds = get(resources, `${DICT_FUNDS}.records`);
  const materialTypes = get(resources, 'materialTypes.records', []);

  const { isCentralOrderingEnabled } = useCentralOrderingContext();

  return (
    <OrderLinesFilters
      funds={funds}
      materialTypes={materialTypes}
      activeFilters={activeFilters}
      applyFilters={applyFilters}
      disabled={disabled}
      crossTenant={isCentralOrderingEnabled}
      customFields={customFields}
    />
  );
};

OrderLinesFiltersContainer.manifest = Object.freeze({
  [DICT_FUNDS]: fundsManifest,
  materialTypes: MATERIAL_TYPES,
});

OrderLinesFiltersContainer.propTypes = {
  activeFilters: PropTypes.object.isRequired,
  applyFilters: PropTypes.func.isRequired,
  customFields: PropTypes.arrayOf(PropTypes.object),
  disabled: PropTypes.bool.isRequired,
  resources: PropTypes.object.isRequired,
};

export default stripesConnect(OrderLinesFiltersContainer);
