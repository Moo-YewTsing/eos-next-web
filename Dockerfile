FROM node:10
ENV APP_HOME /app
WORKDIR $APP_HOME
COPY app ./
RUN npm install yarn && \
    yarn install &&\
    yarn --cwd . run build
CMD [ "node", "server.js" ]