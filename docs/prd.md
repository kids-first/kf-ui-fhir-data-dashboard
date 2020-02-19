# FHIR Data Dashboard

## Prototype Requirements Document

### Background

FHIR is a standard created by HL7 that allows for a consistent data model structure and format, as well as a consistent data search API, across many different biomedical fields and institutions. Using a standard data model greatly alleviates the pain points in understanding different data models, and reduces the manual work involved in transcribing and mapping from one data model to another. A standard data model combined with a standard API allows for increased interoperability, as well as automation around data discovery and analysis. FHIR is the ideal standard as it has existing infrastructure and documents supporting it, is technology agnostic, and is easily extensible to fit multiple use cases.

### Value Statement

The FHIR Data Dashboard is an open source web application that utilizes the FHIR search API standard. The goal is to put a UI on top of any FHIR server. It allows users that are interested in a data set to see an overview of what data is in that data set and what the data model looks like, without having to manually examine the data or schema in depth. Utilizing this dashboard, researchers could discover new data sets and quickly determine if those data sets contain valuable information that would aid in their research. Users could also fetch from more than one FHIR server to do a comparative analysis between data sets, which could aid with various goals including data model changes and data analysis over multiple data sets.

### Use Cases

1. As an exploratory researcher, I want to be able to easily view high level information about a data set in order to determine if it is useful to my research.
2. As a data engineer, I want to be able to compare a new version of my data model to the current version to be able to more easily do data migration.
3. As a researcher, I want to see how two data models are different from each other, and use this as a guide as I do an analysis over the two data sets.
4. As an exploratory researcher, I want to be able to see what ontologies are in a data model, so that I can determine if the data set includes information necessary for my research.
5. As a researcher, I want to be able to see an overview of multiple datasets, to see if doing an analysis over the datasets would yield notable scientific discoveries.

### Outstanding Questions

1. What are the next steps for a user after viewing an overview of the data in a FHIR server? Discussions have mentioned: \
   a. Requesting access to a data set \
   b. Syncing resources across FHIR servers \
   c. Bulk download of data \
   d. Exporting data to a Jupyter notebook
2. If we tackle any of 1a-1d, what is the value add, or product differentiation? There are multiple tools in this space (Kids First/Cavatica, Gen3, Gen3/Terra) that allow for a user to request access to data, download data, or export data to an analysis platform of the user’s choosing.
3. Are we trying to “sell” this dashboard, or the idea of utilizing FHIR? If it is to prove FHIR’s utility, should maybe focus on the pipeline as opposed to the UI: \
   a. Ie. Given an arbitrary data model and data set, can put this UI on top of it and this UI can also display the data set combined with other data sets \
   b. Under the hood, this means ingesting the arbitrary data and data model, converting it to a FHIR data model, and then pointing the dashboard to the converted FHIR data model \
   c. At a high level, the selling point is that data models in any form can be combined and a snapshot of the combined data sets can be quickly visualized, without manual migration \
   d. (Far) Down the road, this could mean easy data analysis across multiple data sets, regardless of their original format and model

### Technical Design

[See the technical design document here.](./design.md)
