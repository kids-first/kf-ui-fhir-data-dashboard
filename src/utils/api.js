import {shouldUseProxyUrl, proxyUrl, oAuthUrl} from '../config';

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

const fetchWithHeaders = async (url, headers, summary = false) => {
  let fullUrl = shouldUseProxyUrl(url) ? `${proxyUrl}${url}` : `${url}`;
  if (summary && !fullUrl.includes('_summary')) {
    fullUrl = fullUrl
      .concat(`${url.includes('?') ? '&' : '?'}`)
      .concat('_summary=count');
  }
  return fetch(`${fullUrl}`, {
    headers: {
      ...headers,
      Authorization: `Bearer ${sessionStorage.getItem('accessToken')}`,
      'Cache-Control': 'max-age=3600',
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

export const fetchResource = async (url, summary = false) =>
  fetchWithHeaders(
    url,
    {
      Accept: 'application/fhir+json;charset=utf-8',
      'Content-Type': 'application/fhir+json;charset=utf-8',
    },
    summary,
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
  fetchResource(url, true).then(data => (data ? data.total : 0));

export const getSearchParams = async url =>
  fetchResource(url).then(data =>
    data && data.entry ? data.entry.map(x => x.resource.code) : [],
  );

export const getCapabilityStatement = async (url, resourceType) =>
  fetchResource(url).then(data => {
    let params =
      data && data.rest && data.rest[0] && data.rest[0].resource
        ? data.rest[0].resource.find(x => x.type === resourceType)
        : [];
    return params.searchParam ? params.searchParam : [];
  });
