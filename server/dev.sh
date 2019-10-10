#!/bin/bash

case $1 in
    stop)
        docker-compose -f docker-compose.yml down
        docker-compose -f docker-compose.test.yml down
        ;;
    start)
        docker-compose -f docker-compose.test.yml up -d
        docker-compose -f docker-compose.test.yml exec rustlesearch_dev /bin/sh
        ;;
    exec)
        docker-compose -f docker-compose.test.yml exec rustlesearch_dev /bin/sh
        ;;
    "")
        docker-compose -f docker-compose.yml down
        docker-compose -f docker-compose.test.yml down
        docker-compose -f docker-compose.test.yml up -d
        docker-compose -f docker-compose.test.yml exec rustlesearch_dev /bin/sh
        ;;
    *)
        echo "Unknown option '$1'"
        exit 1
esac
