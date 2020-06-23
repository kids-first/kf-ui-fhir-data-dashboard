import React from 'react';
import PropTypes from 'prop-types';
import {Icon, Button, Form, Message, Loader} from 'semantic-ui-react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import {logErrors} from '../utils/common';
import {postWithHeaders} from '../utils/api';

class SubmitPatientData extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      observations: [],
      messageContent: null,
      submitting: false,
      abortController: new AbortController(),
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

  submit = async () => {
    this.setState({submitting: true, messageContent: null}, async () => {
      let json = this.state.observations.map(obs => this.generateJson(obs));
      let successNum = 0;
      await Promise.all(
        json.map(
          async obs =>
            await postWithHeaders(
              'http://localhost:8000/Observation',
              obs,
              this.state.abortController,
            )
              .then(() => (successNum += 1))
              .catch(err => {
                logErrors('Error submitting observation:', err);
              }),
        ),
      ).then(() => {
        this.setState({submitting: false}, () => {
          this.showSuccess(successNum);
        });
      });
    });
  };

  generateJson = event => {
    let obsFields = {};
    switch (event.type) {
      case 'Temperature':
        obsFields = {
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
            value: parseFloat(event.value) || 0,
            unit: 'Far',
            system: 'http://unitsofmeasure.org',
            code: 'Far',
          },
        };
        break;
      case 'Heart rate':
        obsFields = {
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
            value: parseFloat(event.value) || 0,
            unit: '/min',
            system: 'http://unitsofmeasure.org',
            code: '/min',
          },
        };
        break;
      case 'Fever':
        obsFields = {
          code: {
            coding: [
              {
                system: 'http://loinc.org',
                code: '45701-0',
                display: 'Fever',
              },
            ],
            text: 'Fever',
          },
          valueBoolean: event.value === 'Yes' ? true : false,
        };
        break;
      default:
        obsFields = {};
        break;
    }
    return {
      resourceType: 'Observation',
      meta: {
        profile: ['http://hl7.org/fhir/StructureDefinition/Observation'],
      },
      status: 'final',
      text: {
        status: 'empty',
        div: '<div xmlns="http://www.w3.org/1999/xhtml"/>',
      },
      subject: {
        reference: `${this.props.payload.resourceType}/${this.props.payload.id}`,
      },
      effectiveDateTime: event.date,
      performer: [
        {
          reference: `${this.props.payload.resourceType}/${this.props.payload.id}`,
        },
      ],
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
      ...obsFields,
    };
  };

  showSuccess = num => {
    if (num > 0) {
      this.setState({
        observations: [],
        messageContent: `Successfully submitted ${num} Observations.`,
      });
    }
  };

  render() {
    const formOptions = [
      {key: 'Temperature', text: 'Temperature', value: 'Temperature'},
      {key: 'Heart rate', text: 'Heart rate', value: 'Heart rate'},
      {key: 'Fever', text: 'Fever', value: 'Fever'},
      {key: 'Abdominal pain', text: 'Abdominal pain', value: 'Abdominal pain'},
      {key: 'Vomiting', text: 'Vomiting', value: 'Vomiting'},
      {key: 'Diarrhea', text: 'Diarrhea', value: 'Diarrhea'},
      {key: 'Rash', text: 'Rash', value: 'Rash'},
      {key: 'Bloodshot eyes', text: 'Bloodshot eyes', value: 'Bloodshot eyes'},
      {
        key: 'Feeling extra tired',
        text: 'Feeling extra tired',
        value: 'Feeling extra tired',
      },
      {
        key: 'Trouble breathing',
        text: 'Trouble breathing',
        value: 'Trouble breathing',
      },
      {
        key: 'Pain/pressure in the chest',
        text: 'Pain/pressure in the chest',
        value: 'Pain/pressure in the chest',
      },
      {key: 'New confusion', text: 'New confusion', value: 'New confusion'},
      {
        key: 'Inability to wake or stay awake',
        text: 'Inability to wake or stay awake',
        value: 'Inability to wake or stay awake',
      },
      {
        key: 'Blush lips or face',
        text: 'Blush lips or face',
        value: 'Blush lips or face',
      },
      {
        key: 'Severe abdominal pain',
        text: 'Severe abdominal pain',
        value: 'Severe abdominal pain',
      },
    ];
    const observationMapping = {
      Temperature: {text: 'Temperature (degrees Farenheit)', type: 'input'},
      'Heart rate': {
        text: 'BPM',
        type: 'input',
      },
      Fever: {text: 'Present?', type: 'radio', labels: ['Yes', 'No']},
      'Abdominal pain': {
        text: 'Present?',
        type: 'radio',
        labels: ['Yes', 'No'],
      },
      Vomiting: {text: 'Present?', type: 'radio', labels: ['Yes', 'No']},
      Diarrhea: {text: 'Present?', type: 'radio', labels: ['Yes', 'No']},
      Rash: {text: 'Present?', type: 'radio', labels: ['Yes', 'No']},
      'Bloodshot eyes': {
        text: 'Present?',
        type: 'radio',
        labels: ['Yes', 'No'],
      },
      'Feeling extra tired': {
        text: 'Present?',
        type: 'radio',
        labels: ['Yes', 'No'],
      },
      'Trouble breathing': {
        text: 'Present?',
        type: 'radio',
        labels: ['Yes', 'No'],
      },
      'Pain/pressure in the chest': {
        text: 'Present?',
        type: 'radio',
        labels: ['Yes', 'No'],
      },
      'New confusion': {text: 'Present?', type: 'radio', labels: ['Yes', 'No']},
      'Inability to wake or stay awake': {
        text: 'Present?',
        type: 'radio',
        labels: ['Yes', 'No'],
      },
      'Blush lips or face': {
        text: 'Present?',
        type: 'radio',
        labels: ['Yes', 'No'],
      },
      'Severe abdominal pain': {
        text: 'Present?',
        type: 'radio',
        labels: ['Yes', 'No'],
      },
    };
    return (
      <React.Fragment>
        {this.state.messageContent ? (
          <Message positive>
            <Message.Header>Submission complete</Message.Header>
            <p>{this.state.messageContent}</p>
          </Message>
        ) : null}
        {this.state.submitting ? (
          <Loader active={this.state.submitting}>Submitting...</Loader>
        ) : (
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
                        onChange={date =>
                          this.updateObservation(i, 'date', date)
                        }
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
        )}
      </React.Fragment>
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
