FROM openjdk:8-jdk-alpine

# install required package for default OS
RUN apk update && \
    apk add bash \
        ca-certificates \
        curl \
        python3 \
        py3-pip

# install the default java app to monitor
COPY tests/test-resources/Deadlock.java /tmp/
RUN chmod 777 /tmp/Deadlock.java
RUN cd /tmp && javac Deadlock.java

# install the java profiling agent and it's runtime environment
RUN mkdir /opt/agent-backend
COPY app.py /opt/agent-backend/
COPY requirements.txt /opt/agent-backend
ADD backend/ /opt/agent-backend/backend
COPY tests/test-resources/test-in-docker.sh /opt/agent-backend/
RUN chmod -R 777 /opt/agent-backend/
RUN pip3 install -r /opt/agent-backend/requirements.txt

#start both java and java profiling agent
WORKDIR /opt/agent-backend/
CMD ./test-in-docker.sh

