import React from 'react';
import PropTypes from 'prop-types';

import {
  Accordion,
  Loading,
} from '@folio/stripes/components';
import {
  FrontendSortingMCL,
  DESC_DIRECTION,
  RESULT_COUNT_INCREMENT,
  useLocalPagination,
  PrevNextPagination,
} from '@folio/stripes-acq-components';

import { ACCORDION_ID } from '../const';
import { useConnectedInvoiceLines } from './useConnectedInvoiceLines';
import {
  COLUMN_INVOICE_DATE,
  COLUMN_MAPPING,
  RESULT_FORMATTER,
  SORTABLE_COLUMNS,
  VISIBLE_COLUMNS,
} from './constants';

export const RelatedInvoiceLines = ({ lineId, label }) => {
  const { isLoading, invoiceLines, totalInvoiceLines } = useConnectedInvoiceLines(lineId);
  const { paginatedData, pagination, setPagination } = useLocalPagination(invoiceLines, RESULT_COUNT_INCREMENT);

  return (
    <Accordion
      label={label}
      id={ACCORDION_ID.relatedInvoiceLines}
    >
      {
        isLoading ? <Loading /> : (
          <FrontendSortingMCL
            columnMapping={COLUMN_MAPPING}
            contentData={paginatedData}
            formatter={RESULT_FORMATTER}
            id="invoiceLines"
            interactive={false}
            sortDirection={DESC_DIRECTION}
            sortedColumn={COLUMN_INVOICE_DATE}
            sorters={SORTABLE_COLUMNS}
            visibleColumns={VISIBLE_COLUMNS}
            columnIdPrefix="invoice-lines"
            hasPagination
          />
        )
      }
      {invoiceLines?.length > 0 && (
        <PrevNextPagination
          {...pagination}
          totalCount={totalInvoiceLines}
          onChange={setPagination}
          disabled={false}
        />
      )}
    </Accordion>
  );
};

RelatedInvoiceLines.propTypes = {
  lineId: PropTypes.string.isRequired,
  label: PropTypes.object,
};
