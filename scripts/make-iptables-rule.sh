#!/bin/bash

BYPASSPORTS=()
BYPASSIPS=()
IPSET_NAME=${1-chnroute}
CHAIN=${2-SHADOWSOCKS}

echo "# Generated on $(date)"
cat <<EOF
*nat
:$CHAIN - [0:0]
-A $CHAIN -d 0.0.0.0/8 -j RETURN
-A $CHAIN -d 10.0.0.0/8 -j RETURN
-A $CHAIN -d 100.64.0.0/10 -j RETURN
-A $CHAIN -d 127.0.0.0/8 -j RETURN
-A $CHAIN -d 169.254.0.0/16 -j RETURN
-A $CHAIN -d 172.16.0.0/12 -j RETURN
-A $CHAIN -d 192.0.0.0/24 -j RETURN
-A $CHAIN -d 192.0.2.0/24 -j RETURN
-A $CHAIN -d 192.88.99.0/24 -j RETURN
-A $CHAIN -d 192.168.0.0/16 -j RETURN
-A $CHAIN -d 198.18.0.0/15 -j RETURN
-A $CHAIN -d 198.51.100.0/24 -j RETURN
-A $CHAIN -d 203.0.113.0/24 -j RETURN
-A $CHAIN -d 224.0.0.0/4 -j RETURN
-A $CHAIN -d 255.255.255.255 -j RETURN
EOF

echo "# Customized rules"
for _port in "${BYPASSPORTS[@]}"; do
    echo "-A $CHAIN -p tcp -m tcp --dport $_port -j RETURN"
done

for _ip in "${BYPASSIPS[@]}"; do
    echo "-A $CHAIN -d $_ip -j RETURN"
done

# ipset
echo "-A $CHAIN -m set --match-set $IPSET_NAME dst -j RETURN"

echo "# REDIRECT to $CHAIN"
if [ -n "$PORT" ]; then
    echo "-A $CHAIN -p tcp -j REDIRECT --to-ports $PORT"
fi

echo "-A PREROUTING -p tcp -j $CHAIN"
echo "-A OUTPUT -p tcp -j $CHAIN"
echo "COMMIT"

