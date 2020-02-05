export const oAuthUrl = 'https://syntheticmass.mitre.org/oauth2/accesstoken';
export const numberOfResultsPerPage = 20;

const synthea = 'https://syntheticmass.mitre.org/v1/fhir/';
const hapi = 'http://hapi.fhir.org/baseR4/';
const getBaseUrl = () => {
  if (
    !process.env.REACT_APP_FHIR_API ||
    process.env.REACT_APP_FHIR_API === 'hapi'
  ) {
    return hapi;
  } else if (process.env.REACT_APP_FHIR_API === 'synthea') {
    return synthea;
  }
  return process.env.REACT_APP_FHIR_API;
};

const useProxyUrl = () => {
  if (
    !process.env.REACT_APP_FHIR_API ||
    process.env.REACT_APP_FHIR_API === 'hapi' ||
    process.env.REACT_APP_FHIR_API === 'synthea'
  ) {
    return true;
  }
  return false;
};

export const baseUrl = getBaseUrl();
export const proxyUrl = useProxyUrl()
  ? 'https://damp-castle-44220.herokuapp.com/'
  : '';
export const schemaUrl = `${baseUrl}StructureDefinition/`;

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

export const acceptedResourceTypes = [
  'Account',
  'ActivityDefinition',
  'AdverseEvent',
  'AllergyIntolerance',
  'Appointment',
  'AppointmentResponse',
  'AuditEvent',
  'Basic',
  'Binary',
  'BiologicallyDerivedProduct',
  'BodyStructure',
  'Bundle',
  'CapabilityStatement',
  'CarePlan',
  'CareTeam',
  'CatalogEntry',
  'ChargeItem',
  'ChargeItemDefinition',
  'Claim',
  'ClaimResponse',
  'ClinicalImpression',
  'CodeSystem',
  'Communication',
  'CommunicationRequest',
  'CompartmentDefinition',
  'Composition',
  'ConceptMap',
  'Condition',
  'Consent',
  'Contract',
  'Coverage',
  'CoverageEligibilityRequest',
  'CoverageEligibilityResponse',
  'DetectedIssue',
  'Device',
  'DeviceDefinition',
  'DeviceMetric',
  'DeviceRequest',
  'DeviceUseStatement',
  'DiagnosticReport',
  'DocumentManifest',
  'DocumentReference',
  'EffectEvidenceSynthesis',
  'Encounter',
  'Endpoint',
  'EnrollmentRequest',
  'EnrollmentResponse',
  'EpisodeOfCare',
  'EventDefinition',
  'Evidence',
  'EvidenceVariable',
  'ExampleScenario',
  'ExplanationOfBenefit',
  'FamilyMemberHistory',
  'Flag',
  'Goal',
  'GraphDefinition',
  'Group',
  'GuidanceResponse',
  'HealthcareService',
  'ImagingStudy',
  'Immunization',
  'ImmunizationEvaluation',
  'ImmunizationRecommendation',
  'ImplementationGuide',
  'InsurancePlan',
  'Invoice',
  'Library',
  'Linkage',
  'List',
  'Location',
  'Measure',
  'MeasureReport',
  'Media',
  'Medication',
  'MedicationAdministration',
  'MedicationDispense',
  'MedicationKnowledge',
  'MedicationRequest',
  'MedicationStatement',
  'MedicinalProduct',
  'MedicinalProductAuthorization',
  'MedicinalProductContraindication',
  'MedicinalProductIndication',
  'MedicinalProductIngredient',
  'MedicinalProductInteraction',
  'MedicinalProductManufactured',
  'MedicinalProductPackaged',
  'MedicinalProductPharmaceutical',
  'MedicinalProductUndesirableEffect',
  'MessageDefinition',
  'MessageHeader',
  'MolecularSequence',
  'NamingSystem',
  'NutritionOrder',
  'Observation',
  'ObservationDefinition',
  'OperationDefinition',
  'OperationOutcome',
  'Organization',
  'OrganizationAffiliation',
  'Parameters',
  'Patient',
  'PaymentNotice',
  'PaymentReconciliation',
  'Person',
  'PlanDefinition',
  'Practitioner',
  'PractitionerRole',
  'Procedure',
  'Provenance',
  'Questionnaire',
  'QuestionnaireResponse',
  'RelatedPerson',
  'RequestGroup',
  'ResearchDefinition',
  'ResearchElementDefinition',
  'ResearchStudy',
  'ResearchSubject',
  'RiskAssessment',
  'RiskEvidenceSynthesis',
  'Schedule',
  'SearchParameter',
  'ServiceRequest',
  'Slot',
  'Specimen',
  'SpecimenDefinition',
  'StructureDefinition',
  'StructureMap',
  'Subscription',
  'Substance',
  'SubstanceNucleicAcid',
  'SubstancePolymer',
  'SubstanceProtein',
  'SubstanceReferenceInformation',
  'SubstanceSourceMaterial',
  'SubstanceSpecification',
  'SupplyDelivery',
  'SupplyRequest',
  'Task',
  'TerminologyCapabilities',
  'TestReport',
  'TestScript',
  'ValueSet',
  'VerificationResult',
  'VisionPrescription',
];

