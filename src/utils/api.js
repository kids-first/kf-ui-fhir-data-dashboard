import { proxyUrl, oAuthUrl } from '../config';

const fetchToken = async (callback) => fetch(`${proxyUrl}${oAuthUrl}`, {
  method: 'POST',
  body: JSON.stringify({
    grantType: 'client_credentials',
    scopes: 'user/*.read',
  }),
  headers: {
    Accept: 'application/json',
    Authorization: `Basic ${process.env.REACT_APP_SECRET}`,
    'Content-Type': 'application/json',
    Origin: 'https://localhost:3000',
  },
})
  .then((res) => res.json())
  .then((data) => {
    sessionStorage.setItem('accessToken', data.access_token);
    return callback();
  });

const fetchWithHeaders = async (url, headers) => fetch(`${proxyUrl}${url}`, {
  headers: {
    ...headers,
    Authorization: `Bearer ${sessionStorage.getItem('accessToken')}`,
  },
})
  .then((res) => res.json())
  .then((data) => data)
  .catch(() => fetchToken(() => fetchWithHeaders(url)));

const fetchResource = async (url) => fetchWithHeaders(url, {
  Accept: 'application/fhir+json;charset=utf-8',
  'Content-Type': 'application/fhir+json;charset=utf-8',
});

export default fetchResource;
