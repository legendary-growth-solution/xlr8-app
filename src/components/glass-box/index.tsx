import { Box, BoxProps } from '@mui/material';
import { alpha } from '@mui/material/styles';

interface GlassBoxProps extends BoxProps {
  show?: boolean;
}

export function GlassBox({ children, show = true, sx, ...other }: GlassBoxProps) {
  return (
    <Box
      sx={{
        opacity: show ? 1 : 0,
        transition: 'all 0.2s ease-in-out',
        borderRadius: 1,
        p: 0,
        backdropFilter: 'blur(8px)',
        backgroundColor: (theme) =>
          theme.palette.mode === 'light' ? 'rgba(255, 255, 255, 0.4)' : 'rgba(22, 28, 36, 0.4)',
        border: (theme) =>
          `solid 1px ${
            theme.palette.mode === 'light'
              ? 'rgba(255, 255, 255, 0.6)'
              : 'rgba(255, 255, 255, 0.1)'
          }`,
        boxShadow: (theme) =>
          theme.palette.mode === 'light'
            ? '0 0 1px 0 rgba(0,0,0,0.08), 0 2px 4px -1px rgba(0,0,0,0.08)'
            : '0 0 1px 0 rgba(0,0,0,0.12), 0 2px 4px -1px rgba(0,0,0,0.12)',
        ...sx,
      }}
      {...other}
    >
      {children}
    </Box>
  );
} 