import { contextBridge, ipcRenderer } from 'electron'
import { UNINSTALL_START, UNINSTALL_CLOSE } from './channels'

export const api = {
  startInstallation: () => {
    ipcRenderer.send(UNINSTALL_START)
  },
  closeInstaller: () => {
    ipcRenderer.send(UNINSTALL_CLOSE)
  },
  on: (channel: string, callback: Function) => {
    ipcRenderer.on(channel, (_, data) => callback(data))
  },
}

contextBridge.exposeInMainWorld('Main', api)
