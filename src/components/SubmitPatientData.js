import React from 'react';
import PropTypes from 'prop-types';
import {Icon, Button, Form, Message, Loader} from 'semantic-ui-react';
import moment from 'moment';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import {logErrors} from '../utils/common';
import {postWithHeaders} from '../utils/api';

const formOptions = [
  {key: 'Temperature', text: 'Temperature', value: 'Temperature'},
  {key: 'Heart rate', text: 'Heart rate', value: 'Heart rate'},
  {key: 'Fever', text: 'Fever', value: 'Fever'},
  {key: 'Abdominal pain', text: 'Abdominal pain', value: 'Abdominal pain'},
  {key: 'Vomiting', text: 'Vomiting', value: 'Vomiting'},
  {key: 'Diarrhea', text: 'Diarrhea', value: 'Diarrhea'},
  {
    key: 'Fatigue',
    text: 'Fatigue',
    value: 'Fatigue',
  },
  {
    key: 'Difficulty breathing',
    text: 'Difficulty breathing',
    value: 'Difficulty breathing',
  },
  {
    key: 'Chest pain',
    text: 'Chest pain',
    value: 'Chest pain',
  },
  {
    key: 'Suspected COVID-19',
    text: 'Suspected COVID-19',
    value: 'Suspected COVID-19',
  },
  {key: 'COVID-19', text: 'COVID-19', value: 'COVID-19'},
];
const submissionMapping = {
  Temperature: {
    text: 'Temperature (degrees Farenheit)',
    type: 'input',
    resourceType: 'Observation',
  },
  'Heart rate': {
    text: 'BPM',
    type: 'input',
    resourceType: 'Observation',
  },
  Fever: {
    text: 'Status at Date',
    type: 'radio',
    labels: [
      'Active',
      'Reoccurence',
      'Relapse',
      'Inactive',
      'Remission',
      'Resolved',
    ],
    resourceType: 'Condition',
  },
  'Abdominal pain': {
    text: 'Status at Date',
    type: 'radio',
    labels: [
      'Active',
      'Reoccurence',
      'Relapse',
      'Inactive',
      'Remission',
      'Resolved',
    ],
    resourceType: 'Condition',
  },
  Vomiting: {
    text: 'Status at Date',
    type: 'radio',
    labels: [
      'Active',
      'Reoccurence',
      'Relapse',
      'Inactive',
      'Remission',
      'Resolved',
    ],
    resourceType: 'Condition',
  },
  Diarrhea: {
    text: 'Status at Date',
    type: 'radio',
    labels: [
      'Active',
      'Reoccurence',
      'Relapse',
      'Inactive',
      'Remission',
      'Resolved',
    ],
    resourceType: 'Condition',
  },
  Fatigue: {
    text: 'Status at Date',
    type: 'radio',
    labels: [
      'Active',
      'Reoccurence',
      'Relapse',
      'Inactive',
      'Remission',
      'Resolved',
    ],
    resourceType: 'Condition',
  },
  'Difficulty breathing': {
    text: 'Status at Date',
    type: 'radio',
    labels: [
      'Active',
      'Reoccurence',
      'Relapse',
      'Inactive',
      'Remission',
      'Resolved',
    ],
    resourceType: 'Condition',
  },
  'Chest pain': {
    text: 'Status at Date',
    type: 'radio',
    labels: [
      'Active',
      'Reoccurence',
      'Relapse',
      'Inactive',
      'Remission',
      'Resolved',
    ],
    resourceType: 'Condition',
  },
  'Suspected COVID-19': {
    text: 'Status at Date',
    type: 'radio',
    labels: [
      'Active',
      'Reoccurence',
      'Relapse',
      'Inactive',
      'Remission',
      'Resolved',
    ],
    resourceType: 'Condition',
  },
  'COVID-19': {
    text: 'Status at Date',
    type: 'radio',
    labels: [
      'Active',
      'Reoccurence',
      'Relapse',
      'Inactive',
      'Remission',
      'Resolved',
    ],
    resourceType: 'Condition',
  },
};

