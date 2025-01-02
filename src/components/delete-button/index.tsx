import { Button, ButtonProps } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { Iconify } from '../iconify';
import { GlassBox } from '../glass-box';

interface DeleteButtonProps extends Omit<ButtonProps, 'children'> {
  onDelete: () => void;
  containerSx?: object;
  className?: string;
}

export function DeleteButton({ 
  onDelete, 
  disabled, 
  containerSx,
  className,
  sx,
  ...other 
}: DeleteButtonProps) {
  return (
    <GlassBox
      className={className}
      sx={{
        position: 'absolute',
        top: 8,
        right: 8,
        zIndex: 9,
        opacity: 0,  // Start hidden
        transition: 'opacity 0.2s ease-in-out',
        ...containerSx,
      }}
    >
      <Button
        size="small"
        color="error"
        onClick={onDelete}
        disabled={disabled}
        sx={{
          minWidth: 'auto',
          p: 1,
          bgcolor: (theme) =>
            theme.palette.mode === 'light'
              ? 'rgba(255, 72, 66, 0.08)'
              : 'rgba(255, 72, 66, 0.16)',
          '&:hover': {
            bgcolor: (theme) =>
              theme.palette.mode === 'light'
                ? 'rgba(255, 72, 66, 0.1)'
                : 'rgba(255, 72, 66, 0.2)',
          },
          ...sx,
        }}
        {...other}
      >
        <Iconify icon="solar:trash-bin-trash-bold" width={20} />
      </Button>
    </GlassBox>
  );
} 