import {shouldUseProxyUrl, proxyUrl, fhirUrl} from '../config';
import store from '../store';

const fetchWithHeaders = async (url, headers, summary = false) => {
  let fullUrl = shouldUseProxyUrl(url) ? `${proxyUrl}${url}` : `${url}`;
  if (summary && !fullUrl.includes('_summary')) {
    fullUrl = fullUrl
      .concat(`${url.includes('?') ? '&' : '?'}`)
      .concat('_summary=count');
  }
  const token = store.getState().user.token;
  return fetch(`${fullUrl}`, {
    headers: {
      ...headers,
      Authorization: `Basic ${token}`,
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

export const getCapabilityStatementSearchParams = async (url, resourceType) =>
  fetchResource(url).then(data => {
    let params =
      data && data.rest && data.rest[0] && data.rest[0].resource
        ? data.rest[0].resource.find(x => x.type === resourceType)
        : [];
    return params && params.searchParam ? params.searchParam : [];
  });

export const getOntologies = async url =>
  fetchAllResources(url, []).then(data =>
    data
      .map(item => item.resource)
      .map(resource => ({name: resource.name, url: resource.url})),
  );

export const getCapabilityStatementReferences = async (url, resourceType) =>
  fetchResource(url).then(data => {
    let references =
      data && data.rest && data.rest[0] && data.rest[0].resource
        ? data.rest[0].resource.filter(x =>
            x.searchInclude.includes(`${x.type}:${resourceType.toLowerCase()}`),
          )
        : [];
    return references;
  });

export const getReferencedBy = async (url, baseType, id) => {
  let allReferences = await getCapabilityStatementReferences(
    `${url}metadata`,
    baseType,
  );
  let resourceReferences = await Promise.all(
    allReferences.map(async ref => {
      const data = await fetchAllResources(
        `${url}${ref.type}?${baseType.toLowerCase()}=${baseType}/${id}`,
        [],
      );
      return data.flat();
    }),
  );
  resourceReferences = [].concat
    .apply([], resourceReferences)
    .map(item => item.resource)
    .map(item => ({
      ...item,
      profile:
        item.meta && item.meta.profile
          ? item.meta.profile
          : [`${fhirUrl}${item.resourceType}`],
    }));
  resourceReferences = await Promise.all(
    resourceReferences.map(async ref => {
      const data = await fetchResource(
        `${url}StructureDefinition?url=${ref.profile[0]}`,
      );
      const name =
        data && data.entry && data.entry[0] && data.entry[0].resource
          ? data.entry[0].resource.name
          : null;
      return {...ref, name};
    }),
  );
  return resourceReferences.filter(ref => ref.name);
};

export const userIsAuthorized = (username, password, baseUrl) => {
  const token = btoa(`${username}:${password}`);
  return fetch(`${baseUrl}StructureDefinition`, {
    headers: {
      Authorization: `Basic ${token}`,
    },
  })
    .then(res => {
      if (res.status !== 200) {
        throw res;
      }
      return {isAuthorized: true, error: null};
    })
    .catch(error => ({
      isAuthorized: false,
      error,
    }));
};
