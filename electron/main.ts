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

const fs = require('fs')
const os = require('os')
const path = require('path')
const find = require('find-process')

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

// Function to send the logs to the UI
const log2UI = (...args: any) => {
  console.log(...args)
  mainWindow!.webContents.send(UNINSTALL_LOG, args)
}

// Function to kill the processes while also sending kill logs to UI
const killCmd = platform === 'win32' ? 'taskkill /F /PID' : 'kill'
const killProcesses = async (processes: Process[], label: string) => {
  if (processes.length > 0) {
    log2UI(`Stopping running processes for PointNetwork ${label}`)
    for (const p of processes) {
      log2UI('Stopping PointNetwork Browser process ', p.pid)
      await exec(`${killCmd} ${p.pid}`)
      log2UI('Stopped PointNetwork Browser process ', p.pid)
    }
    log2UI(`Stopped running processes for PointNetwork ${label}`)
  } else {
    log2UI(`No running processes for PointNetwork ${label} found`)
  }
}

async function registerListeners() {
  ipcMain.on(UNINSTALL_START, async () => {
    try {
      console.log(UNINSTALL_START)
      // // Send the uninstall started event
      mainWindow!.webContents.send(UNINSTALL_STARTED)
      // Send test logs
      log2UI('Starting uninstallation')
      // Find firefox and kill any running processes
      log2UI('Finding running processes for PointNetwork Browser')
      let processes: Process[] = (await find('name', /firefox/i)).filter(
        (p: Process) =>
          p.cmd.includes('point-browser') && !p.cmd.includes('tab')
      )
      await killProcesses(processes, 'Browser')

      // Find PointNetwork Node and kill any running processes
      log2UI('Finding running processes for PointNetwork Node')
      processes = await find('name', 'point', true)
      await killProcesses(processes, 'Node')

      // Find PointNetwork Dashboard and kill any running processes
      log2UI('Finding running processes for PointNetwork Dashboard')
      processes = await find('name', 'pointnetwork-dashboard', true)
      await killProcesses(processes, 'Dashboard')

      // Remove the .point directory
      log2UI(
        'Removing saved key phrases and pointnetwork resources within .point directory'
      )
      try {
        log2UI(
          'Removed saved key phrases and pointnetwork resources within .point directory'
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
        log2UI(
          'Unable to Remove saved key phrases and pointnetwork resources within .point directory'
        )
      }

      log2UI('Uninstall finished successfully')
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
