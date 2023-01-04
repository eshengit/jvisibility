from enum import Enum


class ProfilingHealthStatus(Enum):
    SUCCESS = 1
    IDLE = 2
    UNHEALTHY = 3
    FAIL = 4
    IN_PROGRESS = 4


class OpStatus(Enum):
    SUCCESS = 1
    FAILURE = 2