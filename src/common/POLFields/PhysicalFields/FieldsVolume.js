import PropTypes from 'prop-types';
import { Component } from 'react';
import { Field } from 'react-final-form';
import { FieldArray } from 'react-final-form-arrays';
import { FormattedMessage } from 'react-intl';

import {
  Col,
  Button,
  IconButton,
  Row,
} from '@folio/stripes/components';
import { TextField } from '@folio/stripes-acq-components';

import { POL_FORM_FIELDS } from '../../constants';

class FieldsVolume extends Component {
  static propTypes = {
    disabled: PropTypes.bool,
  };

  addFields = (fields) => {
    fields.push('');
  }

  removeFields = (fields, index) => {
    fields.remove(index);
  }

  renderForm = ({ fields }) => {
    const { disabled } = this.props;

    return (
      <Row>
        <Col xs={12}>
          {fields.length === 0 && !disabled && (
            <Col xs={12}>
              <div>
                <em>
                  <FormattedMessage id="ui-orders.physical.addVolume" />
                </em>
              </div>
            </Col>
          )}
          {fields.map((elem, index) => (
            <Row key={index}>
              <Col xs={11}>
                <Field
                  component={TextField}
                  fullWidth
                  label={<FormattedMessage id="ui-orders.physical.volume" />}
                  name={elem}
                  isNonInteractive={disabled}
                  validateFields={[]}
                />
              </Col>
              {!disabled && (
                <Col
                  style={{ paddingTop: '10px' }}
                  xs={1}
                >
                  <br />
                  <IconButton
                    data-test-remove-volume-button
                    icon="trash"
                    onClick={() => this.removeFields(fields, index)}
                    disabled={disabled}
                  >
                    <FormattedMessage id="ui-orders.physical.removeBtn" />
                  </IconButton>
                </Col>
              )}
            </Row>
          ))}
        </Col>
        {!disabled && (
          <Col xs={12} style={{ paddingTop: '10px' }}>
            <Button
              data-test-add-volume-button
              onClick={() => this.addFields(fields)}
              disabled={disabled}
            >
              <FormattedMessage id="ui-orders.physical.addVolumeBtn" />
            </Button>
          </Col>
        )}
      </Row>
    );
  }

  render() {
    return (
      <FieldArray
        component={this.renderForm}
        label="physical.volumes"
        name={POL_FORM_FIELDS.physicalVolumes}
      />
    );
  }
}

export default FieldsVolume;
