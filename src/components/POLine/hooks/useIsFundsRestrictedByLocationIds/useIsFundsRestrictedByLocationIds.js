import get from 'lodash/get';
import {
  useCallback,
  useMemo,
} from 'react';

import {
  useCentralOrderingContext,
  useInstanceHoldingsQuery,
} from '@folio/stripes-acq-components';

import { getPaymentTermsFundIds } from '../../../../common/utils';
import { useFundsById } from '../useFundsById';

export const useIsFundsRestrictedByLocationIds = (line) => {
  const { isCentralOrderingEnabled } = useCentralOrderingContext();

  const {
    fundIds,
    holdingIds,
    locationIds: locationIdsProp,
  } = useMemo(() => {
    return {
      fundIds: Array.from(new Set([
        ...get(line, 'fundDistribution', []).map(({ fundId }) => fundId).filter(Boolean),
        ...getPaymentTermsFundIds(get(line, 'paymentTerms')),
      ])),
      holdingIds: get(line, 'locations', []).map(({ holdingId }) => holdingId).filter(Boolean),
      locationIds: get(line, 'locations', []).map(({ locationId }) => locationId).filter(Boolean),
    };
  }, [line]);

  const {
    isFetching: isHoldingsFetching,
    holdings,
  } = useInstanceHoldingsQuery(line?.instanceId, {
    consortium: isCentralOrderingEnabled,
    enabled: !!holdingIds.length,
  });

  const locationIdsSet = useMemo(() => {
    const holdingIdsSet = new Set(holdingIds);
    const permanentLocationIds = holdings
      .filter(({ id }) => holdingIdsSet.has(id))
      .map(({ permanentLocationId }) => permanentLocationId);

    return new Set([...locationIdsProp, ...permanentLocationIds]);
  }, [holdingIds, holdings, locationIdsProp]);

  const {
    funds,
    isFetching: isFundsFetching,
  } = useFundsById(fundIds, {
    enabled: !isHoldingsFetching && !!locationIdsSet.size, // to avoid fetching funds when there are no locations
  });

  const locationsRestrictedByFunds = useMemo(() => {
    return funds
      .filter(({ restrictByLocations }) => restrictByLocations)
      .map(({ locations }) => locations.map(({ locationId }) => locationId));
  }, [funds]);

  const isFundNotRestricted = useCallback(() => {
    return locationsRestrictedByFunds.every((locationIds) => {
      return locationIds.some((locationId) => locationIdsSet.has(locationId));
    });
  }, [locationsRestrictedByFunds, locationIdsSet]);

  const hasLocationRestrictedFund = useMemo(() => {
    if (
      !isHoldingsFetching
      && !isFundsFetching
      && locationsRestrictedByFunds.length
      && locationIdsSet.size
    ) {
      return !isFundNotRestricted();
    }

    return false;
  }, [
    isHoldingsFetching,
    isFundNotRestricted,
    isFundsFetching,
    locationsRestrictedByFunds.length,
    locationIdsSet.size,
  ]);

  return ({
    isLoading: isHoldingsFetching || isFundsFetching,
    hasLocationRestrictedFund,
  });
};
