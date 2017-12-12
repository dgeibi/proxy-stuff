const fs = require('fs')
const util = require('util')
const dns = require('dns')

const { runSync } = require('./utils/run')
const wait = require('./utils/wait-until')

const {
  IPTABLES,
  IPTABLES_RESTORE,
  IPSET,
  IPTABLES_CHAIN,
  LOCAL_ADDRESS,
  LOCAL_PORT,
  whiteDomains,
  nameServers
} = require('./config')

const IPTABLES_RULE = `${__dirname}/meta/iptables`
const IPSET_RULE = `${__dirname}/meta/ipset`

require('./flush')

dns.setServers(nameServers)
const resolve = util.promisify(dns.resolve4)

main().catch(err => {
  console.error(err)
})

async function main() {
  runSync(`${IPSET} restore -f ${IPSET_RULE}`)
  runSync(`${IPTABLES_RESTORE} -n ${IPTABLES_RULE}`)

  const configPath = process.argv[2]

  if (!configPath || !fs.existsSync(configPath)) {
    throw Error('config not found')
  }

  let { server, ...ssConfig } = JSON.parse(
    fs.readFileSync(configPath).toString()
  )
  const SERVER_IS_DOMAIN = isDomain(server)
  const HAS_WHITE_DOMAIN = whiteDomains.length > 0
  if (HAS_WHITE_DOMAIN || SERVER_IS_DOMAIN) {
    await wait({
      until: () => resolve('www.baidu.com'),
      times: 300,
      interval: 500
    })

    const bypassIP = ip => {
      runSync(`${IPTABLES} -t nat -A ${IPTABLES_CHAIN} -d ${ip} -j RETURN`)
    }

    if (HAS_WHITE_DOMAIN) {
      await Promise.all(
        whiteDomains.map(domain => resolveDomain(domain, bypassIP))
      )
    }

    if (SERVER_IS_DOMAIN) {
      const ip = (await resolveDomain(server, bypassIP))[0]
      if (!ip) throw Error(`failed to resolve server ${server}`)
      server = ip
    }
  }
  ssConfig.server = server
  ssConfig['local_port'] = LOCAL_PORT
  ssConfig['local_address'] = LOCAL_ADDRESS
  fs.writeFileSync(`${__dirname}/ssr.json`, JSON.stringify(ssConfig))

  runSync(
    `${IPTABLES} -t nat -A ${IPTABLES_CHAIN} -p tcp -j REDIRECT --to-ports ${LOCAL_PORT}`
  )
}

function resolveDomain(domain, handleIP) {
  return resolve(domain).then(ips => {
    if (ips.length < 1) {
      console.log(`${domain} 0 ip`)
    } else {
      ips.forEach(handleIP)
    }
    return ips
  })
}

/**
 * @param {string} anything
 */
function isDomain(anything) {
  const isIPv4 = /^[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}$/.test(
    anything
  )
  const isIPv6 = anything.indexOf(':') > -1
  return !isIPv4 && !isIPv6
}
