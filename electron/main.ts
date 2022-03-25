import { app, BrowserWindow, ipcMain } from 'electron'
import {
  UNINSTALL_START,
  UNINSTALL_STARTED,
  UNINSTALL_FINISH,
  UNINSTALL_CLOSE,
  UNINSTALL_LOG,
} from './channels'
import { exec } from 'child_process'
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

const log2UI = (...args: any) => {
  console.log(...args)
  mainWindow!.webContents.send(UNINSTALL_LOG, args)
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
      let processes: Process[] = await find('name', /firefox/i)
      const pointBrowserParentProcesses = processes.filter(
        p => p.cmd.includes('point-browser') && !p.cmd.includes('tab')
      )
      if (pointBrowserParentProcesses.length > 0) {
        log2UI('Stopping running processes for PointNetwork Browser')
        for (const p of pointBrowserParentProcesses) {
          log2UI('Stopping PointNetwork Browser process ', p.pid)
          await exec(`taskkill /F /PID ${p.pid}`)
          log2UI('Stopped PointNetwork Browser process ', p.pid)
        }
        log2UI('Stopped running processes for PointNetwork Browser')
      } else {
        log2UI('No running processes for PointNetwork Browser found')
      }

      // Find PointNetwork Node and kill any running processes
      log2UI('Finding running processes for PointNetwork Node')
      processes = await find('name', 'point', true)
      if (processes.length > 0) {
        log2UI('Stopping running processes for PointNetwork Node')
        for (const p of processes) {
          log2UI('Stopping PointNetwork Node process ', p.pid)
          await exec(`taskkill /F /PID ${p.pid}`)
          log2UI('Stopped PointNetwork Node process ', p.pid)
        }
        log2UI('Stopped running processes for PointNetwork Node')
      } else {
        log2UI('No running processes for PointNetwork Node found')
      }

      // Find PointNetwork Dashboard and kill any running processes
      log2UI('Finding running processes for PointNetwork Dashboard')
      processes = await find('name', 'pointnetwork-dashboard', true)
      if (processes.length > 0) {
        log2UI('Stopping running processes for PointNetwork Dashboard')
        for (const p of processes) {
          log2UI('Stopping PointNetwork Dashboard process ', p.pid)
          await exec(`taskkill /F /PID ${p.pid}`)
          log2UI('Stopped PointNetwork Dashboard process ', p.pid)
        }
        log2UI('Stopped running processes for PointNetwork Dashboard')
      } else {
        log2UI('No running processes for PointNetwork Dashboard found')
      }

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
      setTimeout(() => {
        console.log(UNINSTALL_FINISH)
        mainWindow!.webContents.send(UNINSTALL_FINISH)
      }, 2000)
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
