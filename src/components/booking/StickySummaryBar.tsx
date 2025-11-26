import { Box, Chip, Stack, Typography } from '@mui/material';

interface StickySummaryBarProps {
  peopleCount: number;
  total: number;
  hasDiscount?: boolean;
  originalTotal?: number;
}

export function StickySummaryBar({ peopleCount, total, hasDiscount, originalTotal }: StickySummaryBarProps) {
  return (
    <Box
      sx={{
        px: 3,
        py: 2,
        backgroundColor: 'grey.50',
        borderTop: '1px solid',
        borderColor: 'grey.200',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      <Stack spacing={0.5}>
        <Typography variant="caption" color="text.secondary">
          People / Items
        </Typography>
        <Typography variant="h6" fontWeight="bold">
          {peopleCount}
        </Typography>
      </Stack>
      <Stack alignItems="flex-end" spacing={0.5}>
        <Typography variant="caption" color="text.secondary">
          Total Amount
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {hasDiscount && originalTotal && (
            <Typography 
              variant="body2" 
              sx={{ 
                textDecoration: 'line-through',
                color: 'text.disabled',
              }}
            >
              ₹{originalTotal}
            </Typography>
          )}
          <Typography variant="h5" color="primary" fontWeight="bold">
            ₹{total}
          </Typography>
          {hasDiscount && (
            <Chip label="Discount" color="success" size="small" sx={{ height: 20 }} />
          )}
        </Box>
      </Stack>
    </Box>
  );
}

