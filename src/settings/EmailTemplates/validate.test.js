import validate from './validate';

const validValues = {
  name: 'Order',
  localizedTemplates: {
    en: {
      header: 'Order {{order.poNumber}}',
      body: '<div>Dear vendor</div>',
    },
  },
};

describe('validate', () => {
  it('should accept a complete template', () => {
    expect(validate(validValues)).toEqual({});
  });

  it('should require the name', () => {
    const errors = validate({ ...validValues, name: '  ' });

    expect(errors.name).toBeDefined();
    expect(errors.localizedTemplates).toBeUndefined();
  });

  it('should require the subject', () => {
    const errors = validate({
      ...validValues,
      localizedTemplates: { en: { ...validValues.localizedTemplates.en, header: '' } },
    });

    expect(errors.localizedTemplates.en.header).toBeDefined();
    expect(errors.localizedTemplates.en.body).toBeUndefined();
  });

  it('should treat a body made of empty tags as missing', () => {
    const errors = validate({
      ...validValues,
      localizedTemplates: { en: { ...validValues.localizedTemplates.en, body: '<div><br></div>' } },
    });

    expect(errors.localizedTemplates.en.body).toBeDefined();
  });

  it('should treat a body made of non-breaking spaces as missing', () => {
    const errors = validate({
      ...validValues,
      localizedTemplates: { en: { ...validValues.localizedTemplates.en, body: '<div>&nbsp;</div>' } },
    });

    expect(errors.localizedTemplates.en.body).toBeDefined();
  });

  it('should cope with a body of null', () => {
    const errors = validate({
      ...validValues,
      localizedTemplates: { en: { ...validValues.localizedTemplates.en, body: null } },
    });

    expect(errors.localizedTemplates.en.body).toBeDefined();
  });

  it('should report every missing field of an empty form', () => {
    const errors = validate({});

    expect(errors.name).toBeDefined();
    expect(errors.localizedTemplates.en.header).toBeDefined();
    expect(errors.localizedTemplates.en.body).toBeDefined();
  });
});
