import { Box, Typography } from '@mui/material';

export const LeaderboardFooter = () => (
  <Box
    sx={{
      display: 'flex',
      flexDirection: { xs: 'column', sm: 'row' },
      alignItems: 'center',
      justifyContent: 'center',
      mt: 4,
      pt: 3,
      borderTop: '1px solid',
      borderColor: 'divider',
      gap: 2,
    }}
  >
    <Box sx={{ textAlign: 'center' }}>
      <Typography
        variant="body1"
        sx={{
          color: 'text.secondary',
          fontWeight: 500,
          mb: 1,
        }}
      >
        📍 Halff Time Venue, Khasra 54, Drugdhamna, Maharashtra 440023
      </Typography>
      <Typography
        variant="body1"
        sx={{
          color: 'text.secondary',
          fontWeight: 500,
        }}
      >
        📞 +91 99706 66666
      </Typography>
    </Box>
  </Box>
); 