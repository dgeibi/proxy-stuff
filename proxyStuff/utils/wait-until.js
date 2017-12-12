module.exports = async function wait(
  { until, times = 30, interval = 500 } = {}
) {
  while (times > 0) {
    try {
      return await until()
    } catch (e) {}
    await delay(interval)
    times -= 1
  }
  throw Error('wait failed')
}

function delay(ms) {
  return new Promise(resolve => {
    setTimeout(resolve, ms)
  })
}
