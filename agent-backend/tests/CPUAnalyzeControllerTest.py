import unittest
import backend.cpu_analyzer
import backend.exceptions
import json

class CPUAnalyzerControllerTestCase(unittest.TestCase):

    def test_get_pid(self):
        s = '"Monitor Ctrl-Break" #13 daemon prio=5 os_prio=31 cpu=10.14ms elapsed=128.89s tid=0x000000013483b000 nid=0x9e03 runnable  [0x000000016dfb6000]'
        key = backend.CPUAnalyzerController.find_key(s)
        self.assertEqual(key, "40451")  # add assertion here

    def test_get_traces(self):
        file = "test-resources/jstack.example"
        traces = backend.CPUAnalyzerController.get_traces(file)
        self.assertEqual(len(traces), 90)
        size = len(traces["9227"].strip().split("\n"))
        self.assertEqual(size, 9)

    def test_run(self):
        dump = "test-resources/jstack.example"
        first = "test-resources/firstProc"
        last = "test-resources/lastProc"
        analyzer = backend.CPUAnalyzerController(first, last, dump)
        user_cpu = analyzer.run(True)
        sys_cpu = analyzer.run(False)
        print(json.dumps(user_cpu, default=lambda x: x.__dict__))
        print("start")
        print(user_cpu[0].trace)

        self.assertEqual(user_cpu[0].cpu_ticks, 101)
        self.assertEqual(user_cpu[0].thread_id, "41219")
        self.assertEqual(sys_cpu[0].cpu_ticks, 900)
        self.assertEqual(sys_cpu[0].thread_id, "42499")

    def test_parse_proc_line(self):
        line = "12345 123 100"
        user_dir = {}
        sys_dir = {}
        backend.CPUAnalyzerController.parse_proc_line(line, user_dir, sys_dir)
        self.assertEqual(user_dir.get("12345"), 123)
        self.assertEqual(sys_dir.get("12345"), 100)


if __name__ == '__main__':
    unittest.main()
