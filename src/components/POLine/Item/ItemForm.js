import get from 'lodash/get';
import isEqual from 'lodash/isEqual';
import noop from 'lodash/noop';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { Field } from 'react-final-form';
import { FormattedMessage } from 'react-intl';
import { Link } from 'react-router-dom';

import {
  Checkbox,
  Col,
  Icon,
  InfoPopover,
  Label,
  Row,
  TextArea,
} from '@folio/stripes/components';
import {
  FieldDatepickerFinal,
  IfFieldVisible,
  selectOptionsShape,
  TextField,
  VisibilityControl,
} from '@folio/stripes-acq-components';

import { POL_FORM_FIELDS } from '../../../common/constants';
import {
  isWorkflowStatusClosed,
  isWorkflowStatusIsPending,
  isWorkflowStatusOpen,
} from '../../PurchaseOrder/util';
import { BreakInstanceConnectionModal } from './BreakInstanceConnectionModal';
import ContributorForm from './ContributorForm';
import { FieldSuppressDiscovery } from './FieldSuppressDiscovery';
import InstancePlugin from './InstancePlugin';
import PackagePoLineField from './PackagePoLineField';
import ProductIdDetailsForm from './ProductIdDetailsForm';
import { TitleField } from './TitleField';
import {
  createPOLDataFromInstance,
  getInventoryData,
  getNormalizedInventoryData,
  shouldSetInstanceId,
} from './util';

import css from './ItemForm.css';

const FIELDS_TO_INTERCEPT_ON_DELETE = ['contributors'];

class ItemForm extends Component {
  static propTypes = {
    change: PropTypes.func.isRequired,
    batch: PropTypes.func.isRequired,
    identifierTypes: selectOptionsShape,
    contributorNameTypes: PropTypes.arrayOf(PropTypes.object),
    initialValues: PropTypes.object,
    order: PropTypes.object.isRequired,
    formValues: PropTypes.object.isRequired,
    required: PropTypes.bool,
    hiddenFields: PropTypes.object,
    isCreateFromInstance: PropTypes.bool,
    lineId: PropTypes.string,
  };

  static defaultProps = {
    initialValues: {},
    hiddenFields: {},
    required: true,
    isCreateFromInstance: false,
  };

  constructor(props) {
    super(props);

    this.state = {
      inventoryData: getInventoryData(props.initialValues),
      isBreakInstanceConnectionModalOpen: false,
    };

    this.changeItemDetailsTimeout = null;
    this.breakInstanceConnectionPromise = Promise.resolve();
  }

  breakInstanceConnection = () => {
    const { batch, change, formValues } = this.props;
    const locations = formValues?.locations;

    batch(() => {
      change('instanceId', null);
      locations?.forEach((_, i) => change(`locations[${i}].holdingId`, null));
    });
  }

  onBreakInstanceConnection = () => (
    new Promise((resolve, reject) => {
      this.breakInstanceConnectionPromise = { resolve, reject };

      this.setState({ isBreakInstanceConnectionModalOpen: true });
    })
      .then(this.breakInstanceConnection)
      .finally(() => this.setState({ isBreakInstanceConnectionModalOpen: false }))
  );

  onAddLinkPackage = ([selectedPoLine]) => {
    const { change } = this.props;

    change('packagePoLineId', selectedPoLine?.id || null);
  };

  onAddInstance = (instance) => {
    const { batch, change, identifierTypes, formValues } = this.props;
    const inventoryData = createPOLDataFromInstance(instance, identifierTypes);

    batch(() => {
      Object.keys(inventoryData).forEach(field => {
        change(field, inventoryData[field]);
      });
    });

    if (formValues.instanceId && formValues.instanceId !== inventoryData.instanceId) {
      change(POL_FORM_FIELDS.locations, []);
    }

    this.setState(({
      inventoryData: {
        instanceId: inventoryData.instanceId,
        title: get(inventoryData, 'titleOrPackage', ''),
        publisher: get(inventoryData, 'publisher', ''),
        publicationDate: get(inventoryData, 'publicationDate', null),
        edition: get(inventoryData, 'edition', ''),
        contributors: get(inventoryData, 'contributors', []),
        productIds: get(inventoryData, 'productIds', []),
      },
    }));
  };

