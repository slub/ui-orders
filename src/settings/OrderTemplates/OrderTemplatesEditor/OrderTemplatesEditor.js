import flow from 'lodash/flow';
import get from 'lodash/get';
import PropTypes from 'prop-types';
import {
  useCallback,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Field } from 'react-final-form';
import { FormattedMessage } from 'react-intl';

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
  Layer,
  LoadingPane,
  Pane,
  PaneMenu,
  Row,
} from '@folio/stripes/components';
import stripesForm from '@folio/stripes/final-form';
import { EditCustomFieldsRecord } from '@folio/stripes/smart-components';
import {
  CUSTOM_FIELDS_ORDERS_BACKEND_NAME,
  FieldTags,
  FundDistributionFieldsFinal,
  handleKeyCommand,
  VisibilityControl,
} from '@folio/stripes-acq-components';

import {
  ENTITY_TYPE_ORDER,
  ENTITY_TYPE_PO_LINE,
  PO_CONFIG_NAME_PREFIX,
  PO_FORM_FIELDS,
  PO_LINE_CONFIG_NAME_PREFIX,
  SCOPE_CUSTOM_FIELDS_MANAGE,
  WORKFLOW_STATUS,
} from '../../../common/constants';
import {
  INITIAL_SECTIONS,
  MAP_FIELD_ACCORDION,
  ORDER_TEMPLATES_ACCORDION,
  ORDER_TEMPLATES_ACCORDION_TITLES,
} from '../constants';

import { isOngoing } from '../../../common/POFields';
import {
  isEresource,
  isPhresource,
  isOtherResource,
} from '../../../common/POLFields';
import {
  useErrorAccordionStatus,
  useFundDistributionValidation,
} from '../../../common/hooks';
import {
  omitFieldArraysAsyncErrors,
  withUniqueFieldArrayItemKeys,
} from '../../../common/utils';
import { ItemForm } from '../../../components/POLine/Item';
import { CostForm } from '../../../components/POLine/Cost';
import { OngoingOrderForm } from '../../../components/POLine/OngoingOrder';
import { PaymentTermsFormContainer } from '../../../components/POLine/PaymentTerms';
import TemplateInformationForm from './TemplateInformationForm';
import PurchaseOrderInformationForm from './PurchaseOrderInformationForm';
import { OngoingInfoForm } from '../../../components/PurchaseOrder/OngoingOrderInfo';
import DonorInformationForm from './DonorInformationForm';
import PurchaseOrderNotesForm from './PurchaseOrderNotesForm';
import PurchaseOrderSummaryForm from './PurchaseOrderSummaryForm';
import POLineDetailsForm from './POLineDetailsForm';
import POLineVendorForm from './POLineVendorForm';
import POLineEresourcesForm from './POLineEresourcesForm';
import POLinePhysicalForm from './POLinePhysicalForm';
import POLineOtherResourcesForm from './POLineOtherResourcesForm';
import POLineLocationsForm from './POLineLocationsForm';
import calculateEstimatedPrice from '../../../components/POLine/calculateEstimatedPrice';

import css from './OrderTemplatesEditor.css';

const ORDER = {
  workflowStatus: WORKFLOW_STATUS.pending,
};

const donorsVisibilityControl = <VisibilityControl name="hiddenFields.donorsInformation" detached />;
const notesVisibilityControl = <VisibilityControl name="hiddenFields.poNotes" detached />;
const fundDistributionVisibilityControl = <VisibilityControl name="hiddenFields.fundDistribution" detached />;
const locationsVisibilityControl = <VisibilityControl name="hiddenFields.locations" detached />;
const customPOFieldsVisibilityControl = <VisibilityControl name="hiddenFields.customPOFields" detached />;
const customPOLineFieldsVisibilityControl = <VisibilityControl name="hiddenFields.customPOLineFields" detached />;
const paymentTermsVisibilityControl = <VisibilityControl name="hiddenFields.paymentTerms" detached />;

