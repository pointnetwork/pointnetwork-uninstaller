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
import fs from 'fs'
import os from 'os'
import path from 'path'
import find from 'find-process'
import type { Process } from '../src/@types/process'

let mainWindow: BrowserWindow | null

declare const MAIN_WINDOW_WEBPACK_ENTRY: string
declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string

const FAILED_TO_REMOVE_DIR =
  'Failed to delete .point directory. Please, try doing it manually:\n'
const FAILED_TO_REMOVE_SOFTWARE =
  'Failed to delete point software. Please, try doing it manually:\n'

const ERROR_HINTS = {
  POINT_DIR: {
    win32: FAILED_TO_REMOVE_DIR + 'C:\\Users\\<your_user_name>\\.point',
    linux: FAILED_TO_REMOVE_DIR + '~/.point',
    darwin: '~/.point',
  },
  POINT_SOFTWARE: {
    win32:
      FAILED_TO_REMOVE_SOFTWARE +
      'Control Panel -> Programs and Components -> Find "Point" in the list -> Click "Remove"',
    linux: FAILED_TO_REMOVE_SOFTWARE + 'sudo dpkg -P point',
    darwin:
      FAILED_TO_REMOVE_SOFTWARE +
      'Open LaunchPad -> Find "Point" app -> Click and hold -> Click on "X" in the upper left corner',
  },
} as const

const deleteFolderRecursive = async (path: string) => {
  if (fs.existsSync(path)) {
    const contents = await fs.promises.readdir(path)
    await Promise.all(
      contents.map(async file => {
        const curPath = path + '/' + file
        if ((await fs.promises.lstat(curPath)).isDirectory()) {
          await deleteFolderRecursive(curPath)
        } else {
          await fs.promises.unlink(curPath)
        }
      })
    )
    await fs.promises.rmdir(path)
  }
}

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

const uninstallSoftware = () =>
  new Promise<void>(async (resolve, reject) => {
    let cmd: string
    switch (platform) {
      case 'win32':
        cmd = 'msiexec /uninstall {011D1B02-4E73-40DB-806A-546141AF1D07}'
        break
      case 'darwin':
        cmd = 'sudo uninstall file://Applications/Point.app'
        break
      case 'linux':
        cmd = 'sudo dpkg -P point'
        break
      default:
        throw new Error('')
    }
    const proc = await exec(cmd)

    proc.on('stdout', data => {
      console.error(data)
    })

    proc.on('stderr', data => {
      console.error(data)
    })

    proc.on('exit', code => {
      if (code === 0) {
        resolve()
      } else {
        reject(new Error(`Process exited with code ${code}`))
      }
    })
  })

async function registerListeners() {
  ipcMain.on(UNINSTALL_START, async () => {
    try {
      console.log(UNINSTALL_START)
      // Send the uninstall started event
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

      const errors = []
      // Remove the .point directory
      log2UI(
        'Removing saved key phrases and pointnetwork resources within .point directory'
      )
      try {
        log2UI(
          'Removed saved key phrases and pointnetwork resources within .point directory'
        )
        await deleteFolderRecursive(path.join(os.homedir(), '.point'))
      } catch (error) {
        errors.push(ERROR_HINTS.POINT_DIR[platform as 'linux'])
        log2UI(
          'Unable to Remove saved key phrases and pointnetwork resources within .point directory'
        )
      }

      try {
        await uninstallSoftware()
        log2UI('Successfully uninstalled point software')
      } catch (e) {
        errors.push(ERROR_HINTS.POINT_SOFTWARE[platform as 'linux'])
        log2UI(`Failed to uninstall point software.`)
      }

      log2UI('Uninstall finished successfully')
      mainWindow!.webContents.send(UNINSTALL_FINISH, errors)
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
  app.quit()
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})
