import flow from 'lodash/flow';
import get from 'lodash/get';
import isEqual from 'lodash/isEqual';
import keyBy from 'lodash/keyBy';

import PropTypes from 'prop-types';
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  Field,
  useFormState,
} from 'react-final-form';
import { FormattedMessage } from 'react-intl';
import { useHistory } from 'react-router-dom';

import {
  CUSTOM_FIELDS_ORDERS_BACKEND_NAME,
  Donors,
  FundDistributionFieldsFinal,
  handleKeyCommand,
  IfFieldVisible,
  selectOptionsShape,
  useInstanceHoldingsQuery,
} from '@folio/stripes-acq-components';
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
  KeyValue,
  LoadingPane,
  MenuSection,
  Pane,
  PaneFooter,
  PaneMenu,
  Paneset,
  Row,
} from '@folio/stripes/components';
import {
  stripesShape,
  IfPermission,
} from '@folio/stripes/core';
import stripesForm from '@folio/stripes/final-form';
import {
  EditCustomFieldsRecord,
  ViewMetaData,
} from '@folio/stripes/smart-components';

import { AccordionInfoPopover } from '../../common';
import {
  ENTITY_TYPE_PO_LINE,
  PO_LINE_CONFIG_NAME_PREFIX,
  POL_FORM_FIELDS,
  SCOPE_CUSTOM_FIELDS_MANAGE,
  SUBMIT_ACTION_FIELD,
} from '../../common/constants';
import {
  useErrorAccordionStatus,
  useFundDistributionValidation,
} from '../../common/hooks';
import {
  isEresource,
  isPhresource,
  isOtherResource,
} from '../../common/POLFields';
import { isOngoing } from '../../common/POFields';
import {
  filterFundsRestrictedByLocations,
  filterHoldingsByRestrictedFunds,
  filterLocationsByRestrictedFunds,
  omitFieldArraysAsyncErrors,
  withUniqueFieldArrayItemKeys,
} from '../../common/utils';
import { ifDisabledToChangePaymentInfo } from '../PurchaseOrder/util';
import { getOrderTemplateLabel } from '../Utils/getOrderTemplatesForSelect';
import calculateEstimatedPrice from './calculateEstimatedPrice';
import {
  ACCORDION_ID,
  INITIAL_SECTIONS,
  MAP_FIELD_ACCORDION,
  SUBMIT_ACTION,
} from './const';
import { CostForm } from './Cost';
import { EresourcesForm } from './Eresources';
import {
  useExpenseClassChange,
  useManageDonorOrganizationIds,
} from './hooks';
import { ItemForm } from './Item';
import LocationForm from './Location/LocationForm';
import { OngoingOrderForm } from './OngoingOrder';
import { OtherForm } from './Other';
import { PaymentTermsFormContainer } from './PaymentTerms';
import { PhysicalForm } from './Physical';
import { POLineDetailsForm } from './POLineDetails';
import { VendorForm } from './Vendor';

const defaultProps = {
  integrationConfigs: [],
  isCreateFromInstance: false,
  vendor: {},
};

