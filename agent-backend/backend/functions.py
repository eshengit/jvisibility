import glob
import logging
import os
import subprocess
from datetime import datetime, timedelta

import pytz

from .exceptions import NoProcessFoundException

USER_TIME_FORMAT = '%Y-%m-%d-%H-%M'
DUMP_DIR_TIME_FORMAT = "%Y-%m-%d-%H"
CURRENT_TIME_SUFFIX_FORMAT = "%M%S"
UTC_TIMEZONE = pytz.timezone('UTC')
DUMP_SUFFIX = "-dump"
PROC_SUFFIX = '-proc'
# Get a logger
logger = logging.getLogger('backend')


class Record(object):
    def __init__(self, record_dir, record_prefix):
        self.record_dir = record_dir
        self.record_prefix = record_prefix


def get_list_of_records(list_of_record, record_dir, minute_and_seconds_prefix_int, number_of_records):
    count = 0
    list = map(lambda s: os.path.basename(s), sorted(
        glob.glob("%s/%s*%s" % (record_dir, int(minute_and_seconds_prefix_int / 100), DUMP_SUFFIX)), key=os.path.getmtime))
    for name in map(lambda s: s.replace(DUMP_SUFFIX, ''), list):
        list_of_record.append(Record(record_dir, name))
        count += 1
        if count == number_of_records:
            break


def get_dump_info_for_given_minute(root_dir, start_datetime):
    record_dir = root_dir + "/" + start_datetime.strftime(DUMP_DIR_TIME_FORMAT)
    minute_prefix_int = int(start_datetime.strftime(CURRENT_TIME_SUFFIX_FORMAT))
    return record_dir, minute_prefix_int


def get_next_n_dump_records(root_dir, start_datetime, list_of_record, number_of_records=1):
    record_dir, minute_and_seconds_prefix_int = get_dump_info_for_given_minute(root_dir, start_datetime)
    get_list_of_records(list_of_record, record_dir, minute_and_seconds_prefix_int, number_of_records)

    current_records = len(list_of_record)
    if current_records > 0 and (list_of_record[-1].record_prefix.startswith(
            "59") or list_of_record[-1].record_prefix[-2] == '5') and current_records < number_of_records:
        start_datetime = start_datetime + timedelta(minutes=1)
        get_next_n_dump_records(root_dir, start_datetime, list_of_record, number_of_records - current_records)


def from_record_dump_file_name(record):
    return "%s/%s%s" %(record.record_dir, record.record_prefix, DUMP_SUFFIX)


def from_record_proc_file_name(record):
    return "%s/%s%s" %(record.record_dir, record.record_prefix, PROC_SUFFIX)


def get_time_in_utc_timezone(user_time_string, user_timezone):
    user_dt = datetime.strptime(user_time_string, USER_TIME_FORMAT)
    source_tz = pytz.timezone(user_timezone)
    user_dt = source_tz.localize(user_dt)
    return user_dt.astimezone(UTC_TIMEZONE)


def get_java_process_id(process_name):
    # Get the list of all running processes
    proc = subprocess.Popen(["ps", "-A"], stdout=subprocess.PIPE)
    out, err = proc.communicate()

    # Iterate through the list and find the process with the given name
    for line in out.splitlines():
        line = line.decode()
        if 'java' in line and process_name in line:
            # Extract the process id from the line and return it
            pid = int(line.strip().split(None)[0])
            if "/bin/java " in str(line):
                # Extract the process id from the line and return it
                tokens = str(line).split(None)
                for token in tokens:
                    if "/bin/java" in token:
                        index = token.rfind("/")
                        return pid, token[0:index] + "/jstack"
            else:
                # jstack on the path
                return pid, 'jstack'

    raise NoProcessFoundException(process_name)


def prepare_dump(dump_root):
    # Create a datetime object for the current time in UTC
    t = datetime.datetime.now(UTC_TIMEZONE)

    current_time_suffix = t.strftime(CURRENT_TIME_SUFFIX_FORMAT)
    current_dump_dir = dump_root + "/" + t.strftime(DUMP_DIR_TIME_FORMAT)
    if not os.path.exists(current_dump_dir):
        os.makedirs(current_dump_dir)
        logger.info("The new directory %s is created!" % current_dump_dir)
    return current_dump_dir, current_time_suffix


def run_single_jstack(jstack_cmd, pid, current_dump_dir, current_time_prefix):
    # Run jstack and dump its output to a file
    current_jstack_dump = current_dump_dir + "/%s-%s" % (current_time_prefix, DUMP_SUFFIX)
    with open(current_jstack_dump, "w") as f:
        subprocess.Popen([jstack_cmd, str(pid)], stdout=f, stderr=f)
    return current_jstack_dump


def run_single_proc_stat(pid, current_dump_dir, current_time_prefix):
    # Open a file for writing
    current_proc_dump = current_dump_dir + "/%s%s" % (current_time_prefix, PROC_SUFFIX)
    with open(current_proc_dump, "w") as f:
        # Iterate over the files in the /proc/pid/task directory
        for thread_id in os.listdir(f"/proc/{pid}/task"):
            # Read the /proc/pid/task/tid/stat file for the thread
            with open(f"/proc/{pid}/task/{thread_id}/stat", "r") as stat_file:
                # Parse the values from the stat file
                values = stat_file.read().strip().split()
                system_cpu_tick = int(values[14])  # 14th value is the system CPU tick
                user_cpu_tick = int(values[13])  # 13th value is the user CPU tick

            # Write the thread id, system CPU tick, and user CPU tick to the file
            f.write(f"{thread_id} {user_cpu_tick} {system_cpu_tick}\n")


def get_first_1000_bytes_from_file(previous_dump_file):
    if previous_dump_file is None or not os.path.exists(previous_dump_file):
        return "no previous dump file exists"
    with open(previous_dump_file, 'r') as f:
        return ''.join(f.readlines())


def validate_dump_file(file_name):
    if file_name is None:
        return True
    if not os.path.exists(file_name):
        return False
    if os.path.getsize(file_name) < 1000:
        return False
