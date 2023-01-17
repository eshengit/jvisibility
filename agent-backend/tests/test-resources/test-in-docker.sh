#!/bin/bash
export FLASK_APP=app.py
flask run --host 0.0.0.0 --port 8080 &
java -classpath /tmp/ Deadlock
