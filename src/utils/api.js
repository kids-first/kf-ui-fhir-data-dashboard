import {shouldUseProxyUrl, proxyUrl} from '../config';

const fetchWithHeaders = async (url, headers, summary = false) => {
  let fullUrl = shouldUseProxyUrl(url) ? `${proxyUrl}${url}` : `${url}`;
  if (summary && !fullUrl.includes('_summary')) {
    fullUrl = fullUrl
      .concat(`${url.includes('?') ? '&' : '?'}`)
      .concat('_summary=count');
  }
  const encodedStr = btoa(
    `${process.env.REACT_APP_KF_USER}:${process.env.REACT_APP_KF_PW}`,
  );
  return fetch(`${fullUrl}`, {
    headers: {
      ...headers,
      Authorization: `Basic ${encodedStr}`,
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

export const getOntologies = async url =>
  fetchAllResources(url, []).then(data =>
    data
      .map(item => item.resource)
      .map(resource => ({name: resource.name, url: resource.url})),
  );
