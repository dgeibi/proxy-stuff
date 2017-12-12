const { runSync } = require('./utils/run')

const { IPTABLES, IPSET, IPTABLES_CHAIN, IPSET_NAME } = require('./config')

if (
  runSync(`${IPTABLES} -t nat -D PREROUTING -p tcp -j ${IPTABLES_CHAIN}`)
    .status !== 1
) {
  runSync(`${IPTABLES} -t nat -D OUTPUT -p tcp -j ${IPTABLES_CHAIN}`)
  runSync(
    `${IPTABLES} -t nat -F ${IPTABLES_CHAIN} && ${IPTABLES} -t nat -X ${IPTABLES_CHAIN}`,
    /* shell */ true
  )
}
runSync(`${IPSET} destroy ${IPSET_NAME}`)
