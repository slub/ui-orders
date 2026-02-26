import { useQuery } from 'react-query';

import { useOkapiKy } from '@folio/stripes/core';

const EMAIL_TEMPLATE_CATEGORY = 'OrderEmail';

export const useOrderEmailTemplates = (options = {}) => {
  const ky = useOkapiKy();

  const { data, ...rest } = useQuery({
    queryKey: ['ui-orders', 'order-email-templates'],
    queryFn: ({ signal }) => {
      const searchParams = {
        query: `cql.allRecords=1 AND category=="${EMAIL_TEMPLATE_CATEGORY}"`,
      };

      return ky.get('templates', { searchParams, signal }).json();
    },
    ...options,
  });

  return {
    orderEmailTemplates: data?.templates || [],
    ...rest,
  };
};
