import {
  act,
  render,
  screen,
} from '@folio/jest-config-stripes/testing-library/react';
import userEvent from '@folio/jest-config-stripes/testing-library/user-event';
import { PreviewModal } from '@folio/stripes-template-editor';

import EmailTemplateDetail from './EmailTemplateDetail';
import { SAMPLE_PREVIEW_CONTEXT } from './samplePreviewContext';

jest.mock('@folio/stripes-template-editor', () => ({
  PreviewModal: jest.fn(() => null),
}));

const initialValues = {
  id: 'template-id',
  name: 'Standing orders',
  description: 'Sent for ongoing orders',
  active: true,
  templateResolver: 'handlebars',
  localizedTemplates: {
    en: {
      header: 'Order {{order.poNumber}}',
      body: '<div>Dear <strong>{{organization.name}}</strong></div><script>alert(1)</script>',
    },
  },
};

const renderDetail = (props = {}) => render(
  <EmailTemplateDetail
    initialValues={initialValues}
    {...props}
  />,
);

describe('EmailTemplateDetail', () => {
  beforeEach(() => {
    PreviewModal.mockClear();
  });

  it('should display the general information', () => {
    renderDetail();

    expect(screen.getByText('Standing orders')).toBeInTheDocument();
    expect(screen.getByText('Sent for ongoing orders')).toBeInTheDocument();
    expect(screen.getByText('ui-orders.settings.emailTemplates.active.yes')).toBeInTheDocument();
  });

  it('should display an inactive template as such', () => {
    renderDetail({ initialValues: { ...initialValues, active: false } });

    expect(screen.getByText('ui-orders.settings.emailTemplates.active.no')).toBeInTheDocument();
  });

  it('should display the subject and the body as sanitized HTML', () => {
    renderDetail();

    expect(screen.getByText('Order {{order.poNumber}}')).toBeInTheDocument();
    expect(screen.getByText('{{organization.name}}').tagName).toBe('STRONG');
    expect(document.querySelector('script')).toBeNull();
  });

  it('should render without a template', () => {
    renderDetail({ initialValues: {} });

    expect(screen.getByText('ui-orders.settings.emailTemplates.body')).toBeInTheDocument();
  });

  it('should open the backend-rendered preview of the stored template', async () => {
    renderDetail();

    expect(PreviewModal.mock.lastCall[0].open).toBe(false);

    await userEvent.click(screen.getByRole('button', { name: 'ui-orders.settings.emailTemplates.preview' }));

    expect(PreviewModal.mock.lastCall[0]).toEqual(expect.objectContaining({
      open: true,
      previewRenderer: 'backend',
      previewTemplate: initialValues.localizedTemplates.en.body,
      previewSubject: 'Order {{order.poNumber}}',
      previewTemplateResolver: 'handlebars',
      previewContext: SAMPLE_PREVIEW_CONTEXT,
    }));
  });

  it('should close the preview', async () => {
    renderDetail();

    await userEvent.click(screen.getByRole('button', { name: 'ui-orders.settings.emailTemplates.preview' }));
    act(() => PreviewModal.mock.lastCall[0].onClose());

    expect(PreviewModal.mock.lastCall[0].open).toBe(false);
  });
});
