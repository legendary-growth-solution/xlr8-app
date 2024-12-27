import { Box } from '@mui/material';

export function Logo() {
  return (
    <Box
      component="img"
      src="/assets/logo/logo.jpg"
      alt="XLR8 Logo"
      sx={{
        width: 120,
        height: 'auto',
        mb: 4,
        borderRadius: 2,
        boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
      }}
    />
  );
} 