  onChangeField = (value, fieldName) => {
    clearTimeout(this.changeItemDetailsTimeout);

    const { change, formValues } = this.props;
    const { inventoryData } = this.state;

    const connectedInstance = formValues?.instanceId;
    const rollbackData = {
      isPackage: formValues.isPackage,
      ...getNormalizedInventoryData(inventoryData),
    };
    const rollbackValue = get(rollbackData, fieldName);

    if (fieldName) change(fieldName, value);

    return new Promise((resolve, reject) => {
      this.changeItemDetailsTimeout = setTimeout(() => {
        if (shouldSetInstanceId(this.props.formValues, inventoryData)) {
          change(POL_FORM_FIELDS.instanceId, inventoryData.instanceId);
          resolve();
        } else if (connectedInstance) {
          this.onBreakInstanceConnection()
            .then(resolve)
            .catch(() => {
              change(fieldName, rollbackValue);
              reject();
            });
        } else {
          this.breakInstanceConnection();
          resolve();
        }
      });
    });
  };

  safeChangeField = (value, fieldName) => {
    return this.onChangeField(value, fieldName).catch(noop);
  };

  onRemoveField = (fields, index) => {
    const { formValues } = this.props;

    const normalizedInventoryData = getNormalizedInventoryData(this.state.inventoryData);
    const fieldName = `${fields.name}[${index}]`;

    // Intercept deletion of connected instance field
    if (
      formValues?.instanceId
      && FIELDS_TO_INTERCEPT_ON_DELETE.includes(fields.name)
      && isEqual(get(formValues, fieldName), get(normalizedInventoryData, fieldName))
    ) {
      return this.onBreakInstanceConnection()
        .then(() => fields.remove(index))
        .catch(noop);
    }

    return fields.remove(index);
  }

  setTitleOrPackage = ({ target: { value } }) => {
    this.safeChangeField(value, POL_FORM_FIELDS.titleOrPackage);
  };

  setIsPackage = () => {
    const { batch, change, formValues } = this.props;
    const isPackageValue = !formValues?.isPackage;

    this.onChangeField(isPackageValue, POL_FORM_FIELDS.isPackage)
      .then(() => {
        if (isPackageValue) {
          batch(() => {
            // Packages require independent receiving; removing the package flag must not undo
            // that choice or override another requirement, such as Bindery or Receipt not required.
            change(POL_FORM_FIELDS.checkinItems, true);

            formValues?.locations?.forEach((_, i) => {
              change(`${POL_FORM_FIELDS.locations}[${i}].quantityPhysical`, null);
              change(`${POL_FORM_FIELDS.locations}[${i}].quantityElectronic`, null);
            });
          });
        }
      })
      .catch(noop);
  };

  setPublisher = ({ target: { value } }) => {
    this.safeChangeField(value, POL_FORM_FIELDS.publisher);
  };

  setPublicationDate = ({ target: { value } }) => {
    this.safeChangeField(value || null, POL_FORM_FIELDS.publicationDate);
  };

  setEdition = ({ target: { value } }) => {
    this.safeChangeField(value, POL_FORM_FIELDS.edition);
  };

