export const proxyUrl = 'https://damp-castle-44220.herokuapp.com/';
// export const baseUrl = 'https://syntheticmass.mitre.org/v1/fhir/';
export const baseUrl = 'http://hapi.fhir.org/baseR4/';
export const oAuthUrl = 'https://syntheticmass.mitre.org/oauth2/accesstoken';
export const baseResource = 'Patient';

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

export const omittedFields = [
  'coding',
  'extension',
  'use',
];
