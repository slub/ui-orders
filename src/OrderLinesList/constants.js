// Owned by ui-orders, not by @folio/plugin-find-po-line: the plugin's query
// builder turns any unknown query param into `key==value`, and no CQL index
// backs that. The param is therefore kept away from the plugin
// (useOrderLinesList) and translated into its own clause (utils).
export const EXPORTED_FILTER = 'exported';

// PO line field carrying the export date, written by the backend export job.
// Despite the name it covers every transmission method, not just EDIFACT.
export const EXPORT_DATE_INDEX = 'lastEDIExportDate';
