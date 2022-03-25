// Material UI
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'

export default function Uninstall() {
  return (
    <Box
      display={'flex'}
      flexDirection="column"
      sx={{ overflow: 'hidden', height: '86vh' }}
    >
      <Typography variant="h4">Point Network Uninstaller</Typography>
      <Typography marginTop={2}>Uninstalling...</Typography>
      <Box
        bgcolor="primary.light"
        p={2}
        my={1}
        borderRadius={2}
        flex={1}
        sx={{ overflowY: 'auto' }}
      >
        <Typography>Logs</Typography>
        <Typography>Logs</Typography>
      </Box>
    </Box>
  )
}
