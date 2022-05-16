import { app, BrowserWindow, ipcMain } from 'electron'
import {
  UNINSTALL_START,
  UNINSTALL_STARTED,
  UNINSTALL_FINISH,
  UNINSTALL_CLOSE,
  UNINSTALL_LOG,
} from './channels'
import { exec } from 'child_process'
import { platform } from 'process'
import type { Process } from '../src/@types/process'
import Logger from '../utils/logger'

const fs = require('fs')
const os = require('os')
const path = require('path')
const find = require('find-process')

let mainWindow: BrowserWindow | null
let logger: Logger

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
  logger = new Logger({ window: mainWindow, channel: UNINSTALL_LOG })

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

// Function to kill the processes while also sending kill logs to UI
const killCmd = platform === 'win32' ? 'taskkill /F /PID' : 'kill'
const killProcesses = async (processes: Process[], label: string) => {
  if (processes.length > 0) {
    logger.info(`Stopping running processes for Point ${label}`)
    for (const p of processes) {
      logger.info(`Stopping Point ${label} process `, p.pid.toString())
      await exec(`${killCmd} ${p.pid}`)
      logger.info(`Stopped Point ${label} process `, p.pid.toString())
    }
    logger.info(`Stopped running processes for Point ${label}`)
  } else {
    logger.info(`No running processes for Point ${label} found`)
  }
}

async function registerListeners() {
  ipcMain.on(UNINSTALL_START, async () => {
    try {
      console.log(UNINSTALL_START)
      // // Send the uninstall started event
      mainWindow!.webContents.send(UNINSTALL_STARTED)
      // Send test logs
      logger.info('Starting uninstallation')
      // Find firefox and kill any running processes
      logger.info('Finding running processes for Point Browser')
      let processes: Process[] = (await find('name', /firefox/i)).filter(
        (p: Process) =>
          p.cmd.includes('point-browser') && !p.cmd.includes('tab')
      )
      await killProcesses(processes, 'Browser')

      // Find Point Node & Dashboard and kill any running processes
      logger.info('Finding running processes for Point Node')
      processes = await find('name', 'point', true)
      await killProcesses(processes, 'Node')

      // Remove the .point directory
      logger.info(
        'Removing saved key phrases and point resources within .point directory'
      )
      try {
        logger.info(
          'Removed saved key phrases and point resources within .point directory'
        )
        const deleteFolderRecursive = function (path: string) {
          if (fs.existsSync(path)) {
            fs.readdirSync(path).forEach(function (file: File) {
              const curPath = path + '/' + file
              if (fs.lstatSync(curPath).isDirectory()) {
                deleteFolderRecursive(curPath)
              } else {
                fs.unlinkSync(curPath)
              }
            })
            fs.rmdirSync(path)
          }
        }
        deleteFolderRecursive(path.join(os.homedir(), '.point'))
      } catch (error) {
        logger.info(
          'Unable to Remove saved key phrases and point resources within .point directory'
        )
      }

      logger.info('Uninstall finished successfully')
      mainWindow!.webContents.send(UNINSTALL_FINISH)
    } catch (error) {
      console.log(error)
    }
  })

  ipcMain.on(UNINSTALL_CLOSE, () => {
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
