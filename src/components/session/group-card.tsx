import { Card, Box, Stack, Typography, Button, Avatar, AvatarGroup, Divider } from '@mui/material';
import { Group } from 'src/types/session';
import { Iconify } from 'src/components/iconify';

interface GroupCardProps {
  group: Group;
  onManageUsers: (group: Group) => void;
  isActive: boolean;
}

export function GroupCard({ group, onManageUsers, isActive }: GroupCardProps) {
  const mainUsers = group.users.slice(0, 2);
  const remainingUsers = group.users.slice(2);

  return (
    <Card sx={{ height: '100%' }}>
      <Box sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Stack spacing={3} sx={{ flexGrow: 1 }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Typography variant="h6">
              {group.name}
            </Typography>
            <Typography 
              variant="caption" 
              sx={{ 
                px: 1.5, 
                py: 0.5, 
                borderRadius: 1,
                bgcolor: 'primary.lighter',
                color: 'primary.dark',
                fontWeight: 'bold',
              }}
            >
              {group.users.length} Racer{group.users.length > 1 ? 's' : ''}
            </Typography>
          </Stack>

          {group.users.length > 0 ? (
            <Box sx={{ pt: 1, mt: "0px !important" }}>
              {mainUsers.map((user) => (
                <Stack
                  key={user.id}
                  direction="row"
                  alignItems="center"
                  spacing={2}
                  sx={{
                    py: 1.5,
                    '&:not(:last-child)': {
                      borderBottom: (theme) => `dashed 1px ${theme.palette.divider}`,
                    },
                  }}
                >
                  <Box sx={{ position: 'relative' }}>
                    <Avatar 
                      sx={{ 
                        width: 36, 
                        height: 36,
                        bgcolor: 'primary.main',
                        fontSize: '1rem',
                      }}
                    >
                      {user.name[0]}
                    </Avatar>
                    <Typography
                      variant="caption"
                      sx={{
                        position: 'absolute',
                        bottom: -8,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        px: 1,
                        py: 0.25,
                        borderRadius: 0.75,
                        bgcolor: 'success.lighter',
                        color: 'success.dark',
                        fontSize: '0.65rem',
                        fontWeight: 'bold',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {user.timeInMinutes}m
                    </Typography>
                  </Box>
                  <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                    <Typography variant="subtitle2" noWrap>
                      {user.name}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }} noWrap>
                      {user.email}
                    </Typography>
                  </Box>
                </Stack>
              ))}

              {remainingUsers.length > 0 && (
                <>
                  <Stack direction="row" alignItems="center" spacing={2} mt={2}>
                    <AvatarGroup
                      max={3}
                      sx={{
                        '& .MuiAvatar-root': {
                          width: 28,
                          height: 28,
                          fontSize: '0.75rem',
                          border: (theme) => `solid 2px ${theme.palette.background.paper}`,
                        },
                      }}
                    >
                      {remainingUsers.map((user) => (
                        <Avatar 
                          key={user.id} 
                          alt={user.name}
                          sx={{ bgcolor: 'primary.main' }}
                        >
                          {user.name[0]}
                        </Avatar>
                      ))}
                    </AvatarGroup>
                  </Stack>
                </>
              )}
            </Box>
          ) : (
            <Box 
              sx={{ 
                py: 5, 
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                bgcolor: 'background.neutral',
                borderRadius: 1,
                flexGrow: 1
              }}
            >
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                No racers assigned yet
              </Typography>
            </Box>
          )}
        </Stack>

        <Button
          fullWidth
          variant="contained"
          color="primary"
          startIcon={<Iconify icon="solar:users-group-rounded-bold" />}
          onClick={() => onManageUsers(group)}
          disabled={!isActive}
          sx={{ mt: 3 }}
        >
          Manage Group Users
        </Button>
      </Box>
    </Card>
  );
} 