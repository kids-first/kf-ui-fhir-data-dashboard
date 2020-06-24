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
  // *{key: 'Abdominal pain', text: 'Abdominal pain', value: 'Abdominal pain'},
  // *{key: 'Vomiting', text: 'Vomiting', value: 'Vomiting'},
  // *{key: 'Diarrhea', text: 'Diarrhea', value: 'Diarrhea'},
  // *{key: 'Rash', text: 'Rash', value: 'Rash'},
  // *{key: 'Bloodshot eyes', text: 'Bloodshot eyes', value: 'Bloodshot eyes'},
  // *{
  //   key: 'Feeling extra tired',
  //   text: 'Feeling extra tired',
  //   value: 'Feeling extra tired',
  // },
  // *{
  //   key: 'Trouble breathing',
  //   text: 'Trouble breathing',
  //   value: 'Trouble breathing',
  // },
  // {
  //   key: 'Pain/pressure in the chest',
  //   text: 'Pain/pressure in the chest',
  //   value: 'Pain/pressure in the chest',
  // },
  // {key: 'New confusion', text: 'New confusion', value: 'New confusion'},
  // {
  //   key: 'Inability to wake or stay awake',
  //   text: 'Inability to wake or stay awake',
  //   value: 'Inability to wake or stay awake',
  // },
  // {
  //   key: 'Blush lips or face',
  //   text: 'Blush lips or face',
  //   value: 'Blush lips or face',
  // },
  // {
  //   key: 'Severe abdominal pain',
  //   text: 'Severe abdominal pain',
  //   value: 'Severe abdominal pain',
  // },
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
    text: 'Present?',
    type: 'radio',
    labels: ['Yes', 'No'],
    resourceType: 'Condition',
  },
  // 'Abdominal pain': {
  //   text: 'Present?',
  //   type: 'radio',
  //   labels: ['Yes', 'No'],
  // },
  // Vomiting: {text: 'Present?', type: 'radio', labels: ['Yes', 'No']},
  // Diarrhea: {text: 'Present?', type: 'radio', labels: ['Yes', 'No']},
  // Rash: {text: 'Present?', type: 'radio', labels: ['Yes', 'No']},
  // 'Bloodshot eyes': {
  //   text: 'Present?',
  //   type: 'radio',
  //   labels: ['Yes', 'No'],
  // },
  // 'Feeling extra tired': {
  //   text: 'Present?',
  //   type: 'radio',
  //   labels: ['Yes', 'No'],
  // },
  // 'Trouble breathing': {
  //   text: 'Present?',
  //   type: 'radio',
  //   labels: ['Yes', 'No'],
  // },
  // 'Pain/pressure in the chest': {
  //   text: 'Present?',
  //   type: 'radio',
  //   labels: ['Yes', 'No'],
  // },
  // 'New confusion': {text: 'Present?', type: 'radio', labels: ['Yes', 'No']},
  // 'Inability to wake or stay awake': {
  //   text: 'Present?',
  //   type: 'radio',
  //   labels: ['Yes', 'No'],
  // },
  // 'Blush lips or face': {
  //   text: 'Present?',
  //   type: 'radio',
  //   labels: ['Yes', 'No'],
  // },
  // 'Severe abdominal pain': {
  //   text: 'Present?',
  //   type: 'radio',
  //   labels: ['Yes', 'No'],
  // },
};

class SubmitPatientData extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      submissions: [],
      messageContent: null,
      submitting: false,
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
            `http://localhost:8000/${resource.resourceType}`,
            resource,
            this.state.abortController,
          )
            .then(() => (successNum += 1))
            .catch(err => {
              logErrors('Error submitting data point:', err);
            });
        }),
      ).then(() => {
        this.setState({submitting: false}, () => {
          this.showSuccess(successNum);
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
      clinicalStatus: {
        coding: [
          {
            system: 'http://terminology.hl7.org/CodeSystem/condition-clinical',
            code: 'resolved',
          },
        ],
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
        fields = {
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
        fields = {
          code: {
            coding: [
              {
                system: 'http://snomed.info/sct',
                code: '386661006',
                display: 'Fever (finding)',
              },
            ],
            text: 'Fever (finding)',
          },
          valueBoolean: event.value === 'Yes' ? true : false,
        };
        break;
      default:
        fields = {};
        break;
    }
    return fields;
  };

  showSuccess = num => {
    if (num > 0) {
      this.setState({
        submissions: [],
        messageContent: `Successfully submitted ${num} data points.`,
      });
    }
  };

  render() {
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
                    <div className="id-details__submit-date-picker field">
                      <label>Date of Observation</label>
                      <DatePicker
                        selected={this.state.submissions[i].date}
                        onChange={date =>
                          this.updateSubmission(i, 'date', date)
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
                        this.updateSubmission(i, 'type', value)
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
              <Button primary onClick={this.addSubmission}>
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
