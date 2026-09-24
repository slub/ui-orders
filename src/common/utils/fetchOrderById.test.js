import { ORDERS_API } from '@folio/stripes-acq-components';

import { fetchOrderById } from './fetchOrderById';

const order = { id: 'orderId' };

const jsonMock = jest.fn(() => Promise.resolve(order));
const httpClient = {
  get: jest.fn(() => ({ json: jsonMock })),
};

describe('fetchOrderById', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch an order by id', async () => {
    const result = await fetchOrderById(httpClient)(order.id);

    expect(httpClient.get).toHaveBeenCalledWith(`${ORDERS_API}/${order.id}`, undefined);
    expect(result).toEqual(order);
  });

  it('should pass provided options to the http client', async () => {
    const options = {
      searchParams: { fiscalYearId: 'fiscalYearId' },
      signal: new AbortController().signal,
    };

    await fetchOrderById(httpClient)(order.id, options);

    expect(httpClient.get).toHaveBeenCalledWith(`${ORDERS_API}/${order.id}`, options);
  });

  it('should propagate an error thrown by the http client', async () => {
    const error = new Error('Not found');

    jsonMock.mockRejectedValueOnce(error);

    await expect(fetchOrderById(httpClient)(order.id)).rejects.toEqual(error);
  });
});
