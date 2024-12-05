import { useState } from 'react';
import { Card, Box, Stack, Typography, Button, Avatar, AvatarGroup } from '@mui/material';
import { Group } from 'src/types/session';
import { Iconify } from 'src/components/iconify';
import { useGUCData } from 'src/contexts/DataContext';
import { CartControls } from './cart-controls';
import { RemainingUsers } from './remaining-users';

interface GroupCardProps {
  group: Group;
  onManageUsers: (group: Group) => void;
  isActive: boolean;
  onAssignCart: (groupId: string, userId: string, cartId: string, groupUserId: string) => Promise<void>;
}

export function GroupCard({ group, onManageUsers, isActive, onAssignCart }: GroupCardProps) {
  const { getGroupUsers, activeGroupUsers, availableCarts } = useGUCData();
  const groupUsers = getGroupUsers(group.id);
  const [isExpanded, setIsExpanded] = useState(false);

  const getUserDuration = (userId: string) => {
    const activeUser = activeGroupUsers.find(gu => 
      gu.user_id === userId && gu.group_id === group.id
    );
    if (activeUser) {
      return activeUser?.time_in_minutes || activeUser?.allowed_duration || 0;
    }
    const groupUser = groupUsers.find(gu => gu.user_id === userId);
    return groupUser?.time_in_minutes || groupUser?.allowed_duration || 0;
  };

  const handleAssignCart = async (userId: string, cartId: string, groupUserId: string) => {
    await onAssignCart(group.id, userId, cartId, groupUserId);
  };

  const mainUsers = groupUsers.length > 3 ? groupUsers.slice(0, 2) : groupUsers;
  const remainingUsers = groupUsers.length > 3 ? groupUsers.slice(2) : [];

  const getActiveUserData = (userId: string) => 
    activeGroupUsers.find(gu => gu.user_id === userId && gu.group_id === group.id);

  return (
    <Box sx={{ position: 'relative', height: '100%' }}>
      {isExpanded && (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            bgcolor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 998,
            cursor: 'pointer',
          }}
          onClick={() => setIsExpanded(false)}
        />
      )}
      <Card 
        sx={{ 
          height: '330px',
          transition: 'none',
          ...(isExpanded && {
            position: 'absolute',
            zIndex: 999,
            left: 0,
            right: 0,
            height: 'auto',
            minHeight: '100%',
            boxShadow: 24,
            overflow: 'visible',
            mb: 3,
          })
        }}
      >
        <Box sx={{ 
          p: 3, 
          height: '100%',
          display: 'flex', 
          flexDirection: 'column',
          position: 'relative',
        }}>
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
                {groupUsers.length} Racer{groupUsers.length > 1 ? 's' : ''}
              </Typography>
            </Stack>

            {groupUsers.length > 0 ? (
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
                        {(user?.time_in_minutes || user?.allowed_duration || 0)}m
                      </Typography>
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
                      onAssignCart={handleAssignCart}
                      activeUser={getActiveUserData(user?.user?.id) as any}
                    />
                  </Stack>
                ))}
                
                <RemainingUsers 
                  users={remainingUsers}
                  groupId={group.id}
                  cartAssignments={group.cartAssignments}
                  onAssignCart={handleAssignCart}
                  isExpanded={isExpanded}
                  availableCarts={availableCarts}
                  onExpand={setIsExpanded}
                />
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
            sx={{ mt: mainUsers.length > 0 && !isExpanded ? 0 : 3 }}
          >
            Manage Group Users
          </Button>
        </Box>
      </Card>
    </Box>
  );
} 