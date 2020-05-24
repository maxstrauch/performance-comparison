#!/bin/bash

DEFAULT_PORT="3021"
NPM_BIN=$(which npm)

# ---

for TEST_CASE in $(ls -1 | grep "^test-"); do
# for TEST_CASE in test-openresty test-php-fpm-nginx; do

    echo "info: ---- Testing: ${TEST_CASE} ----"
    cd "${TEST_CASE}"

    chmod +x build.sh start.sh

    # Get the environment ready
    # ---
    echo "info: preparing the environment"
    ./build.sh

    if [ $? -ne 0 ]; then
        echo "error: cannot build/prepare for test case ${TEST_CASE}"
        exit 1
    fi

    # Start the container
    # ---
    echo "info: starting the container/application"
    ./start.sh $DEFAULT_PORT

    echo "info: [main] waiting for container to start ..."

    while true; do
        curl -f http://localhost:$DEFAULT_PORT/index.html 2>/dev/null 1>/dev/null

        if [ $? -eq "0" ]; then
            echo "info: [main] available"
            break
        fi

        sleep 2

    done

    cd ../verify

    EXPECTED_SERVICE_NAME="${TEST_CASE}" BASE_URL="http://localhost:$DEFAULT_PORT" $NPM_BIN run test
    RET=$?

    cd ..
    ./stop.sh

    if [ $RET -ne "0" ]; then
        echo "error: test failed"
        exit 1
    fi    

done

echo "---"
echo "Done. All checks success!"