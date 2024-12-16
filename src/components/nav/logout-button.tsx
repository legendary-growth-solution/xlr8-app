import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import { SxProps, Theme } from '@mui/material/styles';
import { useAuth } from 'src/hooks/use-auth';
import { useRouter } from 'src/routes/hooks';
import { Iconify } from 'src/components/iconify';

type LogoutButtonProps = {
  onClose: () => void;
  sx?: SxProps<Theme>;
};

export function LogoutButton({ onClose, sx, ...other }: LogoutButtonProps) {
  const { logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/auth');
      onClose();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Stack
      spacing={2}
      direction="row"
      alignItems="center"
      sx={{
        px: 2,
        py: 1.5,
        cursor: 'pointer',
        color: 'error.main',
        '&:hover': {
          bgcolor: 'action.hover',
          borderRadius: 1,
        },
        ...sx,
      }}
      onClick={handleLogout}
      {...other}
    >
      <Iconify icon="solar:logout-2-bold-duotone" />
      <Box component="span">Logout</Box>
    </Stack>
  );
} 