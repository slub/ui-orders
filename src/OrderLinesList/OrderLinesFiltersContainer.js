import { get } from 'lodash';
import PropTypes from 'prop-types';
import { useCallback } from 'react';

import { AccordionSet } from '@folio/stripes/components';
import { stripesConnect } from '@folio/stripes/core';
import {
  BooleanFilter,
  DICT_FUNDS,
  fundsManifest,
  useCentralOrderingContext,
} from '@folio/stripes-acq-components';
import { OrderLinesFilters } from '@folio/plugin-find-po-line';

import {
  MATERIAL_TYPES,
} from '../components/Utils/resources';
import { EXPORTED_FILTER } from './constants';

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

  const handleExportedChange = useCallback(
    ({ name, values }) => applyFilters(name, values),
    [applyFilters],
  );

  return (
    <>
      <OrderLinesFilters
        funds={funds}
        materialTypes={materialTypes}
        activeFilters={activeFilters}
        applyFilters={applyFilters}
        disabled={disabled}
        crossTenant={isCentralOrderingEnabled}
        customFields={customFields}
      />
      {/*
        Belongs next to the "Export date" filter, but that list is a fixed
        AccordionSet inside @folio/plugin-find-po-line with no slot to render
        into. Appending keeps it in the same part of the pane instead of
        pushing it above every other filter (UIOR-1497).
      */}
      <AccordionSet>
        <BooleanFilter
          activeFilters={activeFilters[EXPORTED_FILTER]}
          disabled={disabled}
          id={EXPORTED_FILTER}
          labelId="ui-orders.filter.exported"
          name={EXPORTED_FILTER}
          onChange={handleExportedChange}
        />
      </AccordionSet>
    </>
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
