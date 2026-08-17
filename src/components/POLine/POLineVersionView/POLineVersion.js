import PropTypes from 'prop-types';
import { memo, useRef } from 'react';
import { FormattedMessage } from 'react-intl';

import {
  Accordion,
  AccordionSet,
  AccordionStatus,
  checkScope,
  Col,
  collapseAllSections,
  ExpandAllButton,
  expandAllSections,
  HasCommand,
  Row,
} from '@folio/stripes/components';
import { ViewMetaData } from '@folio/stripes/smart-components';
import { ORDER_FORMATS } from '@folio/stripes-acq-components';

import { isOngoing } from '../../../common/POFields';

import {
  VersionCheckbox,
  VersionKeyValue,
} from '../../../common/VersionView';
import {
  ACCORDION_ID,
  ERESOURCES,
  PHRESOURCES,
} from '../const';
import { CostVersionView } from './CostVersionView';
import { DonorsVersionView } from './DonorsVersionView';
import { EresourcesVersionView } from './EresourcesVersionView';
import { FundDistributionVersionView } from './FundDistributionVersionView';
import { ItemVersionView } from './ItemVersionView';
import { LocationVersionView } from './LocationVersionView/LocationVersionView';
import { OtherVersionView } from './OtherVersionView';
import { PhysicalVersionView } from './PhysicalVersionView';
import { POLineDetailsVersionView } from './POLineDetailsVersionView';
import { PaymentTermsVersionView } from './PaymentTermsVersionView';
import { VendorVersionView } from './VendorVersionView';
import { POL_FORM_FIELDS } from '../../../common/constants';

const POLineVersion = ({
  version,
  centralOrdering = false,
}) => {
  const accordionStatusRef = useRef();

  const orderFormat = version?.orderFormat;
  const showEresources = ERESOURCES.includes(orderFormat);
  const showPhresources = PHRESOURCES.includes(orderFormat);
  const showOther = orderFormat === ORDER_FORMATS.other;

  const shortcuts = [
    {
      name: 'expandAllSections',
      handler: (e) => expandAllSections(e, accordionStatusRef),
    },
    {
      name: 'collapseAllSections',
      handler: (e) => collapseAllSections(e, accordionStatusRef),
    },
  ];

  return (
    <HasCommand
      commands={shortcuts}
      isWithinScope={checkScope}
      scope={document.body}
    >
      <AccordionStatus ref={accordionStatusRef}>
        <Row end="xs">
          <Col xs={12}>
            <ExpandAllButton />
          </Col>
        </Row>

        <AccordionSet>
          <Accordion
            label={<FormattedMessage id="ui-orders.line.accordion.itemDetails" />}
            id="ItemDetails"
          >
            {version?.metadata && <ViewMetaData metadata={version.metadata} />}

            <ItemVersionView version={version} />
          </Accordion>

          <Accordion
            label={<FormattedMessage id="ui-orders.line.accordion.poLine" />}
            id={ACCORDION_ID.poLine}
          >
            <POLineDetailsVersionView version={version} />
          </Accordion>

          <Accordion
            label={<FormattedMessage id="ui-orders.line.accordion.ongoingOrder" />}
            id={ACCORDION_ID.ongoingOrder}
          >
            <Row start="xs">
              <Col
                xs={12}
                lg={6}
              >
                <VersionKeyValue
                  name="renewalNote"
                  label={<FormattedMessage id="ui-orders.poLine.renewalNote" />}
                  value={version?.renewalNote}
                />
              </Col>
              <Col
                xs={12}
                lg={6}
              >
                <VersionCheckbox
                  name={POL_FORM_FIELDS.multiYearPayment}
                  checked={version?.multiYearPayment}
                  label={<FormattedMessage id="ui-orders.poLine.multiYearPayment" />}
                />
              </Col>
            </Row>
          </Accordion>

          <Accordion
            label={<FormattedMessage id="ui-orders.line.accordion.donorInformation" />}
            id={ACCORDION_ID.donorsInformation}
          >
            <DonorsVersionView version={version} />
          </Accordion>

          <Accordion
            label={<FormattedMessage id="ui-orders.line.accordion.vendor" />}
            id="Vendor"
          >
            <VendorVersionView version={version} />
          </Accordion>

          <Accordion
            label={<FormattedMessage id="ui-orders.line.accordion.cost" />}
            id="CostDetails"
          >
            <CostVersionView version={version} />
          </Accordion>

          <Accordion
            label={<FormattedMessage id="ui-orders.line.accordion.fund" />}
            id="FundDistribution"
          >
            <FundDistributionVersionView version={version} />
          </Accordion>

          {isOngoing(version?.order?.orderType) && version?.multiYearPayment && (
            <Accordion
              label={<FormattedMessage id="ui-orders.line.accordion.paymentTerms" />}
              id={ACCORDION_ID.paymentTerms}
            >
              <PaymentTermsVersionView version={version} />
            </Accordion>
          )}

          <Accordion
            label={<FormattedMessage id="ui-orders.line.accordion.location" />}
            id={ACCORDION_ID.location}
          >
            <LocationVersionView
              version={version}
              centralOrdering={centralOrdering}
            />
          </Accordion>

          {showPhresources && (
            <Accordion
              label={<FormattedMessage id="ui-orders.line.accordion.physical" />}
              id={ACCORDION_ID.physical}
            >
              <PhysicalVersionView version={version} />
            </Accordion>
          )}

          {showEresources && (
            <Accordion
              label={<FormattedMessage id="ui-orders.line.accordion.eresource" />}
              id={ACCORDION_ID.eresources}
            >
              <EresourcesVersionView version={version} />
            </Accordion>
          )}

          {showOther && (
            <Accordion
              label={<FormattedMessage id="ui-orders.line.accordion.other" />}
              id={ACCORDION_ID.other}
            >
              <OtherVersionView version={version} />
            </Accordion>
          )}
        </AccordionSet>
      </AccordionStatus>
    </HasCommand>
  );
};

POLineVersion.propTypes = {
  centralOrdering: PropTypes.bool,
  version: PropTypes.object.isRequired,
};

export default memo(POLineVersion);
