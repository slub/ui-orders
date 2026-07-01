import PropTypes from 'prop-types';

import { Accordion, Row } from '@folio/stripes/components';
import { useCustomFieldsQuery } from '@folio/stripes/smart-components';

const CustomFieldGroupAccordion = ({
  sectionId,
  label,
  backendModuleName,
  entityType,
  children,
}) => {
  const {
    customFields,
    isLoadingCustomFields,
  } = useCustomFieldsQuery({
    moduleName: backendModuleName,
    entityType,
    sectionId,
    isVisible: true,
  });

  if (isLoadingCustomFields || !customFields?.length) return null;

  return (
    <Accordion
      id={`customFields-${sectionId}`}
      label={label}
    >
      <Row>
        {children}
      </Row>
    </Accordion>
  );
};

CustomFieldGroupAccordion.propTypes = {
  backendModuleName: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
  entityType: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  sectionId: PropTypes.string.isRequired,
};

export default CustomFieldGroupAccordion;