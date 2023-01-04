# define Python user-defined exceptions
class NoProcessFoundException(Exception):
    def __init__(self, process_name):
        self.message = "no process named as %s" % process_name
        super().__init__(self.message)

    pass


class NoJavaFoundException(Exception):
    def __init__(self, pid):
        self.message = "process pid %d does not run on java" % pid
        super().__init__(self.message)

    pass


class InvalidDumpException(Exception):
    def __init__(self, msg):
        self.message = "The jstack hit error %s " % msg
        super().__init__(self.message)

    pass


class ProcessDeadException(Exception):
    def __init__(self, process_name, time_waiting_to_recover):
        self.message = "The process %s was not recovered in %s secs" % (process_name, time_waiting_to_recover)
        super().__init__(self.message)

    pass
