FROM node:18.12.1

#install nvm, npm and all required node packages
ENV PATH=$PATH:/root/.nvm/versions/node/v18.12.1/bin
RUN mkdir /opt/frontend
ADD public/ /opt/frontend/public
ADD package.json /opt/frontend
ADD package-lock.json /opt/frontend 
ADD src/ /opt/frontend/src
RUN cd /opt/frontend && npm install

WORKDIR /opt/frontend/
CMD npm run start
