#!/bin/bash

zip -r all.zip . -x '*.git/*' -x '*/node_modules/*' -x 'wrk/*' -x '*.DS_Store'