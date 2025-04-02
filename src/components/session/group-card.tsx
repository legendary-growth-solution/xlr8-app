import { useState, useCallback, useEffect } from 'react';
import { Card, Box, Stack, Typography, Button } from '@mui/material';
import { Cart, Group, NewUser, Plan, UpdatingUser, User, UserRaceStatus } from 'src/types/session';
import { Iconify } from 'src/components/iconify';
import { GroupUserList } from './group-user-list';
import { ConfirmDialog } from '../dialog/confirm-dialog';
import { DeleteButton } from '../delete-button';
import { ManageUsersDialog } from './manage-users-dialog';

interface GroupCardProps {
  group: Group;
  carts: Cart[];
  getCarts: VoidFunction;
  plans: Plan[];
  handleAssignCart: (group_id: string, user_id: string, cart_id: string) => void;
  handleRemoveUser: (group_id: string, user_id: string) => void;
  handleDeleteGroup: (group_id: string) => void;
  handleAddUsers: (group_id: string, data: NewUser[]) => void;
  handleUpdateUser: (group_id: string, user_id: string, data: UpdatingUser) => void;
  handleManageUserRace: (group_id: string, user_id: string, status: UserRaceStatus) => void;
  sessionId: string;
  users: User[];
}

export function GroupCard({
  group,
  carts,
  getCarts,
  plans,
  handleAssignCart,
  handleDeleteGroup,
  handleManageUserRace,
  handleRemoveUser,
  handleAddUsers,
  handleUpdateUser,
  sessionId,
  users,
}: GroupCardProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showManageUsers, setShowManageUsers] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [localGroup, setLocalGroup] = useState(group);

  useEffect(() => {
    setLocalGroup((prev) => {
      const optimisticUsers = prev?.users?.filter((u) => (u as any)._isOptimistic) || [];
      const nonOptimisticUsers = group.users.filter(
        (u) => !optimisticUsers.some((ou) => ou.user_id === u.user_id)
      );

      return {
        ...group,
        users: [...nonOptimisticUsers, ...optimisticUsers],
      };
    });
  }, [group]);

  const handleLocalRemoveUser = useCallback(
    (groupId: string, userId: string) => {
      handleRemoveUser(groupId, userId);
      setLocalGroup((prev) => ({
        ...prev,
        users: prev.users.filter((u) => u.user_id !== userId),
      }));
    },
    [handleRemoveUser]
  );

  const handleLocalAddUsers = useCallback(
    async (groupId: string, newUsers: NewUser[], onComplete?: () => void) => {
      const optimisticUsers = newUsers.map((user) => ({
        user_id: user.user_id,
        user_name: user.user_name,
        name: user.user_name,
        email: '',
        phone: '',
        plan_id: user.plan_id,
        time_in_minutes: user.time_in_minutes,
        cart_id: null,
        race_active: false,
        total_active_seconds: 0,
        time_allotted: user.time_in_minutes || 0,
        race_end_time: '',
        race_start_times: [],
        race_pause_times: [],
        total_remaining_seconds: user.time_in_minutes || 0,
        _isOptimistic: true,
      }));

      setLocalGroup((prev) => ({
        ...prev,
        users: [...prev.users, ...optimisticUsers] as any,
      }));

      try {
        await handleAddUsers(groupId, newUsers);
        await new Promise(resolve => setTimeout(resolve, 500));
        setLocalGroup((prev) => ({
          ...prev,
          users: prev.users.map(u => 
            (u as any)._isOptimistic ? 
              { ...u, _isOptimistic: false } : 
              u
          ),
        }));
        if (onComplete) onComplete();
      } catch (error) {
        console.error('Error adding users:', error);
        setLocalGroup((prev) => ({
          ...prev,
          users: prev.users.filter((u) => !(u as any)._isOptimistic),
        }));
        if (onComplete) onComplete();
      }
    },
    [handleAddUsers]
  );

  return (
    <Box sx={{ position: 'relative', height: '100%' }}>
      <Card
        sx={{
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            transform: isDeleting ? 'none' : 'scale(1.02)',
            boxShadow: isDeleting ? 'none' : 24,
            zIndex: 999,
          },
          '&:hover .delete-icon': {
            opacity: isDeleting ? 0 : 1,
          },
          height: '100%',
          overflow: 'visible',
          opacity: isDeleting ? 0.5 : 1,
          pointerEvents: isDeleting ? 'none' : 'auto',
          filter: isDeleting ? 'grayscale(100%)' : 'none',
        }}
      >
        <DeleteButton
          className="delete-icon"
          onDelete={() => setShowDeleteDialog(true)}
          sx={{ opacity: 1 }}
          disabled={isDeleting}
        />

        <Box
          sx={{
            p: 3,
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
          }}
        >
          <Stack spacing={3} sx={{ flexGrow: 1 }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Typography variant="h6">{localGroup.name}</Typography>
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
                {localGroup?.users.length} Racers
              </Typography>
            </Stack>

            <GroupUserList
              users={localGroup?.users}
              group={localGroup}
              carts={carts}
              getCarts={getCarts}
              handleAssignCart={handleAssignCart}
              handleManageUserRace={handleManageUserRace}
              plans={plans}
            />
          </Stack>

          <Stack direction={{ xs: 'column', sm: 'row', lg: 'column' }} spacing={2} marginTop={2}>
            <Button
              variant="contained"
              color="primary"
              startIcon={<Iconify icon="solar:users-group-rounded-bold" />}
              onClick={() => setShowManageUsers(true)}
              disabled={isDeleting}
            >
              Manage Group Users
            </Button>
          </Stack>
        </Box>
      </Card>

      <ConfirmDialog
        open={showDeleteDialog}
        title="Delete Group"
        content={`Are you sure you want to delete ${group.name}? This action cannot be undone.`}
        confirmText="Delete"
        confirmColor="error"
        loading={isDeleting}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={() => {
          setIsDeleting(true);
          handleDeleteGroup(group?.group_id);
          setShowDeleteDialog(false);
        }}
      />

      <ManageUsersDialog
        open={showManageUsers}
        onClose={() => {
          setShowManageUsers(false);
        }}
        group={localGroup}
        handleUpdateUser={handleUpdateUser}
        handleAddUsers={handleLocalAddUsers}
        handleRemoveUser={handleLocalRemoveUser}
        plans={plans}
        sessionUsers={users as any}
      />
    </Box>
  );
}
