CHNROUTES= CHNROUTES.txt
APNIC=apnic.txt
IPTABLES_RULE=proxyStuff/meta/iptables
IPSET_RULE=proxyStuff/meta/ipset
IPTABLES_CHAIN_NAME=SHADOWSOCKS
IPSET_NAME=chnroute
CONFIG_JS=proxyStuff/config.js

all: ${CHNROUTES} ${IPSET_RULE} ${IPTABLES_RULE} ${CONFIG_JS}

${APNIC}:
	curl http://ftp.apnic.net/apnic/stats/apnic/delegated-apnic-latest > ${APNIC}

${CHNROUTES}: ${APNIC}
	awk -F\| '/CN\|ipv4/ { printf("%s/%d\n", $$4, 32-log($$5)/log(2)) }' < ${APNIC} > "${CHNROUTES}"

${IPTABLES_RULE}:
	./scripts/make-iptables-rule.sh ${IPSET_NAME} ${IPTABLES_CHAIN_NAME} > ${IPTABLES_RULE}

${IPSET_RULE}: ${CHNROUTES}
	./scripts/make-ipset-rule.sh ${IPSET_NAME} > ${IPSET_RULE} < ${CHNROUTES}

${CONFIG_JS}:
	./scripts/make-config-js.sh ${IPSET_NAME} ${IPTABLES_CHAIN_NAME} > ${CONFIG_JS}

.PHONY: clean distclean install
clean:
	rm -rf ${IPSET_RULE} ${IPTABLES_RULE} ${CONFIG_JS}

distclean: clean
	rm -rf ${CHNROUTES} ${APNIC}

install: all
	sudo ./scripts/install.sh