function POLineForm({
  centralOrdering,
  contributorNameTypeOptions,
  createInventorySetting,
  enableSaveBtn,
  form,
  form: { change, batch },
  funds: fundsRecords,
  handleSubmit,
  identifierTypeOptions,
  initialValues,
  integrationConfigs = defaultProps.integrationConfigs,
  isCreateFromInstance = defaultProps.isCreateFromInstance,
  isSaveAndOpenButtonVisible,
  linesLimit,
  locations,
  materialTypeOptions,
  onCancel,
  order,
  pristine,
  stripes,
  submitting,
  templateValue,
  values: formValues,
  vendor = defaultProps.vendor,
}) {
  const history = useHistory();

  const { errors: formErrors } = useFormState();

  const [hiddenFields, setHiddenFields] = useState({});
  const { validateFundDistributionTotal } = useFundDistributionValidation(formValues);

  const accordionStatusRef = useRef();

  const lineId = get(initialValues, 'id');
  const initialDonorOrganizationIds = get(initialValues, POL_FORM_FIELDS.donorOrganizationIds, []);
  const fundDistribution = get(formValues, POL_FORM_FIELDS.fundDistribution, []);
  const lineLocations = get(formValues, POL_FORM_FIELDS.locations, []);
  const instanceId = formValues.instanceId;
  const isOrderOngoing = isOngoing(order.orderType);
  const isMultiYearPaymentActive = Boolean(formValues.multiYearPayment);

  const fundsMap = useMemo(() => keyBy(fundsRecords, 'id'), [fundsRecords]);

  const {
    donorOrganizationIds,
    onDonorRemove,
    setDonorIds,
  } = useManageDonorOrganizationIds({
    funds: fundsRecords,
    fundDistribution,
    initialDonorOrganizationIds,
  });

  const {
    isLoading: isExpenseClassProcessing,
    renderModal: renderExpenseClassConfirmModal,
    onExpenseClassChange,
  } = useExpenseClassChange(lineId);

  const {
    holdings: instanceHoldings,
    isLoading: isHoldingsLoading,
  } = useInstanceHoldingsQuery(instanceId, { consortium: centralOrdering });

  const shouldUpdateDonorOrganizationIds = useMemo(() => {
    const hasChanged = !isEqual(donorOrganizationIds, formValues?.donorOrganizationIds);
    const isFundDistributionChanged = !isEqual(fundDistribution, initialValues?.fundDistribution);

    return hasChanged && isFundDistributionChanged;
  }, [
    donorOrganizationIds,
    formValues?.donorOrganizationIds,
    fundDistribution,
    initialValues?.fundDistribution,
  ]);

  useEffect(() => {
    if (shouldUpdateDonorOrganizationIds) {
      change(POL_FORM_FIELDS.donorOrganizationIds, donorOrganizationIds);
    }
  }, [change, donorOrganizationIds, shouldUpdateDonorOrganizationIds]);

  useEffect(() => {
    setHiddenFields(templateValue?.hiddenFields || {});
  }, [templateValue?.hiddenFields]);

  const getAddFirstMenu = () => {
    return (
      <PaneMenu>
        <FormattedMessage id="ui-orders.buttons.line.close">
          {([title]) => (
            <IconButton
              ariaLabel={title}
              icon="times"
              id="clickable-close-new-line-dialog"
              onClick={onCancel}
            />
          )}
        </FormattedMessage>
      </PaneMenu>
    );
  };

  const toggleForceVisibility = () => {
    setHiddenFields(prevHiddenFields => (
      prevHiddenFields
        ? undefined
        : (templateValue?.hiddenFields || {})
    ));
  };

  // eslint-disable-next-line react/prop-types
  const getActionMenu = ({ onToggle }) => (
    Boolean(templateValue?.hiddenFields) && (
      <MenuSection id="po-line-form-actions">
        <IfPermission perm="ui-orders.order.showHidden">
          <Button
            id="clickable-show-hidden"
            data-testid="toggle-fields-visibility"
            buttonStyle="dropdownItem"
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
  );

  const onSaveAndClose = useCallback(() => {
    change(SUBMIT_ACTION_FIELD, SUBMIT_ACTION.saveAndClose);
    handleSubmit();
  }, [change, handleSubmit]);

  const onSaveAndCreateAnother = useCallback(() => {
    change(SUBMIT_ACTION_FIELD, SUBMIT_ACTION.saveAndCreateAnother);
    handleSubmit();
  }, [change, handleSubmit]);

  const onSaveAndOpen = useCallback(() => {
    change(SUBMIT_ACTION_FIELD, SUBMIT_ACTION.saveAndOpen);
    handleSubmit();
  }, [change, handleSubmit]);

  const onSaveAndKeepEditing = useCallback(() => {
    change(SUBMIT_ACTION_FIELD, SUBMIT_ACTION.saveAndKeepEditing);
    handleSubmit();
  }, [change, handleSubmit]);

  const getPaneFooter = () => {
    const isSubmitBtnDisabled = !enableSaveBtn && (
      (pristine && (!templateValue?.id || lineId)) // A user could use an ultimate template with no changes required to save a new PO Line
      || submitting
      || isExpenseClassProcessing
    );

    const start = (
      <Row>
        <Col xs>
          <Button
            id="clickable-close-new-line-dialog-footer"
            buttonStyle="default mega"
            onClick={onCancel}
          >
            <FormattedMessage id="ui-orders.buttons.line.cancel" />
          </Button>
        </Col>
      </Row>
    );

    const end = (
      <Row>
        <Col xs>
          <Button
            buttonStyle="default mega"
            id="clickable-save-and-keep-editing"
            type="submit"
            disabled={isSubmitBtnDisabled}
            onClick={onSaveAndKeepEditing}
          >
            <FormattedMessage id="stripes-components.saveAndKeepEditing" />
          </Button>
        </Col>

        {!isCreateFromInstance && !lineId && (linesLimit > 1) && (
          <Col xs>
            <Button
              buttonStyle="default mega"
              id="clickable-save-and-create-another"
              type="submit"
              disabled={isSubmitBtnDisabled}
              onClick={onSaveAndCreateAnother}
            >
              <FormattedMessage id="ui-orders.buttons.line.saveAndCreateAnother" />
            </Button>
          </Col>
        )}

        <Col xs>
          <Button
            data-test-button-save
            id="clickable-updatePoLine"
            type="submit"
            buttonStyle={isSaveAndOpenButtonVisible ? 'default mega' : 'primary mega'}
            disabled={isSubmitBtnDisabled}
            onClick={onSaveAndClose}
          >
            <FormattedMessage id="stripes-components.saveAndClose" />
          </Button>
        </Col>

        {isSaveAndOpenButtonVisible && (
          <Col xs>
            <Button
              data-test-button-save-and-open
              data-testid="button-save-and-open"
              type="submit"
              buttonStyle="primary mega"
              disabled={submitting}
              onClick={onSaveAndOpen}
            >
              <FormattedMessage id="ui-orders.buttons.line.saveAndOpen" />
            </Button>
          </Col>
        )}
      </Row>
    );

    return (
      <PaneFooter
        renderStart={start}
        renderEnd={end}
      />
    );
  };

  const errors = useMemo(() => (
    omitFieldArraysAsyncErrors(formErrors, [
      POL_FORM_FIELDS.fundDistribution,
      `${POL_FORM_FIELDS.paymentTerms}.fiscalYearDistributions`,
    ])
  ), [formErrors]);
  const errorAccordionStatus = useErrorAccordionStatus({ errors, fieldsMap: MAP_FIELD_ACCORDION });

  const accordionsInitialStatus = useMemo(() => ({
    ...INITIAL_SECTIONS,
    [ACCORDION_ID.paymentTerms]: isMultiYearPaymentActive,
  }), [isMultiYearPaymentActive]);

  const lineNumber = get(initialValues, 'poLineNumber', '');
  const firstMenu = getAddFirstMenu();
  const paneTitle = lineId
    ? <FormattedMessage id="ui-orders.line.paneTitle.edit" values={{ lineNumber }} />
    : <FormattedMessage id="ui-orders.line.paneTitle.new" />;
  const paneFooter = getPaneFooter();

  const changeLocation = (location, locationFieldName, holdingFieldName, holdingId) => {
    const locationId = holdingId ? undefined : location?.id || location;

    change(locationFieldName, locationId);

    if (holdingFieldName) {
      change(holdingFieldName, holdingId);
    }
  };

  const instanceHoldingsMap = useMemo(() => {
    return keyBy(instanceHoldings, 'id');
  }, [instanceHoldings]);

  /*
    Location IDs used in funds validation (location restriction).
  */
  const locationIdsForFunds = useMemo(() => {
    return [
      ...new Set(lineLocations.reduce((acc, { holdingId, locationId }) => {
        const value = holdingId
          ? instanceHoldingsMap[holdingId]?.permanentLocationId
          : locationId;

        if (value) acc.push(value);

        return acc;
      }, [])),
    ];
  }, [instanceHoldingsMap, lineLocations]);

  const lineFunds = useMemo(() => {
    const lineFundsMap = (fundDistribution || []).reduce((acc, { fundId }) => {
      const fund = fundsMap[fundId];

      if (fund) acc[fundId] = fund;

      return acc;
    }, {});

    return Object.values(lineFundsMap);
  }, [fundDistribution, fundsMap]);

  const filterFunds = useCallback((funds) => {
    return filterFundsRestrictedByLocations(locationIdsForFunds, funds);
  }, [locationIdsForFunds]);

  const filterLocations = useCallback((records, includeIds) => {
    return filterLocationsByRestrictedFunds(lineFunds, records, includeIds);
  }, [lineFunds]);

  const filterHoldings = useCallback((records, includeIds) => {
    return filterHoldingsByRestrictedFunds(lineFunds, records, includeIds);
  }, [lineFunds]);

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
      handler: handleKeyCommand(() => history.push('/orders/lines')),
    },
  ];

  const isLoading = !initialValues;

  if (isLoading) {
    return (
      <LoadingPane
        defaultWidth="fill"
        onClose={onCancel}
      />
    );
  }

  const orderFormat = get(formValues, POL_FORM_FIELDS.orderFormat);
  const showEresources = isEresource(orderFormat);
  const showPhresources = isPhresource(orderFormat);
  const showOther = isOtherResource(orderFormat);
  const locationIds = locations?.map(({ id }) => id);
  const isDisabledToChangePaymentInfo = ifDisabledToChangePaymentInfo(order);
  const estimatedPrice = calculateEstimatedPrice(formValues);
  const { accounts } = vendor;
  const metadata = get(initialValues, 'metadata');
  const currency = get(formValues, 'cost.currency');
  const customFieldsValues = form.getState().values.customFields;

  return (
    <HasCommand
      commands={shortcuts}
      isWithinScope={checkScope}
      scope={document.body}
    >
      <Paneset isRoot>
        <Pane
          id="pane-poLineForm"
          data-test-line-edit
          defaultWidth="fill"
          paneTitle={paneTitle}
          footer={paneFooter}
          onClose={onCancel}
          firstMenu={firstMenu}
          actionMenu={getActionMenu}
        >
          <AccordionStatus ref={accordionStatusRef}>
            {({ status }) => (
              <form id="form-po-line" style={{ height: '100vh' }}>
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

                      <Col
                        xs={12}
                        md={8}
                        style={{ textAlign: 'left' }}
                      >
                        <KeyValue
                          label={<FormattedMessage id="ui-orders.settings.orderTemplates.editor.template.name" />}
                          value={getOrderTemplateLabel(templateValue)}
                        />

                        <AccordionSet
                          initialStatus={accordionsInitialStatus}
                          accordionStatus={{ ...status, ...errorAccordionStatus }}
                        >
                          <Accordion
                            label={<FormattedMessage id="ui-orders.line.accordion.itemDetails" />}
                            id={ACCORDION_ID.itemDetails}
                          >
                            {metadata && <ViewMetaData metadata={metadata} />}

                            <ItemForm
                              formValues={formValues}
                              order={order}
                              contributorNameTypes={contributorNameTypeOptions}
                              change={change}
                              batch={batch}
                              identifierTypes={identifierTypeOptions}
                              initialValues={initialValues}
                              stripes={stripes}
                              hiddenFields={hiddenFields}
                              isCreateFromInstance={isCreateFromInstance}
                              lineId={lineId}
                            />
                          </Accordion>
                          <Accordion
                            label={<FormattedMessage id="ui-orders.line.accordion.details" />}
                            id={ACCORDION_ID.lineDetails}
                          >
                            <POLineDetailsForm
                              batch={batch}
                              change={change}
                              createInventorySetting={createInventorySetting}
                              formValues={formValues}
                              initialValues={initialValues}
                              order={order}
                              vendor={vendor}
                              hiddenFields={hiddenFields}
                              integrationConfigs={integrationConfigs}
                            />
                          </Accordion>
                          <IfFieldVisible
                            name="donorOrganizationIds"
                            visible={!hiddenFields?.donorsInformation}
                          >
                            <Accordion
                              id={ACCORDION_ID.donorsInformation}
                              label={<FormattedMessage id="ui-orders.line.accordion.donorInformation" />}
                            >
                              <Donors
                                name="donorOrganizationIds"
                                onChange={setDonorIds}
                                onRemove={onDonorRemove}
                                donorOrganizationIds={donorOrganizationIds}
                              />
                            </Accordion>
                          </IfFieldVisible>
                          {isOrderOngoing && (
                            <Accordion
                              label={<FormattedMessage id="ui-orders.line.accordion.ongoingOrder" />}
                              id={ACCORDION_ID.ongoingOrder}
                            >
                              <OngoingOrderForm
                                hiddenFields={hiddenFields}
                                order={order}
                              />
                            </Accordion>
                          )}
                          <Accordion
                            label={<FormattedMessage id="ui-orders.line.accordion.vendor" />}
                            id={ACCORDION_ID.vendor}
                          >
                            <VendorForm
                              accounts={accounts}
                              order={order}
                              hiddenFields={hiddenFields}
                              integrationConfigs={integrationConfigs}
                            />
                          </Accordion>
                          <Accordion
                            label={<FormattedMessage id="ui-orders.line.accordion.cost" />}
                            id={ACCORDION_ID.costDetails}
                          >
                            <CostForm
                              formValues={formValues}
                              order={order}
                              initialValues={initialValues}
                              change={change}
                              hiddenFields={hiddenFields}
                            />
                          </Accordion>

                          <IfFieldVisible
                            visible={!hiddenFields?.fundDistribution}
                            name="fundDistribution"
                          >
                            <Accordion
                              label={<FormattedMessage id="ui-orders.line.accordion.fund" />}
                              id={ACCORDION_ID.fundDistribution}
                            >
                              <FundDistributionFieldsFinal
                                change={change}
                                currency={currency}
                                disabled={isDisabledToChangePaymentInfo}
                                filterFunds={filterFunds}
                                fundDistribution={fundDistribution}
                                name="fundDistribution"
                                onExpenseClassChange={onExpenseClassChange}
                                totalAmount={estimatedPrice}
                                validateFundDistributionTotal={validateFundDistributionTotal}
                              />
                            </Accordion>
                          </IfFieldVisible>

                          {isOrderOngoing && (
                            <IfFieldVisible
                              visible={!hiddenFields?.paymentTerms}
                              name={POL_FORM_FIELDS.paymentTerms}
                            >
                              <Accordion
                                label={(
                                  <>
                                    <FormattedMessage id="ui-orders.line.accordion.paymentTerms" />
                                    <AccordionInfoPopover content={<FormattedMessage id="ui-orders.line.accordion.paymentTerms.infoPopover" />} />
                                  </>
                                )}
                                id={ACCORDION_ID.paymentTerms}
                              >
                                <PaymentTermsFormContainer
                                  filterFunds={filterFunds}
                                  order={order}
                                />
                              </Accordion>
                            </IfFieldVisible>
                          )}

                          <IfFieldVisible
                            visible={!hiddenFields?.locations}
                            name="locations"
                          >
                            <Accordion
                              label={<FormattedMessage id="ui-orders.line.accordion.location" />}
                              id={ACCORDION_ID.location}
                            >
                              <LocationForm
                                isLoading={isHoldingsLoading}
                                centralOrdering={centralOrdering}
                                changeLocation={changeLocation}
                                formValues={formValues}
                                filterHoldings={filterHoldings}
                                filterLocations={filterLocations}
                                locationIds={locationIds}
                                locations={locations}
                                order={order}
                              />
                            </Accordion>
                          </IfFieldVisible>

                          {showPhresources && (
                            <Accordion
                              label={<FormattedMessage id="ui-orders.line.accordion.physical" />}
                              id={ACCORDION_ID.physical}
                            >
                              <PhysicalForm
                                materialTypes={materialTypeOptions}
                                order={order}
                                formValues={formValues}
                                change={change}
                                hiddenFields={hiddenFields}
                              />
                            </Accordion>
                          )}
                          {showEresources && (
                            <Accordion
                              label={<FormattedMessage id="ui-orders.line.accordion.eresource" />}
                              id={ACCORDION_ID.eresources}
                            >
                              <EresourcesForm
                                materialTypes={materialTypeOptions}
                                order={order}
                                formValues={formValues}
                                change={change}
                                hiddenFields={hiddenFields}
                              />
                            </Accordion>
                          )}
                          {showOther && (
                            <Accordion
                              label={<FormattedMessage id="ui-orders.line.accordion.other" />}
                              id={ACCORDION_ID.other}
                            >
                              <OtherForm
                                materialTypes={materialTypeOptions}
                                order={order}
                                formValues={formValues}
                                change={change}
                                hiddenFields={hiddenFields}
                              />
                            </Accordion>
                          )}

                          <IfFieldVisible visible={!hiddenFields?.customPOLineFields}>
                            <EditCustomFieldsRecord
                              accordionId="customFieldsPOLine"
                              backendModuleName={CUSTOM_FIELDS_ORDERS_BACKEND_NAME}
                              changeFinalFormField={change}
                              entityType={ENTITY_TYPE_PO_LINE}
                              fieldComponent={Field}
                              finalFormCustomFieldsValues={customFieldsValues}
                              configNamePrefix={PO_LINE_CONFIG_NAME_PREFIX}
                              scope={SCOPE_CUSTOM_FIELDS_MANAGE}
                            />
                          </IfFieldVisible>
                        </AccordionSet>
                      </Col>
                    </Row>
                  </Col>
                </Row>

                {renderExpenseClassConfirmModal()}
              </form>
            )}
          </AccordionStatus>
        </Pane>
      </Paneset>
    </HasCommand>
  );
}

