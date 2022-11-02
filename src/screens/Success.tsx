// Material UI
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import { FunctionComponent } from 'react'

const Success: FunctionComponent<{ errors: string[] }> = ({ errors }) => {
  return (
    <>
      <Typography variant="h4">Point Network Uninstaller</Typography>
      <Typography marginTop={2} marginBottom={2}>
        Uninstalled {errors.length > 0 ? 'with errors' : 'successfully'}
      </Typography>
      {errors.map((error, index) => (
        <Typography color={'indianred'} key={index}>{error}</Typography>
      ))}
      <Box display="flex" justifyContent="center" marginTop={30}>
        <Button variant="contained" onClick={window.Main.closeInstaller}>
          CLOSE
        </Button>
      </Box>
    </>
  )
}

export default Success
