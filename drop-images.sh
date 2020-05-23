#!/bin/bash

docker rmi $(docker images perftest* -q)