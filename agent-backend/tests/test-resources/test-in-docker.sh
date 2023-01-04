#!/bin/bash
export FLASK_APP=app.py
flask run --host 0.0.0.0 --port 80 &
java -classpath /tmp/ Main
