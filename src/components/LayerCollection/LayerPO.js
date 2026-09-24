import get from 'lodash/get';
import PropTypes from 'prop-types';
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { FormattedMessage } from 'react-intl';

import { LoadingView } from '@folio/stripes/components';
import { stripesConnect } from '@folio/stripes/core';
import {
  ORDER_STATUSES,
  prefixesResource,
  suffixesResource,
  useAddresses,
  useModalToggle,
  useShowCallout,
} from '@folio/stripes-acq-components';

import { SUBMIT_ACTION_FIELD } from '../../common/constants';
import {
  useHandleOrderUpdateError,
  useOrder,
} from '../../common/hooks';
import { SUBMIT_ACTION } from '../PurchaseOrder/constants';
import POForm from '../PurchaseOrder/POForm';
import { UpdateOrderErrorModal } from '../PurchaseOrder/UpdateOrderErrorModal';
import { createOrEditOrderResource } from '../Utils/orderResource';
import {
  ORDER,
  ORDER_NUMBER,
  ORDER_NUMBER_SETTING,
  ORDER_TEMPLATES,
  USERS,
} from '../Utils/resources';

const NEW_ORDER = {
  reEncumber: true,
  workflowStatus: ORDER_STATUSES.pending,
};

function LayerPO({
  history,
  location,
  match: { params: { id } },
  mutator,
  resources,
}) {
  const sendCallout = useShowCallout();
  const [handleErrorResponse] = useHandleOrderUpdateError();

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const memoizedMutator = useMemo(() => mutator, []);

  const [savingValues, setSavingValues] = useState();
  const [isLoading, setIsLoading] = useState(true);
  const [updateOrderError, setUpdateOrderError] = useState();
  const [isErrorsModalOpened, toggleErrorsModal] = useModalToggle();

  const instanceId = location.state?.instanceId;
  const instanceTenantId = location.state?.instanceTenantId;

  const {
    order: fetchedOrder,
    isLoading: isOrderLoading,
    refetch,
  } = useOrder(id);

  const order = id ? fetchedOrder : NEW_ORDER;

  const {
    addresses,
    isLoading: isAddressesLoading,
  } = useAddresses();

  useEffect(() => {
    if (id) {
      setIsLoading(false);
    } else {
      memoizedMutator.orderNumber.reset();
      memoizedMutator.orderNumber.GET()
        .finally(setIsLoading);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const closeErrorModal = useCallback(() => {
    toggleErrorsModal();
    setUpdateOrderError();
  }, [toggleErrorsModal]);

  const openOrderErrorModalShow = useCallback((errors) => {
    toggleErrorsModal();
    setUpdateOrderError(errors);
  }, [toggleErrorsModal]);

  const updatePO = useCallback((values) => {
    setIsLoading(true);

    const { [SUBMIT_ACTION_FIELD]: submitAction, ...data } = values;

    setSavingValues(data);

    return createOrEditOrderResource(data, mutator.order)
      .then((savedOrder) => {
        sendCallout({
          message: <FormattedMessage id="ui-orders.order.save.success" values={{ orderNumber: savedOrder.poNumber }} />,
        });

        return savedOrder;
      })
      .then(async (savedOrder) => {
        setSavingValues(null);

        switch (submitAction) {
          case SUBMIT_ACTION.saveAndKeepEditing:
            await refetch();

            history.push({
              pathname: `/orders/edit/${savedOrder.id}`,
              search: location.search,
            });
            break;
          case SUBMIT_ACTION.saveAndClose:
          default:
            history.push({
              pathname: instanceId ? `/orders/view/${savedOrder.id}/po-line/create` : `/orders/view/${savedOrder.id}`,
              search: location.search,
              state: instanceId ? { instanceId, instanceTenantId } : {},
            });
            break;
        }
      })
      .catch(async e => {
        await handleErrorResponse(e, { openModal: openOrderErrorModalShow });
      })
      .finally(() => setIsLoading(false));
  }, [
    handleErrorResponse,
    history,
    instanceId,
    location.search,
    instanceTenantId,
    mutator.order,
    openOrderErrorModalShow,
    refetch,
    sendCallout,
  ]);

  const onCancel = useCallback(
    () => {
      const ordersPath = id ? `/orders/view/${id}` : '/orders';
      const pathname = instanceId ? `/inventory/view/${instanceId}` : ordersPath;

      history.push({
        pathname,
        search: location.search,
      });
    },
    [history, id, location.search, instanceId],
  );

  if (
    isLoading
    || isOrderLoading
    || !order
    || isAddressesLoading
  ) {
    return (
      <LoadingView
        dismissible
        onClose={onCancel}
      />
    );
  }

  const { poNumber, poNumberPrefix, poNumberSuffix } = order;
  const generatedNumber = get(resources, 'orderNumber.records.0.poNumber');
  const purePONumber = id
    ? poNumber.slice(poNumberPrefix?.length, -poNumberSuffix?.length || undefined)
    : generatedNumber;
  const patchedOrder = {
    ...order,
    poNumber: purePONumber,
  };
  const initialValues = savingValues || patchedOrder; // use entered values in case of error response

  return (
    <>
      <POForm
        addresses={addresses}
        generatedNumber={generatedNumber}
        initialValues={initialValues}
        onCancel={onCancel}
        onSubmit={updatePO}
        parentResources={resources}
        instanceId={instanceId}
      />
      {isErrorsModalOpened && (
        <UpdateOrderErrorModal
          orderNumber={patchedOrder.poNumber}
          errors={updateOrderError}
          cancel={closeErrorModal}
        />
      )}
    </>
  );
}

LayerPO.manifest = Object.freeze({
  order: {
    ...ORDER,
    fetch: false,
  },
  users: {
    ...USERS,
    accumulate: true,
    fetch: false,
  },
  orderNumber: ORDER_NUMBER,
  orderNumberSetting: ORDER_NUMBER_SETTING,
  prefixesSetting: prefixesResource,
  suffixesSetting: suffixesResource,
  orderTemplates: {
    ...ORDER_TEMPLATES,
    shouldRefresh: () => false,
  },
});

LayerPO.propTypes = {
  history: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired,
  match: PropTypes.object.isRequired,
  mutator: PropTypes.object.isRequired,
  resources: PropTypes.object.isRequired,
};

export default stripesConnect(LayerPO);
