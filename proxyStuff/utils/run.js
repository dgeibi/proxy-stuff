const { spawnSync } = require('child_process')

function getArgs(cmd) {
  const [bin, ...paras] = String(cmd)
    .trim()
    .split(/ +/)
  return [bin, paras]
}

exports.runSync = function runSync(cmd = '', shell = false) {
  console.log(cmd)
  if (shell) {
    return spawnSync(cmd, { stdio: 'inherit', shell })
  } else {
    const [bin, paras] = getArgs(cmd)
    return spawnSync(bin, paras, { stdio: 'inherit' })
  }
}
