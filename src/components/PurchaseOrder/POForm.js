import get from 'lodash/get';
import PropTypes from 'prop-types';
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Field } from 'react-final-form';
import {
  FormattedMessage,
  useIntl,
} from 'react-intl';
import { withRouter } from 'react-router-dom';

import stripesForm from '@folio/stripes/final-form';
import { IfPermission } from '@folio/stripes/core';
import {
  Accordion,
  AccordionSet,
  AccordionStatus,
  Button,
  checkScope,
  Col,
  collapseAllSections,
  ExpandAllButton,
  expandAllSections,
  HasCommand,
  Icon,
  IconButton,
  MenuSection,
  Pane,
  PaneFooter,
  PaneMenu,
  Paneset,
  Row,
} from '@folio/stripes/components';
import { EditCustomFieldsRecord } from '@folio/stripes/smart-components';
import {
  CUSTOM_FIELDS_ORDERS_BACKEND_NAME,
  FieldSelectionFinal as FieldSelection,
  handleKeyCommand,
  IfFieldVisible,
} from '@folio/stripes-acq-components';

import {
  ENTITY_TYPE_ORDER,
  PO_CONFIG_NAME_PREFIX,
  PO_FORM_FIELDS,
  SCOPE_CUSTOM_FIELDS_MANAGE,
  SUBMIT_ACTION_FIELD,
} from '../../common/constants';
import { useErrorAccordionStatus } from '../../common/hooks';
import { isOngoing } from '../../common/POFields';
import getOrderNumberSetting from '../../common/utils/getOrderNumberSetting';
import getOrderTemplatesForSelect from '../Utils/getOrderTemplatesForSelect';
import getOrderTemplateValue from '../Utils/getOrderTemplateValue';
import { getFullOrderNumber } from '../Utils/orderResource';
import {
  ACCORDION_ID,
  INITIAL_SECTIONS,
  MAP_FIELD_ACCORDION,
  PO_TEMPLATE_FIELDS_MAP,
  SUBMIT_ACTION,
} from './constants';
import { usePONumberFieldValidator } from './hooks';
import { OngoingInfoForm } from './OngoingOrderInfo';
import { PODetailsForm } from './PODetails';
import { SummaryForm } from './Summary';
import {
  getPrefixOptions,
  getSuffixOptions,
} from './util';

const TEMPLATE_PERSISTED_REGISTERED_FIELDS_SET = new Set([
  PO_FORM_FIELDS.poNumber,
  PO_FORM_FIELDS.template,
  PO_FORM_FIELDS.workflowStatus,
]);

