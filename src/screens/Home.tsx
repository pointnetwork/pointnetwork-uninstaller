import { ReactEventHandler } from 'react'
// Material UI
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Checkbox from '@mui/material/Checkbox'
import Typography from '@mui/material/Typography'

export default function Home({
  isCheckboxChecked = false,
  setIsCheckboxChecked,
  beginUninstallation,
}: {
  isCheckboxChecked: boolean
  setIsCheckboxChecked: Function
  beginUninstallation: ReactEventHandler
}) {
  return (
    <>
      <Typography variant="h4">Point Network Uninstaller</Typography>
      <Typography marginTop={2}>
        The uninstaller will perform the following operations
      </Typography>
      <Box bgcolor="primary.light" p={2} my={1} borderRadius={2}>
        <Typography>
          Stop any running instances of Point Dashboard, Point Node and Point
          Browser (make sure to save and close any activity you’re doing over
          the Point Browser)
        </Typography>
        <Typography marginTop={1}>
          Remove the seed phrases (make sure you have them written down
          somewhere safe)
        </Typography>
        <Typography marginTop={1}>
          Remove the point directory from your system
        </Typography>
      </Box>
      <Box display="flex" alignItems="center" marginBottom={2}>
        <Checkbox
          checked={isCheckboxChecked}
          onChange={() => setIsCheckboxChecked((prev: boolean) => !prev)}
        />
        <Typography variant="body2">
          I’ve read the operations and performed the steps provided
        </Typography>
      </Box>
      <Button
        variant="contained"
        disabled={!isCheckboxChecked}
        onClick={beginUninstallation}
      >
        BEGIN UNINSTALL
      </Button>
    </>
  )
}