POLineForm.propTypes = {
  centralOrdering: PropTypes.bool,
  contributorNameTypeOptions: selectOptionsShape.isRequired,
  createInventorySetting: PropTypes.shape({
    eresource: PropTypes.string,
    physical: PropTypes.string,
    other: PropTypes.string,
  }).isRequired,
  enableSaveBtn: PropTypes.bool,
  form: PropTypes.object.isRequired,
  funds: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
  })),
  handleSubmit: PropTypes.func.isRequired,
  identifierTypeOptions: selectOptionsShape,
  initialValues: PropTypes.object,
  integrationConfigs: PropTypes.arrayOf(PropTypes.object),
  isCreateFromInstance: PropTypes.bool,
  isSaveAndOpenButtonVisible: PropTypes.bool,
  linesLimit: PropTypes.number.isRequired,
  locations: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    code: PropTypes.string.isRequired,
    institutionId: PropTypes.string.isRequired,
    campusId: PropTypes.string.isRequired,
    libraryId: PropTypes.string.isRequired,
    tenantId: PropTypes.string,
  })).isRequired,
  materialTypeOptions: selectOptionsShape,
  onCancel: PropTypes.func,
  order: PropTypes.object.isRequired,
  pristine: PropTypes.bool,
  stripes: stripesShape.isRequired,
  submitting: PropTypes.bool,
  templateValue: PropTypes.shape({
    id: PropTypes.string.isRequired,
    templateCode: PropTypes.string,
    templateName: PropTypes.string.isRequired,
    hiddenFields: PropTypes.shape({}),
  }),
  values: PropTypes.object.isRequired,
  vendor: PropTypes.object,
};

export default flow(
  stripesForm({
    enableReinitialize: true,
    keepDirtyOnReinitialize: true,
    navigationCheck: true,
    validateOnBlur: true,
    subscription: { values: true },
  }),
  withUniqueFieldArrayItemKeys,
)(POLineForm);
