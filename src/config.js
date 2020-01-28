export const proxyUrl = 'https://damp-castle-44220.herokuapp.com/';
export const oAuthUrl = 'https://syntheticmass.mitre.org/oauth2/accesstoken';
export const baseResource = 'Patient';
export const numberOfResultsPerPage = 20;

const synthea = 'https://syntheticmass.mitre.org/v1/fhir/';
const hapi = 'http://hapi.fhir.org/baseR4/';
const getBaseUrl = () => {
  if (
    !process.env.REACT_APP_FHIR_API ||
    process.env.REACT_APP_FHIR_API === 'synthea'
  ) {
    return synthea;
  }
  return hapi;
};

export const baseUrl = getBaseUrl();

export const baseResourceDisplayFields = [
  'id',
  'address',
  'birthDate',
  'communication',
  'gender',
  'maritalStatus',
  'multipleBirthBoolean',
  'name',
  'telecom',
];

export const omittedFields = ['coding', 'extension', 'use'];
