# FHIR Data Dashboard

## Product Requirements Document

### Background

[FHIR](http://hl7.org/fhir/) is a standard created by HL7 that enables a common data representation and associated APIs across diverse biomedical datasets. FHIR also provides core set of concepts in the biomedical space, with the capacity for extensibility that allows for self-describing data model customization when needed. With the appropriate tooling and services, this provides the potential for interoperability among different clinical and research studies and institutions. Using a standard data representation greatly alleviates current pain points by reducing the manual work involved in transcribing and mapping from one data model to another. Increased interoperability allows for a wider ecosystem of reusable tools, as well as automation around data discovery and analysis. FHIR is the ideal standard as it has existing infrastructure, community, and documents supporting it, is technology agnostic, and is extensible to fit multiple use cases.

### Description

The FHIR Data Dashboard is an open source web application that utilizes the FHIR search API standard. The goal is to provide a UI that can connect to any FHIR server to describe its contents. Generally, the UI should allow users that are interested in a data set to see an overview of what data is in that data set and what the data model looks like, without having deep technical knowledge about FHIR. Utilizing this dashboard, researchers could discover new data sets and quickly determine if those data sets contain valuable information that would aid in their research. Users could also fetch from more than one FHIR server to do a comparative analysis between data sets, which could aid with various goals including data model changes and data analysis over multiple data sets.

### Use Cases

| #   | Use Case(s)                                                                                                                                                                                                          |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | As an exploratory researcher, I want to be able to easily view high level information about a data set in order to determine if it is useful to my research.                                                         |
| 2   | As a data engineer, I want to be able to compare a new version of my data model to the current version to be able to more easily do data migration.                                                                  |
| 3   | As a researcher, I want to see how two data sets and their data models are different from each other, and use this as a guide as I do an analysis over the two data sets.                                            |
| 4   | As an exploratory researcher, I want to be able to see what ontologies are in a data model, so that I can determine if the data set includes information necessary for my research.                                  |
| 5   | As a researcher, I want to be able to see an overview of multiple data sets, to determine if doing an analysis over the datasets would yield notable scientific discoveries.                                         |
| 6   | As a data modeler, I want to be able to view aggregations of data in general resources (such as Observation) and drill down to specific entities in order to identify concrete use cases for data model adjustments. |

### Design Specifications and Diagrams

[See the technical design document here.](./design.md)

### Outstanding Questions

1. What are the next steps for a user after viewing an overview of the data in a FHIR server? Discussions have mentioned: \
   a. Requesting access to a data set \
   b. Syncing resources across FHIR servers \
   c. Bulk download of data \
   d. Exporting data to a Jupyter notebook \
2. If we tackle any of 1a-1d, what is the value add, or product differentiation? There are multiple tools in this space (Kids First/Cavatica, Gen3, Gen3/Terra) that allow for a user to request access to data, download data, or export data to an analysis platform of the user’s choosing.
3. Are we trying to “sell” this dashboard, or the idea of utilizing FHIR? If it is to prove FHIR’s utility, should maybe focus on the pipeline as opposed to the UI: \
   a. Ie. Given an arbitrary data model and data set in a FHIR server, can connect this UI to it and also display data sets from other connected FHIR servers combined with other data sets \
   b. Under the hood, this means ingesting the arbitrary data and data model, converting it to a FHIR data model, and then pointing the dashboard to the converted FHIR data model \
   c. At a high level, the selling point is that data models in any form can be combined and a snapshot of the combined data sets can be quickly visualized, without manual migration \
   d. (Far) Down the road, this could mean easy data analysis across multiple data sets, regardless of their original format and model
