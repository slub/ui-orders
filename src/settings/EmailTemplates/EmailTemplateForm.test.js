import { MemoryRouter } from 'react-router-dom';

import {
  render,
  screen,
} from '@folio/jest-config-stripes/testing-library/react';
import userEvent from '@folio/jest-config-stripes/testing-library/user-event';
import { TemplateEditor } from '@folio/stripes-template-editor';

import EmailTemplateForm from './EmailTemplateForm';
import { SAMPLE_PREVIEW_CONTEXT } from './samplePreviewContext';

jest.mock('@folio/stripes-template-editor', () => ({
  TemplateEditor: jest.fn(({ input, label }) => (
    <>
      <label htmlFor="template-editor">{label}</label>
      <textarea
        id="template-editor"
        value={input.value}
        onChange={input.onChange}
      />
    </>
  )),
  TokensSection: jest.fn(() => null),
}));

const newTemplate = {
  active: true,
  outputFormats: ['text/html'],
  templateResolver: 'handlebars',
  scope: 'orders',
};

const existingTemplate = {
  ...newTemplate,
  id: 'template-id',
  name: 'Standing orders',
  description: 'Sent for ongoing orders',
  localizedTemplates: {
    en: {
      header: 'Order {{order.poNumber}}',
      body: '<div>Dear vendor</div>',
    },
  },
};

const onSubmit = jest.fn();
const onCancel = jest.fn();

const renderForm = (initialValues = newTemplate) => render(
  <MemoryRouter>
    <EmailTemplateForm
      initialValues={initialValues}
      onSubmit={onSubmit}
      onCancel={onCancel}
    />
  </MemoryRouter>,
);

const getNameField = () => screen.getByRole('textbox', { name: 'ui-orders.settings.emailTemplates.name' });
const getSubjectField = () => screen.getByRole('textbox', { name: 'ui-orders.settings.emailTemplates.subject' });
const getBodyField = () => screen.getByRole('textbox', { name: 'ui-orders.settings.emailTemplates.body' });
const getSaveButton = () => screen.getByRole('button', { name: 'stripes-components.saveAndClose' });

describe('EmailTemplateForm', () => {
  beforeEach(() => {
    onSubmit.mockClear();
    onCancel.mockClear();
    TemplateEditor.mockClear();
  });

  it('should title the pane for a new template', () => {
    renderForm();

    expect(screen.getByText('ui-orders.settings.emailTemplates.new')).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: 'ui-orders.settings.emailTemplates.active' })).toBeChecked();
  });

  it('should title the pane with the name of an existing template', () => {
    renderForm(existingTemplate);

    expect(screen.getByText('Standing orders')).toBeInTheDocument();
    expect(getSubjectField()).toHaveValue('Order {{order.poNumber}}');
    expect(getBodyField()).toHaveValue('<div>Dear vendor</div>');
  });

  it('should keep the save button disabled until something changes', async () => {
    renderForm(existingTemplate);

    expect(getSaveButton()).toBeDisabled();

    await userEvent.type(getNameField(), ' (vendor)');

    expect(getSaveButton()).toBeEnabled();
  });

  it('should not submit a template without subject and body', async () => {
    renderForm();

    await userEvent.type(getNameField(), 'Monographs');
    await userEvent.click(getSaveButton());

    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getByText('ui-orders.settings.emailTemplates.validation.subjectRequired')).toBeInTheDocument();
  });

  it('should submit the filled form together with the preset values', async () => {
    renderForm();

    await userEvent.type(getNameField(), 'Monographs');
    await userEvent.type(getSubjectField(), 'New order');
    await userEvent.type(getBodyField(), 'Dear vendor');
    await userEvent.click(getSaveButton());

    expect(onSubmit).toHaveBeenCalled();
    expect(onSubmit.mock.calls[0][0]).toEqual({
      ...newTemplate,
      name: 'Monographs',
      localizedTemplates: {
        en: {
          header: 'New order',
          body: 'Dear vendor',
        },
      },
    });
  });

  it('should configure the editor for the backend-rendered preview', async () => {
    renderForm(existingTemplate);

    expect(TemplateEditor.mock.lastCall[0]).toEqual(expect.objectContaining({
      editAsHtml: false,
      previewRenderer: 'backend',
      previewContext: SAMPLE_PREVIEW_CONTEXT,
      previewSubject: 'Order {{order.poNumber}}',
      previewTemplateResolver: 'handlebars',
    }));

    await userEvent.type(getSubjectField(), '!');

    expect(TemplateEditor.mock.lastCall[0].previewSubject).toBe('Order {{order.poNumber}}!');
  });

  it('should send an empty subject to the preview of a new template', () => {
    renderForm();

    expect(TemplateEditor.mock.lastCall[0].previewSubject).toBe('');
  });

  it('should switch the editor to raw HTML', async () => {
    renderForm(existingTemplate);

    await userEvent.click(screen.getByRole('checkbox', { name: 'ui-orders.settings.emailTemplates.editAsHtml' }));

    expect(TemplateEditor.mock.lastCall[0].editAsHtml).toBe(true);
  });

  it('should cancel from the footer button', async () => {
    renderForm(existingTemplate);

    await userEvent.click(screen.getByRole('button', { name: 'stripes-core.button.cancel' }));

    expect(onCancel).toHaveBeenCalled();
  });

  it('should cancel from the close icon of the pane', async () => {
    renderForm(existingTemplate);

    await userEvent.click(screen.getByRole('button', { name: /closeItem/ }));

    expect(onCancel).toHaveBeenCalled();
  });
});
