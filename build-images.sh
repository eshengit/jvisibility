#!/bin/bash
SOURCE=${BASH_SOURCE[0]}
DIR=$( cd -P "$( dirname "$SOURCE" )" >/dev/null 2>&1 && pwd )
cd $DIR/agent-backend
docker build -t agent-backend:latest .
cd $DIR/frontend
docker build -t agent-frontend:latest .
