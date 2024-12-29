import { Box } from '@mui/material';
import { Logo } from '../register/Logo';

export const LeaderboardHeader = () => (
  <Box
    sx={{
      display: 'flex',
      justifyContent: 'center',
      width: '100%',
      mb: -5
    }}
  >
    <Box
      sx={{ width: 180, justifyContent: 'center', display: 'flex', alignItems: 'center', mb: 3 }}
    >
      <Logo />
    </Box>
  </Box>
); 