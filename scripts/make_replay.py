#!/usr/bin/env python3

import os
import re
import subprocess
import sys

_JSON_RE = re.compile(r'^standings\.(\d+)\.json(?:\.gz)?$')


def main(argv):
    assert len(argv) == 4
    start_ts = int(argv[1])
    end_ts = int(argv[2])
    log_dir = argv[3]

    ts_and_filenames = []
    for filename in os.listdir(log_dir):
        m = _JSON_RE.search(filename)
        if not m:
            continue
        ts = int(m.group(1))
        ts_and_filenames.append((ts, filename))

    total_minutes = (end_ts - start_ts) // 60
    minute_filenames = [None for _ in range(total_minutes + 1)]
    for ts, filename in sorted(ts_and_filenames):
        minute = (ts - start_ts) // 60
        if minute < 0:
            continue
        elif minute < total_minutes:
            if minute_filenames[minute] is None:
                minute_filenames[minute] = filename
        else:
            minute_filenames[total_minutes] = filename

    assert all(f is not None for f in minute_filenames)

    sys.stderr.write('Processing %d files:\n' % len(minute_filenames))

    sys.stdout.write('[\n')

    for minute, filename in enumerate(minute_filenames):
        #m = _JSON_RE.search(filename)
        #assert m
        #ts = int(m.group(1))
        #sys.stdout.write('{"timestamp":%d,"standings":' % ts)
        sys.stdout.flush()
        with open(os.path.join(log_dir, filename), 'rb') as f:
            if filename.endswith('.gz'):
                subprocess.check_call(['gzip', '-d'], stdin=f)
            else:
                subprocess.check_call(['cat'], stdin=f)
        #sys.stdout.write('}')
        if minute < len(minute_filenames) - 1:
            sys.stdout.write(',')
        sys.stdout.write('\n')
        sys.stderr.write('.')
        sys.stderr.flush()

    sys.stdout.write(']\n')
    sys.stderr.write('\n')


if __name__ == '__main__':
    sys.exit(main(sys.argv))
