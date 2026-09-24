import omit from 'lodash/omit';
import queryString from 'query-string';

export const LIST_IGNORED_QUERY_PARAMS = ['layer'];

export const getQueryParams = (search) => {
  return omit(queryString.parse(search), LIST_IGNORED_QUERY_PARAMS);
};
