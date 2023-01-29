import operator


class TraceObject(object):

    def __init__(self, thread_id, cpu_ticks, trace):
        self.thread_id = thread_id
        self.cpu_ticks = cpu_ticks
        self.trace = trace

    def __lt__(self, other):
        return self.cpu_ticks < other.cpu_ticks


class CPUAnalyzerController:

    def __init__(self, first_proc, last_proc, last_dump):
        self.first_proc = first_proc
        self.last_proc = last_proc
        self.last_dump = last_dump
        self.traces = {}  # Initialize a dictionary to store the traces
        self.current_key = None
        self.current_trace = []

    def run(self, isUserCPU):
        self.traces = CPUAnalyzerController.get_traces(self.last_dump)
        return CPUAnalyzerController.build_traces_by_cpu(self.first_proc, self.last_proc, self.traces, isUserCPU)

    @staticmethod
    def parse_proc_line(line, user_dir, sys_dir):
        turple = line.split(None)
        user_dir[turple[0]] = int(turple[1])
        sys_dir[turple[0]] = int(turple[2])

    @staticmethod
    def grow_list(target_cpu, baseline_cpu, traces):
        delta_cpu_with_trace = []
        for key in target_cpu.keys():
            val = baseline_cpu.get(key)
            if val is not None:
                delta_cpu_with_trace.append(TraceObject(key, target_cpu.get(key) - val, traces.get(key)))
        return sorted(delta_cpu_with_trace, key = operator.attrgetter('cpu_ticks'), reverse = True)

    @staticmethod
    def build_traces_by_cpu(firstProc, lastProc, traces, isUserCPU):
        baseline_user_cpu = {}
        baseline_sys_cpu = {}
        target_user_cpu = {}
        target_sys_cpu = {}
        with open(firstProc, 'r') as f:
            for line in f:
                CPUAnalyzerController.parse_proc_line(line, baseline_user_cpu, baseline_sys_cpu)
        with open(lastProc, 'r') as f:
            for line in f:
                CPUAnalyzerController.parse_proc_line(line, target_user_cpu, target_sys_cpu)

        if isUserCPU:
            return CPUAnalyzerController.grow_list(target_user_cpu, baseline_user_cpu, traces)[:10]
        else:
            return CPUAnalyzerController.grow_list(target_sys_cpu, baseline_sys_cpu, traces)[:10]

    @staticmethod
    def find_key(line):
        tokens = line.split(None)
        for token in tokens:
            if "nid=" in token:
                hex_pid = token.split('=')[1]
                return str(int(hex_pid, 16))

    @staticmethod
    def get_traces(dump):
        traces = {}
        currentKey = None
        currentTrace = ''
        find_new_trace = False

        # Open the file
        with open(dump, 'r') as f:
            # Read the file line by line
            for line in f:
                if len(line) == 0 or (len(line) == 1 and "\n" in line):
                    # if it's a new line
                    if find_new_trace is True:
                        traces[currentKey] = currentTrace
                        currentKey = None
                        currentTrace = ''
                        find_new_trace = False
                    else:
                        continue
                elif 'prio=' in str(line):
                    # If it's a start of new trace
                    find_new_trace = True
                    currentKey = CPUAnalyzerController.find_key(line)
                    currentTrace = ''
                    currentTrace += line
                else:
                    # If the line does not start with "prio=", it is part of the current block
                    if find_new_trace:
                        currentTrace += line
        return traces
