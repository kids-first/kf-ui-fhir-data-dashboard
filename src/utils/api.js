import {proxyUrl, oAuthUrl, numberOfResultsPerPage} from '../config';

const fetchToken = async callback =>
  fetch(`${proxyUrl}${oAuthUrl}`, {
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
    .then(res => res.json())
    .then(data => {
      sessionStorage.setItem('accessToken', data.access_token);
      return callback();
    });

const fetchWithHeaders = async (url, headers) => {
  let fullUrl = `${proxyUrl}${url}`;
  if (!fullUrl.includes('_count')) {
    fullUrl = fullUrl
      .concat(`${url.includes('?') ? '&' : '?'}`)
      .concat(`_count=${numberOfResultsPerPage}&_total=accurate`);
  }
  return fetch(`${fullUrl}`, {
    headers: {
      ...headers,
      Authorization: `Bearer ${sessionStorage.getItem('accessToken')}`,
    },
  })
    .then(res => {
      if (res.status !== 200) {
        throw res;
      }
      return res.json();
    })
    .then(data => data)
    .catch(err => {
      console.log('Error:', err);
      if (err.status === 401) {
        return fetchToken(() => fetchWithHeaders(url));
      }
      return err;
    });
};

export const fetchResource = async (url, headers) =>
  fetchWithHeaders(
    url,
    headers
      ? headers
      : {
          Accept: 'application/fhir+json;charset=utf-8',
          'Content-Type': 'application/fhir+json;charset=utf-8',
        },
  );

export const fetchAllResources = async (url, allData) =>
  fetchResource(url).then(data => {
    if (data && data.entry) {
      allData = allData.concat(data.entry);
      const nextPage = data.link.findIndex(x => x.relation === 'next');
      if (nextPage > -1) {
        const nextPageUrl = data.link[nextPage].url.replace(
          'localhost',
          '10.10.1.191',
        );
        return fetchAllResources(nextPageUrl, allData);
      }
    }
    return allData;
  });

export const getResourceCount = async url =>
  fetchResource(url).then(data => (data ? data.total : 0));
