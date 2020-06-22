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
WORKDIR /usr/share/nginx/html
EXPOSE 80
RUN rm /etc/nginx/conf.d/default.conf
COPY bin/nginx.conf /etc/nginx/nginx.conf
COPY --from=base /app/build .
COPY ./bin/env.sh .
RUN chmod +x env.sh
COPY ./src/.env.example /usr/share/nginx/html/.env
COPY ./bin/start_up.sh /start_up.sh
CMD ["/bin/bash", "-c", "/usr/share/nginx/html/env.sh && nginx"]
