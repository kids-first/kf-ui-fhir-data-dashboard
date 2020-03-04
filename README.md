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

## Development

This application utilizes `create-react-app`. To run it, install the dependencies
and start the server:

```
npm install
npm start
```

This will open up the application at `localhost:3000`.
More on `create-react-app` [here](https://reactjs.org/docs/create-a-new-react-app.html).

### Auth

To use FHIR servers that require auth, set the `REACT_APP_KF_USER` and `REACT_APP_KF_PW`
environment variables to the appropriate username and password, respectively. The
app will use this and Basic Auth to make requests.

### FHIR APIs

Creating a data dashboard over the FHIR API standard means that a user potentially
has the ability to search over multiple datasets. This application can be launched
over any FHIR server. To use a specific FHIR server, set the `REACT_APP_FHIR_API`
from the command line to the base url of the server. An empty variable will default
to the Kids First FHIR server.
