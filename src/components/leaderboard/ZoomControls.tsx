import { Box, IconButton, Slider } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit';

type ZoomControlsProps = {
  zoom: number;
  isFullscreen: boolean;
  onZoomChange: (event: Event, newValue: number | number[]) => void;
  onFullscreenToggle: () => void;
};

export const ZoomControls = ({ zoom, isFullscreen, onZoomChange, onFullscreenToggle }: ZoomControlsProps) => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        position: 'absolute',
        top: 24,
        right: 24,
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        bgcolor: alpha(theme.palette.background.paper, 0.95),
        padding: 2,
        borderRadius: 2,
        boxShadow: 3,
        transition: 'all 0.2s ease',
        '&:hover': {
          boxShadow: 6,
        },
      }}
    >
      <IconButton 
        onClick={() => onZoomChange({} as Event, Math.max(50, zoom - 10))}
        size="small"
      >
        <ZoomOutIcon />
      </IconButton>
      <Slider
        value={zoom}
        onChange={onZoomChange}
        min={50}
        max={200}
        step={10}
        sx={{ width: 100 }}
        valueLabelDisplay="auto"
        valueLabelFormat={(value) => `${value}%`}
        size="small"
      />
      <IconButton 
        onClick={() => onZoomChange({} as Event, Math.min(200, zoom + 10))}
        size="small"
      >
        <ZoomInIcon />
      </IconButton>
      <IconButton 
        onClick={onFullscreenToggle}
        size="small"
      >
        {isFullscreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
      </IconButton>
    </Box>
  );
}; 