import threading
import time
import traceback

from .exceptions import InvalidDumpException
from .exceptions import NoProcessFoundException
from .functions import get_first_1000_bytes_from_file
from .functions import get_java_process_id
from .functions import prepare_dump
from .functions import run_single_jstack
from .functions import run_single_proc_stat
from .functions import validate_dump_file
from .constants import OpStatus
from .constants import ProfilingHealthStatus
import logging

# Get a logger
logger = logging.getLogger('backend')


class ProfilerState:
    def __init__(self, status, status_msg, process_name=''):
        self.status = status
        self.status_msg = status_msg
        self.process_name = process_name
        self.previous_dump_file = None
        self.failed_profiling = 0
        self.lock = threading.Lock()

    def validate_state(self, max_failure):
        # validate dump, we only report failure if # of failed dump > 5 in a row
        if self.failed_profiling < max_failure:
            is_valid = validate_dump_file(self.previous_dump_file)
            if not is_valid:
                self.update_state(failed_profiling=self.failed_profiling + 1, status=ProfilingHealthStatus.UNHEALTHY,
                                  status_msg=InvalidDumpException(get_first_1000_bytes_from_file(
                                      self.previous_dump_file)).message)
            else:
                self.update_state(status=ProfilingHealthStatus.SUCCESS, status_msg="Successfully Running")
        else:
            self.update_state(status=ProfilingHealthStatus.Fail, status_msg="jstack process %s failed in a row %d" % (
                self.process_name, max_failure))

    def update_state(self, **kwargs):
        if self.lock.acquire(timeout=1):
            try:
                msg = ''
                for arg in kwargs.keys():
                    msg += "update %s " % arg
                    if arg == 'status':
                        self.status = kwargs.get(arg)
                    elif arg == 'status_msg':
                        self.status_msg = kwargs.get(arg)
                    elif arg == 'failed_dump':
                        self.failed_profiling = kwargs.get(arg)
                    elif arg == 'previous_dump_file':
                        self.previous_dump_file = kwargs.get(arg)
                    elif arg == 'process_name':
                        self.process_name = kwargs.get(arg)
                        self.failed_profiling = 0
                        self.previous_dump_file = None
                        if self.process_name == '':
                            self.status = ProfilingHealthStatus.IDLE
                        else:
                            self.status = ProfilingHealthStatus.IN_PROGRESS
                if self.status == ProfilingHealthStatus.FAIL or self.status == ProfilingHealthStatus.SUCCESS:
                    self.failed_profiling = 0
            finally:
                self.lock.release()
            return OpStatus.SUCCESS, msg
        else:
            return OpStatus.FAILURE, "can't acquire lock"


class ProfilingRunner:
    def __init__(self, dump_root, time_interval=5, max_failure=5):
        self.dump_root = dump_root
        self.time_interval = time_interval
        self.max_failure = max_failure
        self.state = ProfilerState(status=ProfilingHealthStatus.IDLE, status_msg="No process to profile")

    def stop(self):
        return self.state.update_state(process_name='')

    def status(self):
        return self.state

    def start(self):
        while True:
            try:
                pid = self.single_snapshot()
            except Exception as e:
                # all unexpected error handling
                traceback.print_exc()
                pid = -1
                self.state.update_state(status=ProfilingHealthStatus.FAIL, status_msg=str(e))

            time.sleep(self.time_interval)

            if pid > 0:
                self.state.validate_state(self.max_failure)

    def set_or_update_process_to_profile(self, new_process_to_snapshot):
        # we do not have process name update
        if new_process_to_snapshot is None or new_process_to_snapshot == '':
            if self.process_name == '':
                return OpStatus.FAILURE, "you have to set process name you want to profile"
            else:
                return self.state.update_state(process_name=self.state.process_name)
        if new_process_to_snapshot == self.state.process_name:
            return self.state.update_state(process_name=self.state.process_name)

        # we do have process name update
        return self.state.update_state(process_name=new_process_to_snapshot)

    def single_snapshot(self):
        # if no process for profiling set, exit
        if self.state.status == ProfilingHealthStatus.IDLE:
            return -1

        # if process name does not exist for profiling, exit
        try:
            pid, jstack_cmd = get_java_process_id(self.state.process_name)
            logger.debug("pid is %s jstack is %s" % (pid, jstack_cmd))
        except NoProcessFoundException as e:
            traceback.print_exc()
            self.state.update_state(status=ProfilingHealthStatus.FAIL, process_name='', status_msg=str(e))
            return -1

        # pid exists, take snapshot
        dump_dir, current_dump_id = prepare_dump(self.dump_root)
        previous_dump_file = run_single_jstack(jstack_cmd, pid, dump_dir, current_dump_id)
        run_single_proc_stat(pid, dump_dir, current_dump_id)
        self.state.update_state(previous_dump_file=previous_dump_file)
        return pid