  getTitleLabel = () => {
    const { required, formValues } = this.props;
    const instanceId = get(formValues, POL_FORM_FIELDS.instanceId);
    const isPackage = get(formValues, POL_FORM_FIELDS.isPackage);
    const title = (
      <Label
        className={css.titleLabel}
        required={required}
        tagName="div"
      >
        {
          isPackage
            ? <FormattedMessage id="ui-orders.itemDetails.packageName" />
            : <FormattedMessage id="ui-orders.itemDetails.title" />
        }
      </Label>
    );
    const connectedTitle = (
      <>
        {title}
        <Link
          data-test-connected-link
          to={`/inventory/view/${instanceId}`}
          target="_blank"
        >
          <FormattedMessage id="ui-orders.itemDetails.connectedTitle" />
          <Icon
            size="small"
            icon="external-link"
          />
        </Link>
      </>
    );
    const notConnectedTitle = (
      <>
        {title}
        <div>
          <FormattedMessage id="ui-orders.itemDetails.notConnectedTitle" />
          <InfoPopover content={<FormattedMessage id="ui-orders.itemDetails.notConnectedInfo" />} />
        </div>
      </>
    );

    if (!this.state.inventoryData.instanceId) {
      return title;
    }

    return instanceId ? connectedTitle : notConnectedTitle;
  }

