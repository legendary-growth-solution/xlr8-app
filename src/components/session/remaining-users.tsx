import { Avatar, AvatarGroup, Box, Collapse, Stack, Typography } from '@mui/material';
import { Iconify } from 'src/components/iconify';
import { Cart } from 'src/types/cart';
import { GroupUserMappingWithUser } from 'src/types/session';
import { CartControls } from './cart-controls';
import { UserInfo } from './user-info';

interface RemainingUsersProps {
  users: GroupUserMappingWithUser[];
  groupId: string;
  cartAssignments: any[];
  onAssignCart: (userId: string, cartId: string, groupUserId: string) => Promise<void>;
  isExpanded: boolean;
  onExpand: (expanded: boolean) => void;
  availableCarts?: Cart[];
  getActiveUserData: (userId: string) => any;
  isUpdating?: boolean;
}

export function RemainingUsers({ 
  users, 
  groupId, 
  cartAssignments, 
  onAssignCart,
  isExpanded,
  onExpand,
  availableCarts,
  getActiveUserData,
  isUpdating,
}: RemainingUsersProps) {
  if (users.length === 0) return null;

  const getUserDuration = (userId: string) => {
    const mapping = users.find(gu => gu.group_id === groupId && gu.user_id === userId);
    return (mapping?.time_in_minutes || mapping?.allowed_duration || 0);
  };

  return (
    <Box>
      {!isExpanded && (
        <Stack 
          direction="row" 
          alignItems="center" 
          spacing={2}
          onClick={() => onExpand(true)}
          sx={{ 
            cursor: 'pointer',
            p: 0.5,
            mt: 1,
            mb: -1,
            '&:hover': {
              bgcolor: 'primary.lighter',
              borderRadius: 1,
            },
          }}
        >
          <AvatarGroup
            max={3}
            sx={{
              '& .MuiAvatar-root': {
                width: 36,
                height: 36,
                fontSize: '0.875rem',
                border: theme => `solid 2px ${theme.palette.background.paper}`,
                bgcolor: 'primary.main',
              },
            }}
          >
            {users.map((user) => (
              <Avatar key={user.id}>
                {user.user.name[0]}
              </Avatar>
            ))}
          </AvatarGroup>
          
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="subtitle2">
              {users.length} more racer{users.length > 1 ? 's' : ''}
            </Typography>
          </Box>
          
          <Iconify 
            icon="eva:chevron-down-fill"
            sx={{ 
              color: 'text.secondary',
              width: 20,
              height: 20,
            }}
          />
        </Stack>
      )}

      <Collapse in={isExpanded}>
        <Box sx={{ maxHeight: 400, overflowY: 'auto' }}>
          {users.map((user) => (
            <Stack
              key={user.id}
              direction="row"
              alignItems="center"
              spacing={2}
              sx={{
                py: 1.5,
                borderBottom: (theme) => `dashed 1px ${theme.palette.divider}`,
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
                  {user?.time_in_minutes ? `${user.time_in_minutes}m` : `${getUserDuration(user.user_id)}m`}
                </Typography>
              </Box>

              <UserInfo groupId={groupId} name={user.user.name} email={user.user.email} userId={user.user.id} />

              <CartControls 
                userId={user.user_id}
                groupId={groupId}
                groupUserId={user.id}
                cartAssignments={cartAssignments}
                onAssignCart={onAssignCart}
                availableCarts={availableCarts || []}
                activeUser={getActiveUserData(user.user_id)}
                isUpdating={isUpdating}
                isOptimistic={user.id.toString().includes('.')}
              />
            </Stack>
          ))}
        </Box>

        <Stack 
          direction="row" 
          alignItems="center" 
          spacing={0.5}
          onClick={() => onExpand(false)}
          sx={{ 
            cursor: 'pointer',
            justifyContent: 'center',
            mt: 2,
            py: 1,
            color: 'text.secondary',
            '&:hover': {
              color: 'primary.main',
              bgcolor: 'primary.lighter',
              borderRadius: 1,
            },
          }}
        >
          <Typography variant="caption">
            View Less
          </Typography>
          <Iconify 
            icon="eva:chevron-up-fill"
            width={16}
          />
        </Stack>
      </Collapse>
    </Box>
  );
} 