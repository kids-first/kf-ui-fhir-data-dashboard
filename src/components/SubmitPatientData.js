import React from 'react';
import PropTypes from 'prop-types';
import {Icon, Button, Form} from 'semantic-ui-react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import {v4 as uuidv4} from 'uuid';

class SubmitPatientData extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      observations: [],
    };
  }

  addObservation = () => {
    const newObservation = {type: 'Select a type...'};
    const observations = [...this.state.observations].concat(newObservation);
    this.setState({observations});
  };

  updateObservation = (index, field, value) => {
    let observations = [...this.state.observations];
    if (field === 'type' && value !== observations[index].type) {
      // remove value from object
      const {value, ...noVal} = observations[index];
      observations[index] = {...noVal};
    }
    observations[index] = {...observations[index], [field]: value};
    this.setState({observations});
  };

  getInputType = (event, index) => {
    switch (event.type) {
      case 'input':
        return (
          <Form.Input
            placeholder="Please enter a value"
            value={this.state.observations[index].value || ''}
            onChange={e =>
              this.updateObservation(index, 'value', e.target.value)
            }
          />
        );
      case 'radio':
        return (
          <React.Fragment>
            {event.labels.map((label, i) => (
              <Form.Radio
                key={`${label}-${i}`}
                label={label}
                value={label}
                checked={
                  this.state.observations[index].value &&
                  this.state.observations[index].value === label
                }
                onChange={() => this.updateObservation(index, 'value', label)}
              />
            ))}
          </React.Fragment>
        );
      default:
        return null;
    }
  };

  removeObservation = index => {
    let observations = [...this.state.observations];
    observations.splice(index, 1);
    this.setState({observations});
  };

  submit = () => {
    const json = this.state.observations.map(obs => this.generateJson(obs));
    console.log('json', JSON.stringify(json));
  };

  generateJson = event => {
    let obsFields = null;
    switch (event.type) {
      case 'Temperature':
        obsFields = {
          category: [
            {
              coding: [
                {
                  system:
                    'http://terminology.hl7.org/CodeSystem/observation-category',
                  code: 'vital-signs',
                  display: 'vital-signs',
                },
              ],
            },
          ],
          code: {
            coding: [
              {
                system: 'http://loinc.org',
                code: '8310-5',
                display: 'Body temperature',
              },
              {
                system: 'http://loinc.org',
                code: '8331-1',
                display: 'Oral temperature',
              },
            ],
            text: 'Body temperature',
          },
          valueQuantity: {
            value: event.value,
            unit: 'Far',
            system: 'http://unitsofmeasure.org',
            code: 'Far',
          },
        };
        break;
      case 'Heart Rate':
        obsFields = {
          category: [
            {
              coding: [
                {
                  system:
                    'http://terminology.hl7.org/CodeSystem/observation-category',
                  code: 'vital-signs',
                  display: 'vital-signs',
                },
              ],
            },
          ],
          code: {
            coding: [
              {
                system: 'http://loinc.org',
                code: '8867-4',
                display: 'Heart rate',
              },
            ],
            text: 'Heart rate',
          },
          valueQuantity: {
            value: event.value,
            unit: '/min',
            system: 'http://unitsofmeasure.org',
            code: '/min',
          },
        };
        break;
      default:
        obsFields = null;
        break;
    }
    return {
      resourceType: 'Observation',
      id: uuidv4(),
      subject: {
        reference: `${this.props.payload.resourceType}/${this.props.payload.id}`,
      },
      effectiveDateTime: event.date,
      ...obsFields,
    };
  };

  render() {
    const formOptions = [
      {key: 'Temperature', text: 'Temperature', value: 'Temperature'},
      {key: 'Heart Rate', text: 'Heart Rate', value: 'Heart Rate'},
    ];
    const observationMapping = {
      Temperature: {text: 'Temperature (degrees Farenheit)', type: 'input'},
      'Heart Rate': {
        text: 'BPM',
        type: 'input',
      },
    };
    return (
      <Form>
        {this.state.observations.map((event, i) => {
          const details = observationMapping[event.type];
          return (
            <Form.Group key={`${event.type}-${i}`}>
              <Icon
                name="delete"
                size="large"
                onClick={() => this.removeObservation(i)}
              />
              <Form.Field inline>
                <div className="id-details__submit-date-picker field">
                  <label>Date of Observation</label>
                  <DatePicker
                    selected={this.state.observations[i].date}
                    onChange={date => this.updateObservation(i, 'date', date)}
                  />
                </div>
              </Form.Field>
              <Form.Field inline>
                <Form.Select
                  label="Observation Type"
                  options={formOptions}
                  placeholder={event.type}
                  onChange={(e, {value}) =>
                    this.updateObservation(i, 'type', value)
                  }
                />
              </Form.Field>
              {!!details ? (
                <Form.Field inline>
                  <label>{details.text}</label>
                  {this.getInputType(details, i)}
                </Form.Field>
              ) : null}
            </Form.Group>
          );
        })}
        <div className="id-details__submit-buttons">
          <Button primary onClick={this.addObservation}>
            <Icon name="plus" />
            Add Observation
          </Button>
          <Button primary onClick={this.submit}>
            Submit
          </Button>
        </div>
      </Form>
    );
  }
}

SubmitPatientData.propTypes = {
  payload: PropTypes.shape({
    id: PropTypes.string.isRequired,
    resourceType: PropTypes.string.isRequired,
  }).isRequired,
};

SubmitPatientData.defaultProps = {
  payload: {},
};

export default SubmitPatientData;
