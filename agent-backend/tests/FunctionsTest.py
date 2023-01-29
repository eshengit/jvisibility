import os
import unittest

import backend.functions
from datetime import datetime, timedelta
from pathlib import Path


class MyTestCase(unittest.TestCase):

    def test_timezone_conversion(self):
        self.assertEqual(backend.functions.get_time_in_utc_timezone("2023/01/03:17:27:00", "US/Pacific").strftime('%m-%d-%H-%M'),
                         '01-04-01-27')

    def test_get_next_n_records(self):
        # get_next_n_records(root_dir, start_datetime, list_of_record, number_of_records=1):
        start_time = backend.functions.get_time_in_utc_timezone("2023/01/03:17:27:00", "US/Pacific")
        root_dir = "/var/tmp/"
        hourly_dir = root_dir + "/"  + start_time.strftime(backend.functions.DUMP_DIR_TIME_FORMAT)
        if not os.path.exists(hourly_dir):
            os.mkdir(hourly_dir)
        time_stamp = start_time
        list_of_files = []
        for i in range(15):
            p = Path("%s/%s/%s" % (root_dir, time_stamp.strftime(backend.functions.DUMP_DIR_TIME_FORMAT),
                     time_stamp.strftime(backend.functions.CURRENT_TIME_SUFFIX_FORMAT) + backend.functions.DUMP_SUFFIX ))
            time_stamp = time_stamp + timedelta(seconds=5)
            p.touch()
            list_of_files.append(p)

        # test within the same hourly dir
        list_of_record_5 = []
        backend.functions.get_next_n_dump_records(root_dir, start_time, list_of_record_5, 5)
        self.assertEqual(list_of_record_5[0].record_prefix, '2700')
        self.assertEqual(list_of_record_5[1].record_prefix, '2705')
        self.assertEqual(list_of_record_5[2].record_prefix, '2710')
        self.assertEqual(len(list_of_record_5), 5)

        # overflow to next directory
        list_of_record_13 = []
        backend.functions.get_next_n_dump_records(root_dir, start_time, list_of_record_13, 13)
        self.assertEqual(len(list_of_record_13), 13)
        self.assertEqual(list_of_record_13[-1].record_prefix, '2800')

        # max dump will not great than all the files available
        list_of_record_15 = []
        backend.functions.get_next_n_dump_records(root_dir, start_time, list_of_record_15, 16)
        self.assertEqual(len(list_of_record_15), 15)
        self.assertEqual(list_of_record_15[-1].record_prefix, '2810')

        # max dump will not greater than all the files available
        list_of_record_none_exist= []
        time_does_not_exist = backend.functions.get_time_in_utc_timezone("2023/01/03:18:27:00", "US/Pacific")
        backend.functions.get_next_n_dump_records(root_dir, time_does_not_exist, list_of_record_none_exist, 16)
        self.assertEqual(len(list_of_record_none_exist), 0)

        # cleanup
        for file in list_of_files:
            file.unlink()


if __name__ == '__main__':
    unittest.main()
