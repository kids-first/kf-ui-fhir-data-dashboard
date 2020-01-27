import { proxyUrl, oAuthUrl, baseResourceSchemaUrl } from '../config';

const fetchToken = async () => new Promise(() => {
    fetch(`${proxyUrl}${oAuthUrl}`, {
      method: 'POST',
      body: JSON.stringify({ 'grantType' : 'client_credentials', 'scopes' : 'user/*.read' }),
      headers: {
        'Accept': 'application/json',
        'Authorization': `Basic ${process.env.REACT_APP_SECRET}`,
        'Content-Type': 'application/json',
        'Origin': 'https://localhost:3000'
      },
    })
    .then(res => res.json())
    .then(data => {
      sessionStorage.setItem('accessToken', data.access_token);
      return;
    });
});

const fetchWithHeaders = async (url, headers) =>
  fetch(`${proxyUrl}${url}`, {
    headers: {
      ...headers,
      'Authorization': `Bearer ${sessionStorage.getItem('accessToken')}`,
    },
  })
    .then(res => {
      if (!res.ok) { throw res; }
      return res.json();
    })
    .then(data => data)
    .catch(err => {
      console.log('Error', err);
      if (err.status === 401) {
        return fetchToken().then(fetchWithHeaders(url));
      }
    });

export const fetchResource = async url =>
  fetchWithHeaders(url, {
    'Accept': 'application/fhir+json;charset=utf-8',
    'Content-Type': 'application/fhir+json;charset=utf-8'
  })

export const fetchSchema = resourceType =>
  fetchWithHeaders(baseResourceSchemaUrl(resourceType)).then(data =>
    data && data.differential && data.differential.element ? data.differential.element : null
  );
