import { useState } from 'react'
// Material UI
import Box from '@mui/material/Box'
// Components
import UIThemeProvider from './components/UIThemeProvider'
// screens
import HomeScreen from './screens/Home'
import UninstallScreen from './screens/Uninstall'
import SuccessScreen from './screens/Success'

export function App() {
  const [isCheckboxChecked, setIsCheckboxChecked] = useState<boolean>(false)
  const [whichStep, setWhichStep] = useState<number>(1)

  const beginUninstallation = () => {
    console.log('beginUninstallation')
  }

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
        {whichStep === 3 && <SuccessScreen />}
      </Box>
    </UIThemeProvider>
  )
}
