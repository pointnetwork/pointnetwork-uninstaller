import { useEffect, useRef, useState } from 'react'
// Material UI
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
// Electron
import { UNINSTALL_LOG } from '../../electron/channels'

export default function Uninstall() {
  const logsElementRef = useRef<HTMLDivElement>()
  const [logs, setLogs] = useState<string[]>([])

  useEffect(() => {
    window.Main.on(UNINSTALL_LOG, (log: string) => {
      setLogs(prev => [...prev, log])
      logsElementRef.current?.scroll(0, logsElementRef.current.scrollHeight)
    })
  }, [])

  return (
    <Box
      display={'flex'}
      flexDirection="column"
      sx={{ overflow: 'hidden', height: '86vh' }}
    >
      <Typography variant="h4">Point Network Uninstaller</Typography>
      <Typography marginTop={2}>Uninstalling...</Typography>
      <Box
        ref={logsElementRef}
        bgcolor="primary.light"
        p={2}
        my={1}
        borderRadius={2}
        flex={1}
        sx={{ overflowY: 'auto' }}
      >
        {logs.map(log => (
          <Typography key={log}>{log}</Typography>
        ))}
      </Box>
    </Box>
  )
}
