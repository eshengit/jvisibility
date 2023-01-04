FROM openjdk:8-jdk-alpine

RUN apk update && \
    apk add bash \
        ca-certificates \
        curl \
        python3 \
        py3-pip

#assume this is the main java program to monitor
COPY tests/test-resources/Main.java /tmp/
RUN chmod 777 /tmp/Main.java
RUN cd /tmp && javac Main.java

# install the java profiling agent and it's run-time environment here
RUN mkdir /opt/agent-backend
COPY app.py /opt/agent-backend/
COPY requirements.txt /opt/agent-backend
ADD backend/ /opt/agent-backend/backend
COPY tests/test-resources/test-in-docker.sh /opt/agent-backend/
RUN chmod -R 777 /opt/agent-backend/
RUN pip3 install -r /opt/agent-backend/requirements.txt

WORKDIR /opt/agent-backend/

#start both java and java profiling agent
CMD ./test-in-docker.sh

