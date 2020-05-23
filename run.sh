#!/bin/bash

THREADS="12"
CONNECTION_RANGE="50 100 150 200 250 300 350 400 500 600 700 800"
DURATION_RANGE="45s"

RESULTS_DIR="$(pwd)/results"

WRK_BIN="$(which wrk)"

NODE_BIN=$(which node)

if [ ! -d "${RESULTS_DIR}" ]; then
    mkdir -p "${RESULTS_DIR}"
fi

RESULT_FILE="${RESULTS_DIR}/test_$(date +"%Y-%m-%d_%H-%M").json"

# ---

cd bin

DEBUG=main WRK_BIN=${WRK_BIN} WRK_OUTFILE=${RESULT_FILE} \
WRK_THREADS=${THREADS} WRK_CONNS=${CONNECTION_RANGE} WRK_DURS=${DURATION_RANGE} \
$NODE_BIN run.js

cd ..

echo "Done"
