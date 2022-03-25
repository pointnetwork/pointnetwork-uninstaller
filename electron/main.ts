import { app, BrowserWindow, ipcMain } from 'electron'
import {
  UNINSTALL_START,
  UNINSTALL_STARTED,
  UNINSTALL_FINISH,
  UNINSTALL_CLOSE,
  UNINSTALL_LOG,
} from './channels'

let mainWindow: BrowserWindow | null

declare const MAIN_WINDOW_WEBPACK_ENTRY: string
declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string

function createWindow() {
  mainWindow = new BrowserWindow({
    autoHideMenuBar: true,
    resizable: false,
    maximizable: false,
    width: 640,
    height: 480,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
    },
  })

  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY)

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

async function registerListeners() {
  ipcMain.on(UNINSTALL_START, () => {
    console.log(UNINSTALL_START)
    mainWindow!.webContents.send(UNINSTALL_STARTED)
    console.log(UNINSTALL_STARTED)
    mainWindow!.webContents.send(UNINSTALL_LOG, 'Test log 1')
    mainWindow!.webContents.send(UNINSTALL_LOG, 'Test log 2')
    setTimeout(() => {
      mainWindow!.webContents.send(UNINSTALL_FINISH)
      console.log(UNINSTALL_FINISH)
    }, 3000)
  })

  ipcMain.on(UNINSTALL_CLOSE, () => {
    console.log(UNINSTALL_START)
    mainWindow!.close()
  })
}

app
  .on('ready', createWindow)
  .whenReady()
  .then(registerListeners)
  .catch(e => console.error(e))

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})
