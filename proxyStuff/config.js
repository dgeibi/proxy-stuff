module.exports = {
  IPTABLES: '/usr/bin/iptables',
  IPSET: '/usr/bin/ipset',
  IPTABLES_RESTORE: '/usr/bin/iptables-restore',
  IPSET_NAME: 'chnroute',
  IPTABLES_CHAIN: 'SHADOWSOCKS',
  LOCAL_PORT: 12345,
  LOCAL_ADDRESS: '0.0.0.0',
  whiteDomains: ['monocloud.net'],
  nameServers: ['119.29.29.29', '114.114.114.114']
}
