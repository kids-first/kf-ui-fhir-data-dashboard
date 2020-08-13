import {shouldUseProxyUrl, proxyUrl, fhirUrl} from '../config';
import {logErrors, replaceLocalhost} from '../utils/common';
import store from '../store';

const getHeaders = headers => {
  let allHeaders = {
    'Cache-Control': 'max-age=3600',
    Accept: 'application/fhir+json;charset=utf-8',
    'Content-Type': 'application/fhir+json;charset=utf-8',
    ...headers,
  };
  const server = store.getState().app.selectedServer;
  if (server.authType !== 'NO_AUTH' && !shouldUseProxyUrl(server.url)) {
    const token = store.getState().app.token;
    allHeaders['Authorization'] = `Basic ${token}`;
  }
  return allHeaders;
};

export const postWithHeaders = async (
  url,
  body,
  abortController,
  headers = [],
) => {
  let fullUrl = shouldUseProxyUrl(url) ? `${proxyUrl}${url}` : `${url}`;
  return fetch(`${fullUrl}`, {
    signal: abortController ? abortController.signal : null,
    method: 'POST',
    headers: {
      ...getHeaders(headers),
    },
    body: JSON.stringify(body),
  })
    .then(res => {
      if (res.status !== 201) {
        throw res;
      }
      return res.json();
    })
    .then(data => data)
    .catch(err => {
      logErrors('Error:', err);
      throw err;
    });
};

const fetchWithHeaders = async (
  url,
  headers,
  abortController,
  summary = false,
) => {
  let fullUrl = shouldUseProxyUrl(url) ? `${proxyUrl}${url}` : `${url}`;
  if (summary && !fullUrl.includes('_summary')) {
    fullUrl = fullUrl
      .concat(`${url.includes('?') ? '&' : '?'}`)
      .concat('_summary=count');
  }
  return fetch(`${fullUrl}`, {
    signal: abortController ? abortController.signal : null,
    headers: {
      ...getHeaders(headers),
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
      logErrors('Error:', err);
      throw err;
    });
};

export const fetchResource = async (url, abortController, summary = false) =>
  fetchWithHeaders(
    url,
    {
      Accept: 'application/fhir+json;charset=utf-8',
      'Content-Type': 'application/fhir+json;charset=utf-8',
    },
    abortController,
    summary,
  ).catch(err => {
    throw err;
  });

export const fetchAllResources = async (url, allData, abortController) =>
  fetchResource(url, abortController)
    .then(data => {
      if (data && data.entry) {
        allData = allData.concat(data.entry);
        const nextPage = data.link.findIndex(x => x.relation === 'next');
        if (nextPage > -1) {
          const nextPageUrl = replaceLocalhost(data.link[nextPage].url);
          return fetchAllResources(nextPageUrl, allData, abortController);
        }
      }
      return allData;
    })
    .catch(err => {
      throw err;
    });

export const getResourceCount = async (url, abortController) =>
  fetchResource(url, abortController, true)
    .then(data => (data ? data.total : 0))
    .catch(err => {
      throw err;
    });

export const getSearchParams = async (url, abortController) =>
  fetchResource(url, abortController)
    .then(data =>
      data && data.entry ? data.entry.map(x => x.resource.code) : [],
    )
    .catch(err => {
      throw err;
    });

export const getCapabilityStatementSearchParams = async (
  url,
  resourceType,
  abortController,
) =>
  fetchResource(url, abortController)
    .then(data => {
      let params =
        data && data.rest && data.rest[0] && data.rest[0].resource
          ? data.rest[0].resource.find(x => x.type === resourceType)
          : [];
      return params && params.searchParam ? params.searchParam : [];
    })
    .catch(err => {
      throw err;
    });

export const getOntologies = async (url, abortController) =>
  fetchAllResources(url, [], abortController)
    .then(data =>
      data
        .map(item => item.resource)
        .map(resource => ({
          id: resource.id,
          name: resource.name,
          url: resource.url,
        })),
    )
    .catch(err => {
      throw err;
    });

export const getCapabilityStatementReferences = async (
  url,
  resourceType,
  abortController,
) =>
  fetchResource(url, abortController)
    .then(data => {
      let references =
        data && data.rest && data.rest[0] && data.rest[0].resource
          ? data.rest[0].resource.filter(x =>
              x.searchInclude.includes(
                `${x.type}:${resourceType.toLowerCase()}`,
              ),
            )
          : [];
      return references;
    })
    .catch(err => {
      throw err;
    });

export const getReferencedBy = async (url, baseType, id, abortController) => {
  if (baseType) {
    return await getCapabilityStatementReferences(
      `${url}metadata`,
      baseType,
      abortController,
    )
      .then(async allReferences => {
        let resourceReferences = await Promise.all(
          allReferences.map(async ref => {
            return await fetchAllResources(
              `${url}${ref.type}?${baseType.toLowerCase()}=${baseType}/${id}`,
              [],
              abortController,
            )
              .then(data => data.flat())
              .catch(err => {
                throw err;
              });
          }),
        );
        resourceReferences = [].concat
          .apply([], resourceReferences)
          .map(item => item.resource);
        return await formatReferences(url, resourceReferences, abortController)
          .then(references => references)
          .catch(err => {
            throw err;
          });
      })
      .catch(err => {
        throw err;
      });
  } else {
    return [];
  }
};

export const getReferences = async (url, referenceIds, abortController) => {
  const resources = await Promise.all(
    referenceIds.map(
      async reference =>
        await fetchResource(`${url}${reference}`, abortController)
          .then(resource => resource)
          .catch(err => {
            throw err;
          }),
    ),
  );
  return await formatReferences(url, resources, abortController)
    .then(references => references)
    .catch(err => {
      throw err;
    });
};

export const formatReferences = async (url, references, abortController) => {
  references = references.map(item => ({
    ...item,
    profile:
      item.meta && item.meta.profile
        ? item.meta.profile
        : [`${fhirUrl}${item.resourceType}`],
  }));
  references = await Promise.all(
    references.map(
      async ref =>
        await fetchResource(
          `${url}StructureDefinition?url=${ref.profile[0]}`,
          abortController,
        )
          .then(data => {
            const name =
              data && data.entry && data.entry[0] && data.entry[0].resource
                ? data.entry[0].resource.name
                : null;
            return {...ref, name};
          })
          .catch(err => {
            throw err;
          }),
    ),
  );
  return references.filter(ref => ref.name);
};

export const userIsAuthorized = (
  username,
  password,
  baseUrl,
  abortController,
) => {
  const token = btoa(`${username}:${password}`);
  const fullUrl = shouldUseProxyUrl(baseUrl)
    ? `${proxyUrl}${baseUrl}`
    : `${baseUrl}`;
  return fetch(`${fullUrl}StructureDefinition`, {
    signal: abortController ? abortController.signal : null,
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
