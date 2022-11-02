import { useEffect, useState } from 'react'
// Material UI
import Box from '@mui/material/Box'
// Components
import UIThemeProvider from './components/UIThemeProvider'
// screens
import HomeScreen from './screens/Home'
import UninstallScreen from './screens/Uninstall'
import SuccessScreen from './screens/Success'
// Electron
import { UNINSTALL_FINISH, UNINSTALL_STARTED } from '../electron/channels'

export function App() {
  const [isCheckboxChecked, setIsCheckboxChecked] = useState<boolean>(false)
  const [whichStep, setWhichStep] = useState<number>(1)
  const [errors, setErrors] = useState<string[]>([])

  const beginUninstallation = () => {
    window.Main.startInstallation()
  }

  useEffect(() => {
    window.Main.on(UNINSTALL_STARTED, () => setWhichStep(2))
    window.Main.on(UNINSTALL_FINISH, (_errors: string[]) => {
      setWhichStep(3)
      setErrors(_errors)
    })
  }, [])

  return (
    <UIThemeProvider>
      <Box p="3%">
        {whichStep === 1 && (
          <HomeScreen
            isCheckboxChecked={isCheckboxChecked}
            setIsCheckboxChecked={setIsCheckboxChecked}
            beginUninstallation={beginUninstallation}
          />
        )}
        {whichStep === 2 && <UninstallScreen />}
        {whichStep === 3 && <SuccessScreen errors={errors} />}
      </Box>
    </UIThemeProvider>
  )
}
