import path from 'path'
import os from 'os'

const getHomePath = () => {
  return os.homedir()
}
const getLiveDirectoryPathResources = () => {
  return path.join(getHomePath(), '.point', 'keystore', 'liveprofile')
}

function noop(): void {}

export default Object.freeze({
  noop,
  getHomePath,
  getLiveDirectoryPathResources,
})
