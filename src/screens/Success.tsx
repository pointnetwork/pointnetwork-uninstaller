// Material UI
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'

export default function Success() {
  return (
    <>
      <Typography variant="h4">Point Network Uninstaller</Typography>
      <Typography marginTop={2} marginBottom={30}>
        Uninstalled successfully
      </Typography>
      <Box display="flex" justifyContent="center">
        <Button variant="contained">CLOSE</Button>
      </Box>
    </>
  )
}
