const {readFileSync} = require('fs')
const config = require('./config')

const getChannels = channelFilePath => {
  const channelsString = readFileSync(channelFilePath, {encoding: 'utf8'})
  // todo: get more channel info (oldest indexed date)
  const channels = channelsString.trim().split('\n')

  return channels
}

module.exports = getChannels(config.CHANNEL_LOCATION)