  render() {
    const isPostPendingOrder = !isWorkflowStatusIsPending(this.props.order);
    const isOrderOpen = isWorkflowStatusOpen(this.props.order);
    const isOrderClosed = isWorkflowStatusClosed(this.props.order);
    const {
      contributorNameTypes,
      formValues,
      identifierTypes,
      isCreateFromInstance,
      required,
      hiddenFields,
      lineId,
    } = this.props;
    const isPackage = Boolean(formValues?.isPackage);
    const isSelectInstanceVisible = !(isPackage || isPostPendingOrder || isCreateFromInstance);

    const isTitleOrPackageNonInteractive = isPackage
      ? isOrderClosed
      : isPostPendingOrder;

    return (
      <>
        <Row>
          <IfFieldVisible
            name={POL_FORM_FIELDS.isPackage}
            visible={!hiddenFields.isPackage}
          >
            <Col
              xs={6}
              md={3}
            >
              <VisibilityControl name={`hiddenFields.${POL_FORM_FIELDS.isPackage}`}>
                <Field
                  component={Checkbox}
                  fullWidth
                  label={<FormattedMessage id="ui-orders.poLine.package" />}
                  name={POL_FORM_FIELDS.isPackage}
                  onChange={this.setIsPackage}
                  type="checkbox"
                  disabled={isPostPendingOrder || isCreateFromInstance}
                />
              </VisibilityControl>
            </Col>
          </IfFieldVisible>
        </Row>
        <Row>
          <Col xs={12}>
            <TitleField
              data-testid="titleOrPackage-field"
              label={this.getTitleLabel()}
              isNonInteractive={isTitleOrPackageNonInteractive}
              onChange={this.setTitleOrPackage}
              poLineDetails={formValues}
              required={required}
              disabled={isCreateFromInstance}
            />
            {isSelectInstanceVisible && <InstancePlugin addInstance={this.onAddInstance} />}
          </Col>
        </Row>
        <Row>
          <IfFieldVisible
            name={POL_FORM_FIELDS.receivingNote}
            visible={!hiddenFields.details?.receivingNote}
          >
            <Col
              xs={6}
              md={3}
            >
              <VisibilityControl name={`hiddenFields.${POL_FORM_FIELDS.receivingNote}`}>
                <Field
                  component={TextArea}
                  fullWidth
                  label={<FormattedMessage id="ui-orders.itemDetails.receivingNote" />}
                  name={POL_FORM_FIELDS.receivingNote}
                  validateFields={[]}
                />
              </VisibilityControl>
            </Col>
          </IfFieldVisible>
          {!lineId && (
            <IfFieldVisible
              name={POL_FORM_FIELDS.isAcknowledged}
              visible={!hiddenFields.details?.isAcknowledged}
            >
              <Col
                xs={6}
                md={3}
              >
                <VisibilityControl name={`hiddenFields.${POL_FORM_FIELDS.isAcknowledged}`}>
                  <Field
                    component={Checkbox}
                    fullWidth
                    label={<FormattedMessage id="ui-orders.itemDetails.isAcknowledged" />}
                    name={POL_FORM_FIELDS.isAcknowledged}
                    type="checkbox"
                    vertical
                    validateFields={[]}
                  />
                </VisibilityControl>
              </Col>
            </IfFieldVisible>
          )}
        </Row>
        <Row>
          <IfFieldVisible
            name={POL_FORM_FIELDS.subscriptionFrom}
            visible={!hiddenFields.details?.subscriptionFrom}
          >
            <Col
              xs={6}
              md={3}
            >
              <VisibilityControl name={`hiddenFields.${POL_FORM_FIELDS.subscriptionFrom}`}>
                <FieldDatepickerFinal
                  label={<FormattedMessage id="ui-orders.itemDetails.subscriptionFrom" />}
                  name={POL_FORM_FIELDS.subscriptionFrom}
                  validateFields={[]}
                />
              </VisibilityControl>
            </Col>
          </IfFieldVisible>

          <IfFieldVisible
            name={POL_FORM_FIELDS.subscriptionTo}
            visible={!hiddenFields.details?.subscriptionTo}
          >
            <Col
              xs={6}
              md={3}
            >
              <VisibilityControl name={`hiddenFields.${POL_FORM_FIELDS.subscriptionTo}`}>
                <FieldDatepickerFinal
                  label={<FormattedMessage id="ui-orders.itemDetails.subscriptionTo" />}
                  name={POL_FORM_FIELDS.subscriptionTo}
                  isNonInteractive={isPostPendingOrder && !isOrderOpen}
                  validateFields={[]}
                />
              </VisibilityControl>
            </Col>
          </IfFieldVisible>

          <IfFieldVisible
            name={POL_FORM_FIELDS.subscriptionInterval}
            visible={!hiddenFields.details?.subscriptionInterval}
          >
            <Col
              xs={6}
              md={3}
            >
              <VisibilityControl name={`hiddenFields.${POL_FORM_FIELDS.subscriptionInterval}`}>
                <Field
                  label={<FormattedMessage id="ui-orders.itemDetails.subscriptionInterval" />}
                  name={POL_FORM_FIELDS.subscriptionInterval}
                  component={TextField}
                  type="number"
                  fullWidth
                  isNonInteractive={isPostPendingOrder}
                  validateFields={[]}
                />
              </VisibilityControl>
            </Col>
          </IfFieldVisible>
        </Row>
        <Row>
          <IfFieldVisible
            name={POL_FORM_FIELDS.publicationDate}
            visible={!hiddenFields.details?.publicationDate}
          >
            <Col
              xs={6}
              md={3}
            >
              <VisibilityControl name={`hiddenFields.details.${POL_FORM_FIELDS.publicationDate}`}>
                <Field
                  component={TextField}
                  disabled={isCreateFromInstance}
                  fullWidth
                  label={<FormattedMessage id="ui-orders.itemDetails.publicationDate" />}
                  name={POL_FORM_FIELDS.publicationDate}
                  onChange={this.setPublicationDate}
                  isNonInteractive={isPostPendingOrder}
                  validateFields={[]}
                />
              </VisibilityControl>
            </Col>
          </IfFieldVisible>
          <IfFieldVisible
            name={POL_FORM_FIELDS.publisher}
            visible={!hiddenFields.details?.publisher}
          >
            <Col
              xs={6}
              md={3}
            >
              <VisibilityControl name={`hiddenFields.details.${POL_FORM_FIELDS.publisher}`}>
                <Field
                  component={TextField}
                  disabled={isCreateFromInstance}
                  fullWidth
                  label={<FormattedMessage id="ui-orders.itemDetails.publisher" />}
                  name={POL_FORM_FIELDS.publisher}
                  onChange={this.setPublisher}
                  isNonInteractive={isPostPendingOrder}
                  validateFields={[]}
                />
              </VisibilityControl>
            </Col>
          </IfFieldVisible>
          <IfFieldVisible
            name={POL_FORM_FIELDS.edition}
            visible={!hiddenFields.details?.edition}
          >
            <Col
              xs={6}
              md={3}
            >
              <VisibilityControl name={`hiddenFields.details.${POL_FORM_FIELDS.edition}`}>
                <Field
                  component={TextField}
                  fullWidth
                  disabled={isCreateFromInstance}
                  label={<FormattedMessage id="ui-orders.itemDetails.edition" />}
                  onChange={this.setEdition}
                  name={POL_FORM_FIELDS.edition}
                  isNonInteractive={isPostPendingOrder}
                  validateFields={[]}
                />
              </VisibilityControl>
            </Col>
          </IfFieldVisible>

          <IfFieldVisible
            name={POL_FORM_FIELDS.packagePoLineId}
            visible={!hiddenFields.packagePoLineId}
          >
            <Col
              xs={6}
              md={3}
            >
              <VisibilityControl name={`hiddenFields.${POL_FORM_FIELDS.packagePoLineId}`}>
                <PackagePoLineField
                  disabled={isPackage}
                  onSelectLine={this.onAddLinkPackage}
                  poLineId={formValues?.packagePoLineId}
                />
              </VisibilityControl>
            </Col>
          </IfFieldVisible>

          <IfFieldVisible
            name={POL_FORM_FIELDS.suppressInstanceFromDiscovery}
            visible={!hiddenFields.suppressInstanceFromDiscovery}
          >
            <Col xs>
              <VisibilityControl name={`hiddenFields.${POL_FORM_FIELDS.suppressInstanceFromDiscovery}`}>
                {/* Disabled when PO Line is connected to the existing instance */}
                <FieldSuppressDiscovery disabled={Boolean(formValues.instanceId)} />
              </VisibilityControl>
            </Col>
          </IfFieldVisible>
        </Row>
        <Row>
          <IfFieldVisible
            name={POL_FORM_FIELDS.contributors}
            visible={!hiddenFields.details?.contributors}
          >
            <Col xs={12}>
              <ContributorForm
                contributorNameTypes={contributorNameTypes}
                isNonInteractive={isPostPendingOrder}
                onChangeField={this.safeChangeField}
                onRemoveField={this.onRemoveField}
                disabled={isCreateFromInstance}
                required={required}
              />
            </Col>
          </IfFieldVisible>
        </Row>
        <Row>
          <IfFieldVisible
            name={POL_FORM_FIELDS.productIds}
            visible={!hiddenFields.details?.productIds}
          >
            <Col xs={12}>
              <ProductIdDetailsForm
                identifierTypes={identifierTypes}
                isNonInteractive={isPostPendingOrder}
                onChangeField={this.safeChangeField}
                onRemoveField={this.onRemoveField}
                disabled={isCreateFromInstance}
                required={required}
              />
            </Col>
          </IfFieldVisible>
        </Row>
        <Row>
          <IfFieldVisible
            name={POL_FORM_FIELDS.description}
            visible={!hiddenFields.description}
          >
            <Col
              xs={6}
              md={3}
            >
              <VisibilityControl name={`hiddenFields.${POL_FORM_FIELDS.description}`}>
                <Field
                  component={TextArea}
                  fullWidth
                  label={<FormattedMessage id="ui-orders.itemDetails.internalNote" />}
                  name={POL_FORM_FIELDS.description}
                  validateFields={[]}
                />
              </VisibilityControl>
            </Col>
          </IfFieldVisible>
        </Row>

        {this.state.isBreakInstanceConnectionModalOpen && (
          <BreakInstanceConnectionModal
            onConfirm={this.breakInstanceConnectionPromise.resolve}
            onCancel={this.breakInstanceConnectionPromise.reject}
            title={this.props.formValues?.titleOrPackage}
          />
        )}
      </>
    );
  }
}

export default ItemForm;
