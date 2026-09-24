import { ORDERS_API } from '@folio/stripes-acq-components';

export const fetchOrderById = (httpClient) => (orderId, options) => {
  return httpClient.get(`${ORDERS_API}/${orderId}`, options).json();
};
