import re
import operator


class PerThreadNameTraceInfo(object):
    def __init__(self, name, trace_map):
        self.variation_map_per_thread_group = trace_map
        self.thread_group_name = name
        self.total_thread_count = sum(self.variation_map_per_thread_group.values())
        self.trace_variation_count = len(self.variation_map_per_thread_group)


class TraceStats(object):
    def __init__(self, total_count, traces, deadlock_trace=''):
        self.total_thread_count = total_count
        self.thread_group_list = traces
        self.total_thread_group_count = len(traces)
        self.deadlock_trace = deadlock_trace
        self.has_deadlock = self.deadlock_trace is not None


class StatsController:

    @staticmethod
    def find_key(line):
        return re.sub(r'\d', '', line[1:].split('"')[0])

    @staticmethod
    def run(dump):
        traces = {}
        currentKey = None
        currentTrace = ''
        find_new_trace = False
        deadlock_trace = ""
        find_deadlock = False
        deadlock_start = False

        # Open the file
        with open(dump, 'r') as f:
            # Read the file line by line
            for line in f:
                if len(line) == 0 or (len(line) == 1 and "\n" in line):
                    # if it's a new line
                    if find_new_trace is True:
                        count = traces.get(currentKey)
                        if count is None:
                            traces[currentKey] = {currentTrace: 1}
                        else:
                            trace_count_by_trace = traces[currentKey].get(currentTrace)
                            if trace_count_by_trace is None:
                                traces[currentKey][currentTrace] = 1
                            else:
                                traces[currentKey][currentTrace] = trace_count_by_trace + 1
                        currentKey = None
                        currentTrace = ''
                        find_new_trace = False
                    else:
                        continue
                elif 'prio=' in str(line):
                    # If it's a start of new trace
                    find_new_trace = True
                    currentKey = StatsController.find_key(line)
                elif len(re.findall(r'Found.*deadlock', str(line))) > 0:
                    if find_deadlock is not True:
                        find_deadlock = True
                        deadlock_start = True
                    else:
                        deadlock_start = False
                    deadlock_trace += line
                else:
                    # If the line does not start with "prio=", it is part of the current block
                    if find_new_trace:
                        currentTrace += re.sub(r'\d', '', line)
                    if deadlock_start:
                        deadlock_trace += line
        list = []
        total_threads = 0
        for key in traces.keys():
            traces_by_thread_name = PerThreadNameTraceInfo(key, traces.get(key))
            total_threads += traces_by_thread_name.total_thread_count
            list.append(traces_by_thread_name)
        return TraceStats(total_threads, sorted(list, key=operator.attrgetter('total_thread_count'), reverse=True),
                          deadlock_trace)
