// Host accordions that can take custom fields ("Display in accordion" in the custom field settings).
// `value` is stored in the field's `displayInAccordion`; each accordion embeds its own
// custom fields instance with `sectionId={value}` in the view and the edit form.
export const PO_CUSTOM_FIELD_ACCORDIONS = [
  { value: 'purchaseOrder', labelId: 'ui-orders.paneBlock.purchaseOrder' },
  { value: 'poSummary', labelId: 'ui-orders.paneBlock.POSummary' },
];

export const PO_LINE_CUSTOM_FIELD_ACCORDIONS = [
  { value: 'itemDetails', labelId: 'ui-orders.line.accordion.itemDetails' },
  { value: 'lineDetails', labelId: 'ui-orders.line.accordion.details' },
  { value: 'location', labelId: 'ui-orders.line.accordion.location' },
  { value: 'physical', labelId: 'ui-orders.line.accordion.physical' },
];

export const PO_CUSTOM_FIELD_ACCORDION_IDS = PO_CUSTOM_FIELD_ACCORDIONS.map(({ value }) => value);
export const PO_LINE_CUSTOM_FIELD_ACCORDION_IDS = PO_LINE_CUSTOM_FIELD_ACCORDIONS.map(({ value }) => value);
