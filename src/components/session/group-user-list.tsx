import { Stack, Box, Avatar, Typography } from '@mui/material';
import { CartControls } from './cart-controls';
import { RemainingUsers } from './remaining-users';

interface GroupUserListProps {
  mainUsers: any[];
  remainingUsers: any[];
  group: any;
  availableCarts: any[];
  onAssignCart: (userId: string, cartId: string, groupUserId: string) => Promise<void>;
  getActiveUserData: (userId: string) => any;
  isExpanded: boolean;
  onExpand: (expanded: boolean) => void;
}

export function GroupUserList({
  mainUsers,
  remainingUsers,
  group,
  availableCarts,
  onAssignCart,
  getActiveUserData,
  isExpanded,
  onExpand
}: GroupUserListProps) {
  if (mainUsers.length === 0) {
    return (
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
    );
  }

  return (
    <Box sx={{ pt: 0.5, mt: "0px !important" }}>
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
              {user.user.name[0]}
            </Avatar>
          </Box>

          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
            <Typography variant="subtitle2" noWrap>
              {user.user.name}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }} noWrap>
              {user.user.email}
            </Typography>
          </Box>

          <CartControls 
            userId={user?.user?.id}
            groupId={group.id}
            groupUserId={user.id}
            cartAssignments={group.cartAssignments}
            availableCarts={availableCarts}
            onAssignCart={onAssignCart}
            activeUser={getActiveUserData(user?.user?.id)}
          />
        </Stack>
      ))}
      
      <RemainingUsers 
        users={remainingUsers}
        groupId={group.id}
        cartAssignments={group.cartAssignments}
        onAssignCart={onAssignCart}
        isExpanded={isExpanded}
        availableCarts={availableCarts}
        onExpand={onExpand}
      />
    </Box>
  );
} 