export const resourceCategories = {
  Foundation: {
    Conformance: [
      'CapabilityStatement',
      'StructureDefinition',
      'ImplementationGuide',
      'SearchParameter',
      'MessageDefinition',
      'OperationDefinition',
      'CompartmentDefinition',
      'StructureMap',
      'GraphDefinition',
      'ExampleScenario',
    ],
    Terminology: [
      'CodeSystem',
      'ValueSet',
      'ConceptMap',
      'NamingSystem',
      'TerminologyCapabilities',
    ],
    Security: ['Provenance', 'AuditEvent', 'Consent'],
    Documents: [
      'Composition',
      'DocumentManifest',
      'DocumentReference',
      'CatalogEntry',
    ],
    Other: [
      'Basic',
      'Binary',
      'Bundle',
      'Linkage',
      'MessageHeader',
      'OperationOutcome',
      'Parameters',
      'Subscription',
    ],
  },
  Base: {
    Individuals: [
      'Patient',
      'Practitioner',
      'PractitionerRole',
      'RelatedPerson',
      'Person',
      'Group',
    ],
    'Entities 1': [
      'Organization',
      'OrganizationAffiliation',
      'HealthcareService',
      'Endpoint',
      'Location',
    ],
    'Entities 2': [
      'Substance',
      'BiologicallyDerivedProduct',
      'Device',
      'DeviceMetric',
    ],
    Workflow: [
      'Task',
      'Appointment',
      'AppointmentResponse',
      'Schedule',
      'Slot',
      'VerificationResult',
    ],
    Management: ['Encounter', 'EpisodeOfCare', 'Flag', 'List', 'Library'],
  },
  Clinical: {
    Summary: [
      'AllergyIntolerance',
      'AdverseEvent',
      'Condition',
      'Procedure',
      'FamilyMemberHistory',
      'ClinicalImpression',
      'DetectedIssue',
    ],
    Diagnostics: [
      'Observation',
      'Media',
      'DiagnosticReport',
      'Specimen',
      'BodyStructure',
      'ImagingStudy',
      'QuestionnaireResponse',
      'MolecularSequence',
    ],
    Medications: [
      'MedicationRequest',
      'MedicationAdministration',
      'MedicationDispense',
      'MedicationStatement',
      'Medication',
      'MedicationKnowledge',
      'Immunization',
      'ImmunizationEvaluation',
      'ImmunizationRecommendation',
    ],
    'Care Provision': [
      'CarePlan',
      'CareTeam',
      'Goal',
      'ServiceRequest',
      'NutritionOrder',
      'VisionPrescription',
      'RiskAssessment',
      'RequestGroup',
    ],
    'Request & Response': [
      'Communication',
      'CommunicationRequest',
      'DeviceRequest',
      'DeviceUseStatement',
      'GuidanceResponse',
      'SupplyRequest',
      'SupplyDelivery',
    ],
  },
  Financial: {
    Support: [
      'Coverage',
      'CoverageEligibilityRequest',
      'CoverageEligibilityResponse',
      'EnrollmentRequest',
      'EnrollmentResponse',
    ],
    Billing: ['Claim', 'ClaimResponse', 'Invoice'],
    Payment: ['PaymentNotice', 'PaymentReconciliation'],
    General: [
      'Account',
      'ChargeItem',
      'ChargeItemDefinition',
      'Contract',
      'ExplanationOfBenefit',
      'InsurancePlan',
    ],
  },
  Specialized: {
    'Public Health & Research': ['ResearchStudy', 'ResearchSubject'],
    'Definitional Artifacts': [
      'ActivityDefinition',
      'DeviceDefinition',
      'EventDefinition',
      'ObservationDefinition',
      'PlanDefinition',
      'Questionnaire',
      'SpecimenDefinition',
    ],
    'Evidence Based Medicine': [
      'ResearchDefinition',
      'ResearchElementDefinition',
      'Evidence',
      'EvidenceVariable',
      'EffectEvidenceSynthesis',
      'RiskEvidenceSynthesis',
    ],
    'Quality Reporting & Testing': [
      'Measure',
      'MeasureReport',
      'TestScript',
      'TestReport',
    ],
    'Medication Definition': [
      'MedicinalProduct',
      'MedicinalProductAuthorization',
      'MedicinalProductContraindication',
      'MedicinalProductIndication',
      'MedicinalProductIngredient',
      'MedicinalProductInteraction',
      'MedicinalProductManufactured',
      'MedicinalProductPackaged',
      'MedicinalProductPharmaceutical',
      'MedicinalProductUndesirableEffect',
      'SubstanceNucleicAcid',
      'SubstancePolymer',
      'SubstanceProtein',
      'SubstanceReferenceInformation',
      'SubstanceSpecification',
      'SubstanceSourceMaterial',
    ],
  },
};
