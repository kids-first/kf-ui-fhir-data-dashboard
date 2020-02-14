<p align="center">
  <img src="public/fhir-data-dashboard.svg" alt="data tracker logo" width="660px">
</p>
<p align="center">
  <a href="https://github.com/kids-first/kf-ui-fhir-data-dashboard/blob/master/LICENSE"><img src="https://img.shields.io/github/license/kids-first/kf-ui-fhir-data-dashboard.svg?style=for-the-badge"></a>
  <a href="https://circleci.com/gh/kids-first/kf-ui-fhir-data-dashboard"><img src="https://img.shields.io/circleci/project/github/kids-first/kf-ui-fhir-data-dashboard.svg?style=for-the-badge"></a>
  <a href="https://codecov.io/gh/kids-first/kf-ui-fhir-data-dashboard"><img src="https://img.shields.io/codecov/c/gh/kids-first/kf-ui-fhir-data-dashboard?style=for-the-badge"></a>
</p>

# Kids First FHIR Data Dashboard

💡📊A prototype data dashboard for any FHIR server. Spin this up in front of your server so people can get a quick visual understanding of what's in this server.

## Development

This application utilizes `create-react-app`. To run it, install the dependencies
and start the server:

```
npm install
npm start
```

This will open up the application at `localhost:3000`.
More on `create-react-app` [here](https://reactjs.org/docs/create-a-new-react-app.html).

### FHIR APIs

Creating a data dashboard over the FHIR API standard means that a user potentially
has the ability to search over multiple datasets. This application has the ability
to utilize either the [HAPI FHIR API](http://hapi.fhir.org/) or [Synthea's FHIR API](https://synthea.mitre.org/) from SyntheticMass. To switch between the two,
set the `REACT_APP_FHIR_API` from the command line, with the options being
`hapi`, `synthea`, or empty. An empty variable will default to `synthea`.

Due to issues with cross origin requests, a "proxy url" is used instead of hitting the
API endpoints directly.

### Authentication with Synthea

Utilizing the Synthea FHIR API requires a token. Generating the OAuth token is built into
the app, but the API key and secret pair must be generated manually from the website.

1. Go to the [Synthea](https://synthea.mitre.org/) website and register for a free account.
2. Navigate to the Apps page, located under your email address.
3. Create a new App if not already created. This will generate an API key/secret pair.
4. Produce the base64 encoded value of your API key and secret pair separated by a semicolon (ie. `APIKey123:APISecret456`).
5. This is the value that will be used to get OAuth tokens from Synthea. Set this as the environment
   variable `REACT_APP_SECRET` for local development.