const OrderTemplatesEditor = ({
  addresses,
  centralOrdering,
  close,
  contributorNameTypes,
  createInventorySetting,
  form: { change, batch, getState },
  handleSubmit,
  identifierTypes,
  initialValues,
  initialVendor,
  isLoading,
  locationIds,
  locations,
  materialTypes,
  orderTemplateCategories,
  prefixesSetting,
  pristine,
  stripes,
  submitting,
  suffixesSetting,
  title,
  values: formValues,
}) => {
  const { validateFundDistributionTotal } = useFundDistributionValidation(formValues);
  const [vendor, setVendor] = useState(initialVendor);

  const accordionStatusRef = useRef();

  const formErrors = getState()?.errors;
  const errors = useMemo(() => omitFieldArraysAsyncErrors(formErrors, ['fundDistribution']), [formErrors]);
  const errorAccordionStatus = useErrorAccordionStatus({ errors, fieldsMap: MAP_FIELD_ACCORDION });

  const changeLocation = useCallback((location, locationFieldName, holdingFieldName, holdingId) => {
    const locationId = holdingId ? undefined : location?.id || location;

    change(locationFieldName, locationId);

    if (holdingFieldName) {
      change(holdingFieldName, holdingId);
    }
  }, [change]);

  const getLastMenu = () => {
    return (
      <PaneMenu>
        <FormattedMessage id="ui-orders.settings.orderTemplates.editor.save">
          {ariaLabel => (
            <Button
              id="save-order-template-button"
              type="submit"
              disabled={pristine || submitting}
              style={{ marginBottom: '0', marginRight: '10px' }}
            >
              {ariaLabel}
            </Button>
          )}
        </FormattedMessage>

      </PaneMenu>
    );
  };

  const {
    cost,
    fundDistribution = [],
    orderFormat,
    orderType,
  } = formValues;

  const estimatedPrice = calculateEstimatedPrice(formValues);
  const currency = cost?.currency || stripes.currency;
  const accounts = vendor?.accounts?.map(({ name, accountNo }) => ({
    label: `${name} (${accountNo})`,
    value: accountNo,
  }));
  const customFieldsValues = getState().values.customFields;

  const shortcuts = [
    {
      name: 'cancel',
      shortcut: 'esc',
      handler: handleKeyCommand(close),
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
  ];

  if (isLoading) {
    return (
      <Layer isOpen>
        <LoadingPane
          defaultWidth="fill"
          dismissible
          onClose={close}
          paneTitle={title}
        />
      </Layer>
    );
  }

  return (
    <Layer
      contentLabel="Order template editor"
      isOpen
    >
      <HasCommand
        commands={shortcuts}
        isWithinScope={checkScope}
        scope={document.body}
      >
        <AccordionStatus ref={accordionStatusRef}>
          {({ status }) => (
            <form
              id="order-template-form"
              onSubmit={handleSubmit}
              className={css.orderTemplatesEditor}
            >
              <Pane
                id="order-settings-order-templates-editor"
                defaultWidth="fill"
                paneTitle={title}
                dismissible
                onClose={close}
                lastMenu={getLastMenu()}
              >
                <Row center="xs">
                  <Col xs={12} md={8}>
                    <Row end="xs">
                      <Col xs={12}>
                        <ExpandAllButton />
                      </Col>
                    </Row>
                  </Col>
                </Row>

                <Row center="xs">
                  <Col xs={12} md={8} style={{ textAlign: 'left' }}>
                    <AccordionSet
                      initialStatus={INITIAL_SECTIONS}
                      accordionStatus={{ ...status, ...errorAccordionStatus }}
                    >
                      <Accordion
                        label={ORDER_TEMPLATES_ACCORDION_TITLES[ORDER_TEMPLATES_ACCORDION.TEMPLATE_INFO]}
                        id={ORDER_TEMPLATES_ACCORDION.TEMPLATE_INFO}
                      >
                        <TemplateInformationForm orderTemplateCategories={orderTemplateCategories} />
                      </Accordion>

                      <Accordion
                        label={ORDER_TEMPLATES_ACCORDION_TITLES[ORDER_TEMPLATES_ACCORDION.PO_INFO]}
                        id={ORDER_TEMPLATES_ACCORDION.PO_INFO}
                      >
                        <PurchaseOrderInformationForm
                          acqUnitIds={initialValues.acqUnitIds || []}
                          prefixesSetting={prefixesSetting}
                          suffixesSetting={suffixesSetting}
                          addresses={addresses}
                          setVendor={setVendor}
                        />
                      </Accordion>

                      {isOngoing(get(formValues, PO_FORM_FIELDS.orderType)) && <OngoingInfoForm />}

                      <Accordion
                        label={ORDER_TEMPLATES_ACCORDION_TITLES[ORDER_TEMPLATES_ACCORDION.PO_NOTES]}
                        id={ORDER_TEMPLATES_ACCORDION.PO_NOTES}
                        displayWhenClosed={notesVisibilityControl}
                        displayWhenOpen={notesVisibilityControl}
                      >
                        <PurchaseOrderNotesForm />
                      </Accordion>

                      <Accordion
                        label={ORDER_TEMPLATES_ACCORDION_TITLES[ORDER_TEMPLATES_ACCORDION.PO_TAGS]}
                        id={ORDER_TEMPLATES_ACCORDION.PO_TAGS}
                      >
                        <Row>
                          <Col xs={3}>
                            <VisibilityControl name="hiddenFields.poTags">
                              <FieldTags
                                change={change}
                                formValues={formValues}
                                name="poTags.tagList"
                              />
                            </VisibilityControl>
                          </Col>
                        </Row>
                      </Accordion>

                      <Accordion
                        label={ORDER_TEMPLATES_ACCORDION_TITLES[ORDER_TEMPLATES_ACCORDION.PO_SUMMARY]}
                        id={ORDER_TEMPLATES_ACCORDION.PO_SUMMARY}
                      >
                        <PurchaseOrderSummaryForm />
                      </Accordion>

                      <Accordion
                        label={ORDER_TEMPLATES_ACCORDION_TITLES[ORDER_TEMPLATES_ACCORDION.POL_ITEM_DETAILS]}
                        id={ORDER_TEMPLATES_ACCORDION.POL_ITEM_DETAILS}
                      >
                        <ItemForm
                          identifierTypes={identifierTypes}
                          contributorNameTypes={contributorNameTypes}
                          order={ORDER}
                          formValues={formValues}
                          change={change}
                          batch={batch}
                          required={false}
                          stripes={stripes}
                        />
                      </Accordion>

                      <Accordion
                        label={ORDER_TEMPLATES_ACCORDION_TITLES[ORDER_TEMPLATES_ACCORDION.POL_DETAILS]}
                        id={ORDER_TEMPLATES_ACCORDION.POL_DETAILS}
                      >
                        <POLineDetailsForm
                          formValues={formValues}
                          createInventorySetting={createInventorySetting}
                        />
                      </Accordion>

                      <Accordion
                        label={ORDER_TEMPLATES_ACCORDION_TITLES[ORDER_TEMPLATES_ACCORDION.POL_DONORS_INFORMATION]}
                        id={ORDER_TEMPLATES_ACCORDION.POL_DONORS_INFORMATION}
                        displayWhenOpen={donorsVisibilityControl}
                        displayWhenClosed={donorsVisibilityControl}
                      >
                        <DonorInformationForm />
                      </Accordion>

                      {isOngoing(orderType) && (
                        <Accordion
                          label={ORDER_TEMPLATES_ACCORDION_TITLES[ORDER_TEMPLATES_ACCORDION.POL_ONGOING_ORDER]}
                          id={ORDER_TEMPLATES_ACCORDION.POL_ONGOING_ORDER}
                        >
                          <OngoingOrderForm />
                        </Accordion>
                      )}

                      <Accordion
                        label={ORDER_TEMPLATES_ACCORDION_TITLES[ORDER_TEMPLATES_ACCORDION.POL_VENDOR]}
                        id={ORDER_TEMPLATES_ACCORDION.POL_VENDOR}
                      >
                        <POLineVendorForm accounts={accounts} />
                      </Accordion>

                      <Accordion
                        label={ORDER_TEMPLATES_ACCORDION_TITLES[ORDER_TEMPLATES_ACCORDION.POL_COST_DETAILS]}
                        id={ORDER_TEMPLATES_ACCORDION.POL_COST_DETAILS}
                      >
                        <CostForm
                          formValues={formValues}
                          order={ORDER}
                          required={false}
                          initialValues={initialValues}
                          change={change}
                        />
                      </Accordion>

                      <Accordion
                        label={ORDER_TEMPLATES_ACCORDION_TITLES[ORDER_TEMPLATES_ACCORDION.POL_FUND_DISTIBUTION]}
                        id={ORDER_TEMPLATES_ACCORDION.POL_FUND_DISTIBUTION}
                        displayWhenClosed={fundDistributionVisibilityControl}
                        displayWhenOpen={fundDistributionVisibilityControl}
                      >
                        <FundDistributionFieldsFinal
                          change={change}
                          currency={currency}
                          fundDistribution={fundDistribution}
                          name="fundDistribution"
                          totalAmount={estimatedPrice}
                          required={false}
                          validateFundDistributionTotal={validateFundDistributionTotal}
                        />
                      </Accordion>

                      {isOngoing(orderType) && (
                        <Accordion
                          label={ORDER_TEMPLATES_ACCORDION_TITLES[ORDER_TEMPLATES_ACCORDION.POL_PAYMENT_TERMS]}
                          id={ORDER_TEMPLATES_ACCORDION.POL_PAYMENT_TERMS}
                          displayWhenClosed={paymentTermsVisibilityControl}
                          displayWhenOpen={paymentTermsVisibilityControl}
                        >
                          <PaymentTermsFormContainer isTemplate />
                        </Accordion>
                      )}

                      <Accordion
                        label={ORDER_TEMPLATES_ACCORDION_TITLES[ORDER_TEMPLATES_ACCORDION.POL_LOCATION]}
                        id={ORDER_TEMPLATES_ACCORDION.POL_LOCATION}
                        displayWhenClosed={locationsVisibilityControl}
                        displayWhenOpen={locationsVisibilityControl}
                      >
                        <POLineLocationsForm
                          centralOrdering={centralOrdering}
                          changeLocation={changeLocation}
                          locationIds={locationIds}
                          locations={locations}
                          formValues={formValues}
                        />
                      </Accordion>

                      {
                        isPhresource(orderFormat) && (
                          <Accordion
                            label={ORDER_TEMPLATES_ACCORDION_TITLES[ORDER_TEMPLATES_ACCORDION.POL_FRESOURCES]}
                            id={ORDER_TEMPLATES_ACCORDION.POL_FRESOURCES}
                          >
                            <POLinePhysicalForm
                              materialTypes={materialTypes}
                              change={change}
                              formValues={formValues}
                            />
                          </Accordion>
                        )
                      }

                      {
                        isEresource(orderFormat) && (
                          <Accordion
                            label={ORDER_TEMPLATES_ACCORDION_TITLES[ORDER_TEMPLATES_ACCORDION.POL_ERESOURCES]}
                            id={ORDER_TEMPLATES_ACCORDION.POL_ERESOURCES}
                          >
                            <POLineEresourcesForm
                              materialTypes={materialTypes}
                              change={change}
                              formValues={formValues}
                            />
                          </Accordion>
                        )
                      }

                      {
                        isOtherResource(orderFormat) && (
                          <Accordion
                            label={ORDER_TEMPLATES_ACCORDION_TITLES[ORDER_TEMPLATES_ACCORDION.POL_OTHER_RESOURCES]}
                            id={ORDER_TEMPLATES_ACCORDION.POL_OTHER_RESOURCES}
                          >
                            <POLineOtherResourcesForm
                              materialTypes={materialTypes}
                              change={change}
                              formValues={formValues}
                            />
                          </Accordion>
                        )
                      }

                      <Accordion
                        label={ORDER_TEMPLATES_ACCORDION_TITLES[ORDER_TEMPLATES_ACCORDION.POL_TAGS]}
                        id={ORDER_TEMPLATES_ACCORDION.POL_TAGS}
                      >
                        <Row>
                          <Col xs={3}>
                            <VisibilityControl name="hiddenFields.polTags">
                              <FieldTags
                                change={change}
                                formValues={formValues}
                                name="polTags.tagList"
                              />
                            </VisibilityControl>
                          </Col>
                        </Row>
                      </Accordion>

                      <EditCustomFieldsRecord
                        accordionId={ORDER_TEMPLATES_ACCORDION.PO_CUSTOM_FIELDS}
                        backendModuleName={CUSTOM_FIELDS_ORDERS_BACKEND_NAME}
                        changeFinalFormField={change}
                        entityType={ENTITY_TYPE_ORDER}
                        fieldComponent={Field}
                        finalFormCustomFieldsValues={customFieldsValues}
                        displayWhenClosed={customPOFieldsVisibilityControl}
                        displayWhenOpen={customPOFieldsVisibilityControl}
                        configNamePrefix={PO_CONFIG_NAME_PREFIX}
                        scope={SCOPE_CUSTOM_FIELDS_MANAGE}
                      />
                      <EditCustomFieldsRecord
                        accordionId={ORDER_TEMPLATES_ACCORDION.POL_CUSTOM_FIELDS}
                        backendModuleName={CUSTOM_FIELDS_ORDERS_BACKEND_NAME}
                        changeFinalFormField={change}
                        entityType={ENTITY_TYPE_PO_LINE}
                        fieldComponent={Field}
                        finalFormCustomFieldsValues={customFieldsValues}
                        displayWhenClosed={customPOLineFieldsVisibilityControl}
                        displayWhenOpen={customPOLineFieldsVisibilityControl}
                        configNamePrefix={PO_LINE_CONFIG_NAME_PREFIX}
                        scope={SCOPE_CUSTOM_FIELDS_MANAGE}
                      />
                    </AccordionSet>
                  </Col>
                </Row>
              </Pane>
            </form>
          )}
        </AccordionStatus>
      </HasCommand>
    </Layer>
  );
};

OrderTemplatesEditor.propTypes = {
  addresses: PropTypes.arrayOf(PropTypes.object),
  centralOrdering: PropTypes.bool,
  close: PropTypes.func.isRequired,
  contributorNameTypes: PropTypes.arrayOf(PropTypes.object),
  createInventorySetting: PropTypes.object,
  form: PropTypes.object.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  identifierTypes: PropTypes.arrayOf(PropTypes.object),
  initialValues: PropTypes.object,
  isLoading: PropTypes.bool,
  locationIds: PropTypes.arrayOf(PropTypes.string),
  locations: PropTypes.arrayOf(PropTypes.object),
  materialTypes: PropTypes.arrayOf(PropTypes.object).isRequired,
  orderTemplateCategories: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string,
    name: PropTypes.string,
  })).isRequired,
  prefixesSetting: PropTypes.arrayOf(PropTypes.object),
  pristine: PropTypes.bool.isRequired,
  stripes: PropTypes.object.isRequired,
  submitting: PropTypes.bool.isRequired,
  suffixesSetting: PropTypes.arrayOf(PropTypes.object),
  title: PropTypes.node,
  values: PropTypes.object.isRequired,
};

export default flow(
  stripesForm({
    destroyOnUnregister: false, // `true` breaks fund distribution section
    enableReinitialize: true,
    keepDirtyOnReinitialize: true,
    navigationCheck: true,
    subscription: { values: true },
    validateOnBlur: true,
  }),
  withUniqueFieldArrayItemKeys,
)(OrderTemplatesEditor);
