import { Box, Typography, keyframes } from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: scale(0.5);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
`;

const checkmarkAnimation = keyframes`
  0% {
    transform: scale(0);
  }
  50% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1);
  }
`;

export function SuccessMessage() {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        py: 8,
        animation: `${fadeIn} 0.5s ease-out`,
      }}
    >
      <CheckCircleOutlineIcon
        sx={{
          fontSize: 80,
          color: 'success.main',
          animation: `${checkmarkAnimation} 0.5s ease-out`,
          mb: 2,
        }}
      />
      <Typography
        variant="h4"
        sx={{
          color: 'success.main',
          textAlign: 'center',
          mb: 2,
        }}
      >
        Registration Successful!
      </Typography>
      <Typography
        variant="body1"
        sx={{
          textAlign: 'center',
          color: 'text.secondary',
        }}
      >
        You can now proceed to the track.
      </Typography>
    </Box>
  );
} 