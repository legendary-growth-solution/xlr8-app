import { Box, Typography } from '@mui/material';

interface FuelLevelIndicatorProps {
  value: number;
}

export default function FuelLevelIndicator({ value }: FuelLevelIndicatorProps) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Box
        sx={{
          width: 100,
          height: 10,
          bgcolor: 'grey.200',
          borderRadius: 1,
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            width: `${value}%`,
            height: '100%',
            bgcolor: value < 20 ? 'error.main' : 'success.main',
          }}
        />
      </Box>
      <Typography variant="body2">{value}%</Typography>
    </Box>
  );
} 