#!/bin/bash

NAME=${1-chnroute}

echo "create $NAME hash:net family inet hashsize 4096 maxelem 65536"
while read -r ip
do
  echo "add $NAME $ip"
done
