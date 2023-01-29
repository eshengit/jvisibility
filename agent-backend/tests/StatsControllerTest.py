import unittest
import json
from backend import StatsController


class MyTestCase(unittest.TestCase):
    def test_find_key(self):
        line = '"main" #1 prio=5 os_prio=31 cpu=232.75ms elapsed=3667.24s tid=0x0000000157808a00 nid=0x240b waiting on condition'
        self.assertEqual(StatsController.find_key(line), "main")
        line = '"Reference Handler" #2 daemon prio=10 os_prio=31 cpu=73.55ms elapsed=3667.19s tid=0x00000001570aaa00'
        self.assertEqual(StatsController.find_key(line), "Reference Handler")  # add assertion here
        line = '"Reference Handler3" #2 daemon prio=10 os_prio=31 cpu=73.55ms elapsed=3667.19s tid=0x00000001570aaa00'
        self.assertEqual(StatsController.find_key(line), "Reference Handler")

    def test_run(self):
        dump = "test-resources/jdeadlock.example"
        trace_stats = StatsController.run(dump)

        self.assertEqual(trace_stats.total_thread_count, 90)
        self.assertEqual(len(trace_stats.deadlock_trace), 832)
        self.assertEqual(trace_stats.total_thread_group_count, 49)

        json_string = json.dumps(trace_stats, default=lambda x: x.__dict__)
        print(json_string)
        #list = [json_string]
        #json_string = json.dumps(list)

        self.assertEqual(len(json.loads(json_string).get("thread_group_list")[0]["variation_map_per_thread_group"]), 1)


if __name__ == '__main__':
    unittest.main()
