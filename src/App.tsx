import { useState } from 'react'
// Material UI
import Box from '@mui/material/Box'
// Components
import UIThemeProvider from './components/UIThemeProvider'
// screens
import HomeScreen from './screens/Home'

export function App() {
  const [isCheckboxChecked, setIsCheckboxChecked] = useState<boolean>(false)

  const beginUninstallation = () => {
    console.log('beginUninstallation')
  }

  return (
    <UIThemeProvider>
      <Box p="3%">
        <HomeScreen
          isCheckboxChecked={isCheckboxChecked}
          setIsCheckboxChecked={setIsCheckboxChecked}
          beginUninstallation={beginUninstallation}
        />
      </Box>
    </UIThemeProvider>
  )
}