class SubmitPatientData extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      submissions: [],
      messageContent: null,
      submitting: false,
      messageContainsError: false,
      abortController: new AbortController(),
    };
  }

  addSubmission = () => {
    const newDataPoint = {type: 'Select a type...'};
    const submissions = [...this.state.submissions].concat(newDataPoint);
    this.setState({submissions});
  };

  updateSubmission = (index, field, inputVal) => {
    let submissions = [...this.state.submissions];
    if (field === 'type' && inputVal !== submissions[index].type) {
      // remove value from object
      const {value, ...noVal} = submissions[index];
      submissions[index] = {
        ...noVal,
        resourceType: submissionMapping[inputVal].resourceType,
      };
    }
    submissions[index] = {...submissions[index], [field]: inputVal};
    this.setState({submissions});
  };

  getInputType = (event, index) => {
    switch (event.type) {
      case 'input':
        return (
          <Form.Input
            placeholder="Please enter a value"
            value={this.state.submissions[index].value || ''}
            onChange={e =>
              this.updateSubmission(index, 'value', e.target.value)
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
                  this.state.submissions[index].value &&
                  this.state.submissions[index].value === label
                }
                onChange={() => this.updateSubmission(index, 'value', label)}
              />
            ))}
          </React.Fragment>
        );
      default:
        return null;
    }
  };

  removeSubmission = index => {
    let submissions = [...this.state.submissions];
    submissions.splice(index, 1);
    this.setState({submissions});
  };

  submit = async () => {
    this.setState({submitting: true, messageContent: null}, async () => {
      let json = this.state.submissions.map(event =>
        event.resourceType === 'Observation'
          ? this.generateObservationJson(event)
          : this.generateConditionJson(event),
      );
      let successNum = 0;
      await Promise.all(
        json.map(async resource => {
          return await postWithHeaders(
            `${this.props.baseUrl}${resource.resourceType}`,
            resource,
            this.state.abortController,
          )
            .then(() => (successNum += 1))
            .catch(err => {
              this.showMessage(0, err);
              logErrors('Error submitting data point:', err);
            });
        }),
      ).then(() => {
        this.setState({submitting: false}, () => {
          this.showMessage(successNum);
        });
      });
    });
  };

  generateConditionJson = condition => {
    return {
      resourceType: 'Condition',
      meta: {
        profile: ['http://hl7.org/fhir/StructureDefinition/Condition'],
      },
      text: {
        status: 'empty',
        div: '<div xmlns="http://www.w3.org/1999/xhtml"/>',
      },
      verificationStatus: {
        coding: [
          {
            system:
              'http://terminology.hl7.org/CodeSystem/condition-ver-status',
            code: 'unconfirmed',
          },
        ],
      },
      subject: {
        reference: `${this.props.payload.resourceType}/${this.props.payload.id}`,
      },
      onsetDateTime: moment(condition.date),
      recorder: {
        reference: `${this.props.payload.resourceType}/${this.props.payload.id}`,
      },
      ...this.generateJson(condition),
    };
  };

  generateObservationJson = observation => {
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
      effectiveDateTime: moment(observation.date),
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
      ...this.generateJson(observation),
    };
  };

  generateJson = event => {
    let fields = {};
    switch (event.type) {
      case 'Temperature':
        fields = {
          code: {
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
        fields = {
          code: {
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
        fields = {
          code: {
            text: 'Fever',
          },
          clinicalStatus: {
            coding: [
              {
                system:
                  'http://terminology.hl7.org/CodeSystem/condition-clinical',
                code: event.value.toLowerCase(),
              },
            ],
          },
        };
        break;
      case 'Abdominal pain':
        fields = {
          code: {
            text: 'Abdominal pain',
          },
          clinicalStatus: {
            coding: [
              {
                system:
                  'http://terminology.hl7.org/CodeSystem/condition-clinical',
                code: event.value.toLowerCase(),
              },
            ],
          },
        };
        break;
      case 'Chest pain':
        fields = {
          code: {
            text: 'Chest pain',
          },
          clinicalStatus: {
            coding: [
              {
                system:
                  'http://terminology.hl7.org/CodeSystem/condition-clinical',
                code: event.value.toLowerCase(),
              },
            ],
          },
        };
        break;
      case 'Diarrhea':
        fields = {
          code: {
            text: 'Diarrhea',
          },
          clinicalStatus: {
            coding: [
              {
                system:
                  'http://terminology.hl7.org/CodeSystem/condition-clinical',
                code: event.value.toLowerCase(),
              },
            ],
          },
        };
        break;
      case 'Difficulty breathing':
        fields = {
          code: {
            text: 'Difficulty breathing',
          },
          clinicalStatus: {
            coding: [
              {
                system:
                  'http://terminology.hl7.org/CodeSystem/condition-clinical',
                code: event.value.toLowerCase(),
              },
            ],
          },
        };
        break;
      case 'Fatigue':
        fields = {
          code: {
            text: 'Fatigue',
          },
          clinicalStatus: {
            coding: [
              {
                system:
                  'http://terminology.hl7.org/CodeSystem/condition-clinical',
                code: event.value.toLowerCase(),
              },
            ],
          },
        };
        break;
      case 'Vomiting':
        fields = {
          code: {
            text: 'Vomiting',
          },
          clinicalStatus: {
            coding: [
              {
                system:
                  'http://terminology.hl7.org/CodeSystem/condition-clinical',
                code: event.value.toLowerCase(),
              },
            ],
          },
        };
        break;
      case 'Suspected COVID-19':
        fields = {
          code: {
            text: 'Suspected COVID-19',
          },
          clinicalStatus: {
            coding: [
              {
                system:
                  'http://terminology.hl7.org/CodeSystem/condition-clinical',
                code: event.value.toLowerCase(),
              },
            ],
          },
        };
        break;
      case 'COVID-19':
        fields = {
          code: {
            text: 'COVID-19',
          },
          clinicalStatus: {
            coding: [
              {
                system:
                  'http://terminology.hl7.org/CodeSystem/condition-clinical',
                code: event.value.toLowerCase(),
              },
            ],
          },
        };
        break;
      default:
        fields = {};
        break;
    }
    return fields;
  };

  showMessage = (num, err = null) => {
    if (err) {
      this.setState({
        messageContainsError: true,
        messageContent: `Error with submission: ${err.statusText} ${err.status}`,
      });
    } else if (num > 0) {
      this.setState({
        submissions: [],
        messageContainsError: false,
        messageContent: `Successfully submitted ${num} data points.`,
      });
    }
  };

  render() {
    return (
      <React.Fragment>
        {this.state.messageContent ? (
          <Message
            positive={!this.state.messageContainsError}
            negative={this.state.messageContainsError}
          >
            <Message.Header>
              {this.state.messageContainsError
                ? 'Submission incomplete'
                : 'Submission complete'}
            </Message.Header>
            <p>{this.state.messageContent}</p>
          </Message>
        ) : null}
        {this.state.submitting ? (
          <Loader active={this.state.submitting}>Submitting...</Loader>
        ) : (
          <Form>
            {this.state.submissions.map((event, i) => {
              const details = submissionMapping[event.type];
              return (
                <Form.Group key={`${event.type}-${i}`}>
                  <Icon
                    name="delete"
                    size="large"
                    onClick={() => this.removeSubmission(i)}
                  />
                  <Form.Field inline>
                    <Form.Select
                      label="Type"
                      options={formOptions}
                      placeholder={event.type}
                      onChange={(e, {value}) =>
                        this.updateSubmission(i, 'type', value)
                      }
                    />
                  </Form.Field>
                  {!!details ? (
                    <React.Fragment>
                      <Form.Field inline>
                        <div className="id-details__submit-date-picker field">
                          <label>Date of {event.resourceType}</label>
                          <DatePicker
                            selected={this.state.submissions[i].date}
                            onChange={date =>
                              this.updateSubmission(i, 'date', date)
                            }
                          />
                        </div>
                      </Form.Field>
                      <Form.Field inline>
                        <label>{details.text}</label>
                        {this.getInputType(details, i)}
                      </Form.Field>
                    </React.Fragment>
                  ) : null}
                </Form.Group>
              );
            })}
            <div className="id-details__submit-buttons">
              <Button primary onClick={this.addSubmission}>
                <Icon name="plus" />
                Add Data Point
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
  baseUrl: PropTypes.string.isRequired,
};

SubmitPatientData.defaultProps = {
  payload: {},
};

export default SubmitPatientData;
