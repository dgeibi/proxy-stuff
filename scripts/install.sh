#!/bin/bash

rm -rf /etc/proxyStuff
cp -r proxyStuff /etc/

cp my-ssr@.service my-dns.service /etc/systemd/system/

systemctl daemon-reload
