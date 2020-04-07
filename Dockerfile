FROM node:12 as base

EXPOSE 3000
WORKDIR /app
COPY package.json /app/
RUN npm install

ARG NODE_ENV=production
ARG REACT_APP_FHIR_API_NAME=Localhost
ARG REACT_APP_FHIR_API_AUTH_TYPE=BASIC_AUTH
ARG REACT_APP_FHIR_API=http://localhost:8000/
ENV REACT_APP_FHIR_API_NAME=$REACT_APP_FHIR_API_NAME
ENV REACT_APP_FHIR_API_AUTH_TYPE=$REACT_APP_FHIR_API_AUTH_TYPE
ENV REACT_APP_FHIR_API=$REACT_APP_FHIR_API
COPY . .
RUN npm run build

FROM nginx:1.17
EXPOSE 80
RUN rm /etc/nginx/conf.d/default.conf
COPY bin/nginx.conf /etc/nginx/nginx.conf
COPY --from=base /app/build /usr/share/nginx/html
CMD ["nginx", "-g", "daemon off;"]
