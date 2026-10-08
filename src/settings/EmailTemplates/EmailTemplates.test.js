import { render } from '@folio/jest-config-stripes/testing-library/react';
import { EntryManager } from '@folio/stripes/smart-components';

// eslint-disable-next-line import/no-named-as-default
import EmailTemplates, { EmailTemplates as EmailTemplatesClass } from './EmailTemplates';
import EmailTemplateDetail from './EmailTemplateDetail';
import EmailTemplateForm from './EmailTemplateForm';

jest.mock('@folio/stripes/core', () => ({
  ...jest.requireActual('@folio/stripes/core'),
  TitleManager: jest.fn(({ children }) => <div>{children}</div>),
  stripesConnect: jest.fn((component) => component),
}));
jest.mock('@folio/stripes/smart-components', () => ({
  ...jest.requireActual('@folio/stripes/smart-components'),
  EntryManager: jest.fn(() => <div>EntryManager</div>),
}));
jest.mock('./EmailTemplateDetail', () => () => null);
jest.mock('./EmailTemplateForm', () => () => null);

const mutator = {
  entries: {
    POST: jest.fn(),
    PUT: jest.fn(),
    DELETE: jest.fn(),
  },
};

const renderEmailTemplates = (records = []) => render(
  <EmailTemplates
    label="Order email templates"
    resources={{ entries: { records } }}
    mutator={mutator}
  />,
);

describe('EmailTemplates', () => {
  beforeEach(() => {
    EntryManager.mockClear();
  });

  it('should load only templates with the orders scope', () => {
    expect(EmailTemplatesClass.manifest.entries.params.query).toBe('cql.allRecords=1 AND scope=="orders"');
  });

  it('should pass the templates sorted by name to EntryManager', () => {
    renderEmailTemplates([{ name: 'Serials' }, { name: 'Books' }]);

    expect(EntryManager.mock.lastCall[0]).toEqual(expect.objectContaining({
      entryList: [{ name: 'Books' }, { name: 'Serials' }],
      detailComponent: EmailTemplateDetail,
      entryFormComponent: EmailTemplateForm,
      parentMutator: mutator,
      paneTitle: 'Order email templates',
      nameKey: 'name',
      enableDetailsActionMenu: true,
    }));
  });

  it('should preset new templates as active Handlebars HTML templates of the orders scope', () => {
    renderEmailTemplates();

    expect(EntryManager.mock.lastCall[0].defaultEntry).toEqual({
      active: true,
      outputFormats: ['text/html'],
      templateResolver: 'handlebars',
      scope: 'orders',
    });
  });

  it('should guard create, edit and delete with the email template permissions', () => {
    renderEmailTemplates();

    expect(EntryManager.mock.lastCall[0].permissions).toEqual({
      put: 'ui-orders.settings.email-templates.edit',
      post: 'ui-orders.settings.email-templates.create',
      delete: 'ui-orders.settings.email-templates.delete',
    });
  });

  it('should cope with resources that have not loaded yet', () => {
    render(
      <EmailTemplates
        label="Order email templates"
        resources={{}}
        mutator={mutator}
      />,
    );

    expect(EntryManager.mock.lastCall[0].entryList).toEqual([]);
  });
});