const POForm = ({
  addresses,
  form: {
    batch,
    change,
    getRegisteredFields,
    getState,
  },
  values: formValues,
  generatedNumber,
  handleSubmit,
  pristine,
  submitting,
  history,
  initialValues,
  onCancel,
  parentResources,
  instanceId,
}) => {
  const [template, setTemplate] = useState();
  const [hiddenFields, setHiddenFields] = useState({});

  const accordionStatusRef = useRef();

  const errors = getState()?.errors;
  const errorAccordionStatus = useErrorAccordionStatus({ errors, fieldsMap: MAP_FIELD_ACCORDION });

  const { validate: validateNumber } = usePONumberFieldValidator();

  useEffect(() => {
    if (initialValues.template) {
      const orderTemplate = parentResources?.orderTemplates?.records?.find(
        ({ id }) => id === initialValues.template,
      );

      setTemplate(orderTemplate);
      setHiddenFields((prev) => ({
        ...prev,
        ...(orderTemplate?.hiddenFields || {}),
      }));
    }
  }, []);

  const toggleForceVisibility = useCallback(() => {
    setHiddenFields(prev => (prev ? undefined : template?.hiddenFields || {}));
  }, [template]);

  const onSaveAndKeepEditing = useCallback(() => {
    change(SUBMIT_ACTION_FIELD, SUBMIT_ACTION.saveAndKeepEditing);
    handleSubmit();
  }, [change, handleSubmit]);

  const onSaveAndClose = useCallback(() => {
    change(SUBMIT_ACTION_FIELD, SUBMIT_ACTION.saveAndClose);
    handleSubmit();
  }, [change, handleSubmit]);

  const firstMenu = useMemo(() => {
    return (
      <PaneMenu>
        <FormattedMessage id="ui-orders.buttons.line.close">
          {([title]) => (
            <IconButton
              aria-label={title}
              icon="times"
              id="clickable-close-new-purchase-order-dialog"
              onClick={onCancel}
            />
          )}
        </FormattedMessage>
      </PaneMenu>
    );
  }, [onCancel]);

  const getActionMenu = useCallback(({ onToggle }) => (
    Boolean(template?.hiddenFields) && (
      <MenuSection id="po-form-actions">
        <IfPermission perm="ui-orders.order.showHidden">
          <Button
            id="clickable-show-hidden"
            buttonStyle="dropdownItem"
            data-testid="toggle-fields-visibility"
            onClick={() => {
              toggleForceVisibility();
              onToggle();
            }}
          >
            <Icon size="small" icon={`eye-${hiddenFields ? 'open' : 'closed'}`}>
              <FormattedMessage id={`ui-orders.order.${hiddenFields ? 'showHidden' : 'hideFields'}`} />
            </Icon>
          </Button>
        </IfPermission>
      </MenuSection>
    )
  ), [hiddenFields, template, toggleForceVisibility]);

  const getPaneFooter = useCallback((id, label) => {
    const isSubmitBtnDisabled = pristine || submitting;

    const start = (
      <Row>
        <Col xs>
          <FormattedMessage id="ui-orders.buttons.line.cancel">
            {(btnLabel) => (
              <Button
                id="clickable-close-new-purchase-order-dialog-footer"
                buttonStyle="default mega"
                onClick={onCancel}
              >
                {btnLabel}
              </Button>
            )}
          </FormattedMessage>
        </Col>
      </Row>
    );

    const end = (
      <Row>
        {!instanceId && (
          <Col xs>
            <Button
              buttonStyle="default mega"
              id={`${id}-and-keep-editing`}
              type="submit"
              disabled={isSubmitBtnDisabled}
              onClick={onSaveAndKeepEditing}
            >
              <FormattedMessage id="stripes-components.saveAndKeepEditing" />
            </Button>
          </Col>
        )}

        <Col xs>
          <FormattedMessage id={label}>
            {btnLabel => (
              <Button
                id={id}
                type="submit"
                buttonStyle="primary mega"
                disabled={isSubmitBtnDisabled}
                onClick={onSaveAndClose}
              >
                {btnLabel}
              </Button>
            )}
          </FormattedMessage>
        </Col>
      </Row>
    );

    return (
      <PaneFooter
        renderStart={start}
        renderEnd={end}
      />
    );
  }, [
    instanceId,
    onCancel,
    onSaveAndClose,
    onSaveAndKeepEditing,
    pristine,
    submitting,
  ]);

  const onChangeTemplate = useCallback((value) => {
    change(PO_FORM_FIELDS.template, value);

    const orderTemplates = get(parentResources, 'orderTemplates.records', []);
    const templateRaw = orderTemplates.find(orderTemplate => orderTemplate.id === value);
    const templateValue = getOrderTemplateValue(templateRaw);

    setTemplate(templateValue);
    setHiddenFields(prev => (prev ? (templateValue?.hiddenFields || {}) : undefined));

    if (isOngoing(templateValue.orderType)) {
      change(PO_FORM_FIELDS.ongoing, templateValue.ongoing || {});
    }

    const filterRegisteredFields = (field) => !TEMPLATE_PERSISTED_REGISTERED_FIELDS_SET.has(field);
    const changeRegisteredFields = (field) => {
      const templateField = PO_TEMPLATE_FIELDS_MAP[field] || field;
      const templateFieldValue = get(templateValue, templateField);

      change(field, templateFieldValue);
    };

    setTimeout(() => {
      batch(() => {
        getRegisteredFields()
          .filter(filterRegisteredFields)
          .forEach(changeRegisteredFields);
      });
    });
  }, [batch, change, getRegisteredFields, parentResources]);

  const orderNumber = getFullOrderNumber(initialValues);
  const orderNumberSetting = getOrderNumberSetting(get(parentResources, 'orderNumberSetting.records', {}));
  const orderTemplates = getOrderTemplatesForSelect(parentResources);
  const poLinesLength = get(initialValues, 'poLines', []).length;
  const customFieldsValues = getState().values.customFields;

  const paneTitle = initialValues.id
    ? <FormattedMessage id="ui-orders.order.paneTitle.edit" values={{ orderNumber }} />
    : <FormattedMessage id="ui-orders.paneMenu.createPurchaseOrder" />;

  const buttonLabelId = instanceId ? 'ui-orders.paneMenu.addPOLine' : 'stripes-components.saveAndClose';
  const paneFooter = initialValues.id
    ? getPaneFooter('clickable-update-purchase-order', 'stripes-components.saveAndClose')
    : getPaneFooter('clickable-create-new-purchase-order', buttonLabelId);

  const intl = useIntl();

  const poNumberPrefixInitial = initialValues?.poNumberPrefix ?? '';
  const poNumberSuffixInitial = initialValues?.poNumberSuffix ?? '';

  const prefixesSetting = getPrefixOptions(
    parentResources?.prefixesSetting?.records ?? [],
    poNumberPrefixInitial,
    intl,
  );

  const suffixesSetting = getSuffixOptions(
    parentResources?.suffixesSetting?.records ?? [],
    poNumberSuffixInitial,
    intl,
  );

  const shortcuts = [
    {
      name: 'cancel',
      shortcut: 'esc',
      handler: handleKeyCommand(onCancel),
    },
    {
      name: 'save',
      handler: handleKeyCommand(handleSubmit, { disabled: pristine || submitting }),
    },
    {
      name: 'expandAllSections',
      handler: (e) => expandAllSections(e, accordionStatusRef),
    },
    {
      name: 'collapseAllSections',
      handler: (e) => collapseAllSections(e, accordionStatusRef),
    },
    {
      name: 'search',
      handler: handleKeyCommand(() => history.push('/orders')),
    },
  ];

  if (!initialValues) {
    return (
      <Pane
        defaultWidth="fill"
        firstMenu={firstMenu}
        id="pane-podetails"
        footer={paneFooter}
        onClose={onCancel}
        paneTitle={<FormattedMessage id="ui-orders.order.paneTitle.detailsLoading" />}
      >
        <div style={{ paddingTop: '1rem' }}><Icon icon="spinner-ellipsis" width="100px" /></div>
      </Pane>
    );
  }

  return (
    <HasCommand
      commands={shortcuts}
      isWithinScope={checkScope}
      scope={document.body}
    >
      <Paneset isRoot>
        <Pane
          defaultWidth="100%"
          firstMenu={firstMenu}
          actionMenu={getActionMenu}
          id="pane-poForm"
          footer={paneFooter}
          onClose={onCancel}
          paneTitle={paneTitle}
        >
          <AccordionStatus ref={accordionStatusRef}>
            {({ status }) => (
              <form
                id="form-po"
                data-test-form-page
              >
                <Row>
                  <Col xs={12}>
                    <Row center="xs">
                      <Col xs={12} md={8}>
                        <Row end="xs">
                          <Col xs={12}>
                            <ExpandAllButton />
                          </Col>
                        </Row>
                      </Col>

                      <Col xs={12} md={8}>
                        <Row>
                          <Col xs={4}>
                            <FieldSelection
                              dataOptions={orderTemplates}
                              onChange={onChangeTemplate}
                              labelId="ui-orders.settings.orderTemplates.editor.template.name"
                              name={PO_FORM_FIELDS.template}
                              id="order-template"
                              disabled={Boolean(poLinesLength)}
                            />
                          </Col>
                        </Row>
                      </Col>

                      <Col xs={12} md={8} style={{ textAlign: 'left' }}>
                        <AccordionSet
                          initialStatus={INITIAL_SECTIONS}
                          accordionStatus={{ ...status, ...errorAccordionStatus }}
                        >
                          <Accordion
                            id={ACCORDION_ID.purchaseOrder}
                            label={<FormattedMessage id="ui-orders.paneBlock.purchaseOrder" />}
                          >
                            <PODetailsForm
                              addresses={addresses}
                              change={change}
                              formValues={formValues}
                              generatedNumber={generatedNumber}
                              order={initialValues}
                              orderNumberSetting={orderNumberSetting}
                              prefixesSetting={prefixesSetting}
                              suffixesSetting={suffixesSetting}
                              validateNumber={validateNumber}
                              hiddenFields={hiddenFields}
                            />
                          </Accordion>
                          {isOngoing(formValues.orderType) && (
                            <OngoingInfoForm hiddenFields={hiddenFields} />
                          )}
                          <Accordion
                            id={ACCORDION_ID.poSummary}
                            label={<FormattedMessage id="ui-orders.paneBlock.POSummary" />}
                          >
                            <SummaryForm
                              initialValues={initialValues}
                              hiddenFields={hiddenFields}
                            />
                          </Accordion>

                          <IfFieldVisible visible={!hiddenFields?.customPOFields}>
                            <EditCustomFieldsRecord
                              accordionId="customFieldsPO"
                              backendModuleName={CUSTOM_FIELDS_ORDERS_BACKEND_NAME}
                              changeFinalFormField={change}
                              entityType={ENTITY_TYPE_ORDER}
                              fieldComponent={Field}
                              finalFormCustomFieldsValues={customFieldsValues}
                              configNamePrefix={PO_CONFIG_NAME_PREFIX}
                              scope={SCOPE_CUSTOM_FIELDS_MANAGE}
                            />
                          </IfFieldVisible>
                        </AccordionSet>
                      </Col>
                    </Row>
                  </Col>
                </Row>
              </form>
            )}
          </AccordionStatus>
        </Pane>
      </Paneset>
    </HasCommand>
  );
};

POForm.propTypes = {
  addresses: PropTypes.arrayOf(PropTypes.object).isRequired,
  values: PropTypes.object,
  form: PropTypes.object.isRequired,
  generatedNumber: PropTypes.string.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  history: PropTypes.object.isRequired,
  initialValues: PropTypes.object.isRequired,
  onCancel: PropTypes.func.isRequired,
  pristine: PropTypes.bool.isRequired,
  submitting: PropTypes.bool.isRequired,
  parentResources: PropTypes.object.isRequired,
  instanceId: PropTypes.string,
};

export default withRouter(stripesForm({
  enableReinitialize: true,
  keepDirtyOnReinitialize: true,
  navigationCheck: true,
  subscription: { values: true },
})(POForm));
