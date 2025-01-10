import { Avatar, Box, Stack, Typography } from '@mui/material';
import { CartControls } from './cart-controls';
import { Cart, Group, Plan, User, UserRaceStatus } from 'src/types/session';

interface GroupUserListProps {
  users: User[];
  group: Group;
  carts: Cart[];
  getCarts: VoidFunction;
  handleAssignCart: (group_id: string, user_id: string, cart_id: string) => void;
  handleManageUserRace: (group_id: string, user_id: string, status: UserRaceStatus) => void;
}

export function GroupUserList({
  users,
  group,
  carts,
  handleAssignCart,
  handleManageUserRace
}: GroupUserListProps) {
  if (users.length === 0) {
    return (
      <Box
        sx={{
          py: 5,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          bgcolor: 'background.neutral',
          borderRadius: 1,
          flexGrow: 1,
        }}
      >
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          No racers assigned yet
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ pt: 0.5, mt: '0px !important' }}>
      {users.map((user) => (
        <Stack
          key={user.user_id}
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
              {user.user_name}
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
              {user?.time_allotted}m
            </Typography>
          </Box>

          <Box
            sx={{
              flexGrow: 1,
              minWidth: 0,
              width: '40%',
              mr: 2
            }}
          // onClick={handleRedirect}
          >
            <Typography variant="subtitle2" noWrap>
              {user?.user_name}
            </Typography>
          </Box>

          <Box sx={{ flexShrink: 0 }}>
            <CartControls
              handleManageUserRace={handleManageUserRace}
              user={user}
              group_id={group.group_id}
              carts={carts}
              handleAssignCart={handleAssignCart}
            />
          </Box>
        </Stack>
      ))}
    </Box>
  );
}
