#!/usr/bin/python
import sys
import json

n = 3
if len(sys.argv) != n:
    print('number of args needs to be {n}, but only provided: {l} were provided'.format(l=len(sys.argv)-1, n=n-1))
    sys.exit(1)

try:
    testStr = sys.argv[1]
    jsonKey = sys.argv[2]
except Exception as e:
    print('error using args: {e}'.format(e=e))
    sys.exit(2)

try:
    result = json.loads(testStr)
    print(result[jsonKey])
except Exception as e:
    print('error parsing: {e}'.format(e=e))
    sys.exit(3)

sys.exit(0)
