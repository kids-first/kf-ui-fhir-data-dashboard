<p align="center">
  <img src="public/fhir-data-dashboard.svg" alt="FHIR Data Dashboard logo" width="660px">
</p>
<p align="center">
  <a href="https://github.com/kids-first/kf-ui-fhir-data-dashboard/blob/master/LICENSE"><img src="https://img.shields.io/github/license/kids-first/kf-ui-fhir-data-dashboard.svg?style=for-the-badge"></a>
  <a href="https://circleci.com/gh/kids-first/kf-ui-fhir-data-dashboard"><img src="https://img.shields.io/circleci/project/github/kids-first/kf-ui-fhir-data-dashboard.svg?style=for-the-badge"></a>
  <a href="https://codecov.io/gh/kids-first/kf-ui-fhir-data-dashboard"><img src="https://img.shields.io/codecov/c/gh/kids-first/kf-ui-fhir-data-dashboard?style=for-the-badge"></a>
</p>

# Kids First FHIR Data Dashboard

💡📊A prototype data dashboard for any FHIR server. Spin this up in front of your server so people can get a quick visual understanding of what's in this server.

## Getting Started

If you want to run the dashboard app and don't want to install
dependencies directly on your machine, you can spin up the Dockerized dashboard
app:

```shell
docker-compose up -d
```

This will launch an NGINX container serving your app at `http://localhost:3000`
By default the app points to a local FHIR server at `http://localhost:8000`.

If you want to change the FHIR server behind the app, you can set the build args
(see [FHIR APIs](#FHIR-APIs)) in the `docker-compose.yml` file.

### FHIR APIs

Creating a data dashboard over the FHIR API standard means that a user potentially
has the ability to search over datasets from different FHIR servers.
This application can be launched over any FHIR server. To use a specific FHIR
server, set the following environment variables
(also found at `/src/.env.example`):

`REACT_APP_FHIR_API`: The url at which the FHIR server is located<br>
`REACT_APP_FHIR_API_NAME`: The display name of the FHIR server<br>
`REACT_APP_FHIR_API_AUTH_TYPE`: The two options for this are `NO_AUTH` or `BASIC_AUTH`

The default server on startup if these variables are empty is the Kids First server.
Servers are configurable and more can be added after startup.

## Development

If you are developing, you will need to setup your development
environment on your machine. This application utilizes `create-react-app`.
To run it, install the dependencies and start the server on your machine:

```
npm install
npm start
```

This will open up the application at `localhost:3000`.
More on `create-react-app` [here](https://reactjs.org/docs/create-a-new-react-app.html).

### Tests

The dashboard uses [Cypress](https://www.cypress.io/) and the local development server to run frontend tests. To open Cypress, use the command:

`npm run cypress:open`

This will pull up an interactive window for running tests. You must also be running the dashboard locally at `http://localhost:3000` to run the tests. Click on any of the tests listed to execute them.
