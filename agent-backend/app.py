import atexit
import datetime
import json
import logging.config
import threading

from flask import Flask, jsonify, request
from flask_cors import CORS, cross_origin

from backend import OpStatus
from backend import ProfilingRunner
from backend.cpu_analyzer import CPUAnalyzerController
from backend.functions import get_next_n_dump_records, get_time_in_utc_timezone, from_record_dump_file_name, \
    from_record_proc_file_name, get_latest_dump_records
from backend.stats import StatsController

# shared state variable
app = Flask(__name__)
#CORS(app, resources={r"/*": {"origins": "*"}})
CORS(app)
dump_root_dir = "/var/tmp"
snapshot_runner = ProfilingRunner(dump_root_dir)
runner_thread = None
DEFAULT_TIMEZONE = "US/Pacific"

# Dictionary with logging configuration
logging_config = {
    'version': 1,
    'formatters': {
        'default': {
            'format': '[%(asctime)s] %(levelname)s in %(module)s: %(message)s',
        }
    },
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
            'formatter': 'default',
            'level': 'INFO',
        }
    },
    'loggers': {
        'backend': {
            'level': 'INFO',
            'handlers': ['console'],
            'propagate': False,
        }
    }
}

# Use the dictConfig function to configure logging
logging.config.dictConfig(logging_config)

# Get a logger
logger = logging.getLogger('backend')


# defining function to run on shutdown
def cleanup_app():
    if runner_thread is not None:
        runner_thread.terminate()
        runner_thread.join()


atexit.register(cleanup_app)


def create_response(status, message):
    return dict(STATUS=status, MESSAGE=message)


@app.before_first_request
def initialize_app():
    # Initialize some data or functions here
    runner_thread = threading.Thread(target=start_snapshot_runner)
    runner_thread.start()
    logger.info("Initialize the app in background thread")


def start_snapshot_runner():
    snapshot_runner.start()


@app.route('/', methods=['GET'])
def status():
    status = snapshot_runner.status()
    response = create_response(status.status.name, status.status_msg)
    if len(status.process_name) > 0:
        response['PROCESS NAME'] = status.process_name
    return jsonify(response)


def get_parameter(key):
    if request.headers.get('Content-Type') is None or request.headers.get('Content-Type') != 'application/json':
        return request.args.get(key)
    else:
        return json.loads(request.data).get('p')


@app.route('/start', methods=['POST'])
@cross_origin()
def start():
    process_name = get_parameter('p')
    op_status, message = snapshot_runner.set_or_update_process_to_profile(process_name)
    return jsonify(create_response(op_status.name, message))


@app.route('/stop', methods=['POST'])
def stop():
    snapshot_runner.stop()
    return jsonify({'status': 'success'})


def get_query_start_time():
    # time query parameter in form yyyy-mm-dd-hh-mm
    user_time_string = get_parameter('st')
    if user_time_string is None:
        return jsonify(create_response(OpStatus.FAILURE),
                       "you have to specify parameter duration for the java stats in form of yyyy-mm-dd-hh-mm")

    # get time_zone and convert the time to utc timezone
    user_timezone = request.headers.get('Timezone')
    if user_timezone is None:
        user_timezone = DEFAULT_TIMEZONE
    return get_time_in_utc_timezone(user_time_string, user_timezone)


@app.route('/stats', methods=['POST'])
def stats():
    query_start_time = get_query_start_time()
    list_of_dump_records = []
    get_next_n_dump_records(dump_root_dir, query_start_time, list_of_dump_records)
    trace_object = StatsController.run(from_record_dump_file_name(list_of_dump_records[0]))

    return jsonify(json.dumps(trace_object, default=lambda x: x.__dict__))


@app.route('/deadlock', methods=['POST'])
@cross_origin()
def deadlock():
    latest_dump_file = from_record_dump_file_name(get_latest_dump_records(dump_root_dir))
    if latest_dump_file is None:
        return jsonify(create_response(OpStatus.SUCCESS.name, "{}"))
    trace_object = StatsController.run(latest_dump_file)
    return jsonify(create_response(OpStatus.SUCCESS.name, json.dumps(trace_object, default=lambda x: x.__dict__)))


@app.route('/cpu', methods=['POST'])
def cpu():
    query_start_time = get_query_start_time()
    cpu_type = get_parameter('type')
    list_of_dump_records = []
    get_next_n_dump_records(dump_root_dir, query_start_time, list_of_dump_records, 10)
    dump_file = from_record_dump_file_name(list_of_dump_records[-1])
    first_proc_file = from_record_proc_file_name(list_of_dump_records[0])
    last_proc_file = from_record_proc_file_name(list_of_dump_records[-2])
    CPUAnalyzerController(first_proc_file, last_proc_file, dump_file).run()


if __name__ == '__main__':
    initialize_app()
    app.run()
