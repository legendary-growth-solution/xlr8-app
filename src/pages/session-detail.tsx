import { Badge, Box, Button, Card, Grid, Stack, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate, useParams } from 'react-router-dom';
import { ConfirmDialog } from 'src/components/dialog/confirm-dialog';
import { Iconify } from 'src/components/iconify';
import { CreateGroupDialog } from 'src/components/session/create-group-dialog';
import { GroupCard } from 'src/components/session/group-card';
import { ManageUsersDialog } from 'src/components/session/manage-users-dialog';
import { GroupSkeleton } from 'src/components/skeleton/GroupSkeleton';
import { SessionPageSkeleton } from 'src/components/skeleton/SessionPageSkeleton';
import Toast, { showToast } from 'src/components/toast';
import { useGUCData } from 'src/contexts/DataContext';
import { useBoolean } from 'src/hooks/use-boolean';
import { cartApi } from 'src/services/api/cart.api';
import { groupApi } from 'src/services/api/group.api';
import { sessionApi } from 'src/services/api/session.api';
import { Group, Session } from 'src/types/session';
import LiveLeaderboard from './live-leaderboard';

interface SelectedUser {
  userId: string;
  timeInMinutes: number;
  planId?: string;
}

export default function SessionDetailPage() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const [session, setSession] = useState<Session | null>(null);
  const [groups, setGroups] = useState<Group[]>([]);
  const [openNewGroup, setOpenNewGroup] = useState(false);
  const [loading, setLoading] = useState(false);
  const [newGroupData, setNewGroupData] = useState({
    name: '',
    timeInMinutes: 15,
  });
  const [openUserDialog, setOpenUserDialog] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [selectedUsers, setSelectedUsers] = useState<SelectedUser[]>([]);
  const [openEndSession, setOpenEndSession] = useState(false);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewConfirmation, setReviewConfirmation] = useState(false);
  
  
  const manageUsers = useBoolean();
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const {
    users: allUsers,
    fetchUsers,
    refreshGroupUsers,
    refreshCarts,
    initGUC,
  } = useGUCData(false);
  const [sessionLoading, setSessionLoading] = useState(true);
  const [groupDataLoad, setGroupDataLoad] = useState(true);
  const [deletedGroups, setDeletedGroups] = useState<string[]>([]);

  useEffect(() => {
    const init = async () => {
      await fetchSessionDetails();
      await initGUC();
    };
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchSessionDetails = async () => {
    try {
      const sessionData = await sessionApi.getById(id);
      setSession(sessionData);
      setSessionLoading(false);
      setGroupDataLoad(false);

      if (sessionData.groups) {
        setGroups(sessionData.groups);
      }
    } catch (error) {
      console.error('Error fetching session details:', error);
      setSession(null);
      setGroups([]);
    } finally {
      setGroupDataLoad(false);
    }
  };

  // const getAvailableUsers = () => {
  //   const assignedUserIds = groups.flatMap(group => group.users.map(user => user.id));
  //   return allUsers.filter((user :any) => !assignedUserIds.includes(user.id));
  // };

  const handleEndSession = async () => {
    try {
      setLoading(true);
      try {
        await sessionApi.update(session!.id, {
          status: 'completed',
          end_time: new Date().toISOString(),
        });
        showToast.success('Session ended successfully');
        window?.location?.reload();
      } catch (error) {
        console.error('Error ending session:', error);
        showToast.error('Failed to end session.', {
          description: error?.response?.data?.error,
        });
      }
    } catch (error) {
      console.error('Error ending session:', error);
      showToast.error('Failed to end session. Please try again.');
    } finally {
      setLoading(false);
      setOpenEndSession(false);
    }
  };

  const handleReviewLink = () => {
    showToast.error('Feature under development!');    
  };

  // const handleOpenUserDialog = (groupId: string) => {
  //   setSelectedGroupId(groupId);
  //   setSelectedUsers([]);
  //   setOpenUserDialog(true);
  // };

  // const handleAddUsers = async () => {
  //   if (!selectedGroupId) return;

  //   try {
  //     setLoading(true);
  //     const selectedGroupFinal = groups.find(g => g.id === selectedGroupId);

  //     if (selectedGroupFinal) {
  //       const newUsers = selectedUsers.map(su => ({
  //         ...allUsers.find((u :any) => u.id === su.userId)!,
  //         timeInMinutes: su.timeInMinutes,
  //       }));

  //       await groupApi.addUsers(selectedGroupId, {
  //         users: selectedUsers.map(user => ({
  //           userId: user.userId,
  //           timeInMinutes: user.timeInMinutes
  //         }))
  //       });

  //       await fetchSessionDetails();
  //     }

  //     setOpenUserDialog(false);
  //     setSelectedUsers([]);
  //   } catch (error) {
  //     console.error('Error adding users:', error);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const handleCreateGroup = async () => {
    if (!session) return;

    try {
      setLoading(true);

      const response = await sessionApi.createGroup(session.id, {
        name: newGroupData.name,
      });

      setGroups((prevGroups) => [...prevGroups, response]);
      setOpenNewGroup(false);
      setNewGroupData({ name: '', timeInMinutes: 15 });
    } catch (error) {
      console.error('Error creating group:', error);
    } finally {
      setLoading(false);
    }
  };

  // const handleStartRace = async (groupId: string, userId: string, groupUserId: string, cartId: string) => {
  //   if (!session) return;

  //   try {
  //     await userApi.startRace(userId, groupId);
  //     await fetchSessionDetails();
  //   } catch (error) {
  //     console.error('Error starting race:', error);
  //   }
  // };

  // const handleStopRace = async (groupId: string) => {
  //   if (!session) return;

  //   try {
  //     await sessionApi.stopRace(session.id);
  //     await fetchSessionDetails();
  //   } catch (error) {
  //     console.error('Error stopping race:', error);
  //   }
  // };

  const handleOpenManageUsers = (group: Group) => {
    setSelectedGroup(group);
    const initialSelectedUsers = group.users.map((u: any) => ({
      userId: u.id,
      timeInMinutes: u.time_in_minutes || u.timeInMinutes || 0,
    }));
    setSelectedUsers(initialSelectedUsers);
    manageUsers.onTrue();
  };

  const handleTimeChange = (userId: string, minutes: number) => {
    setSelectedUsers((prev) =>
      prev.map((user) => (user.userId === userId ? { ...user, timeInMinutes: minutes } : user))
    );
  };

  const handleSelectUser = (userId: string, checked: boolean) => {
    if (checked) {
      setSelectedUsers((prev) => [...prev, { userId, timeInMinutes: 0 }]);
    } else {
      setSelectedUsers((prev) => prev.filter((u) => u.userId !== userId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const filteredUsers = getFilteredUsers();
      setSelectedUsers(
        filteredUsers.map((user: any) => ({
          userId: user.id,
          timeInMinutes: 0,
        }))
      );
    } else {
      setSelectedUsers([]);
    }
  };

  const handleManageUsers = async (usersToUpdate: SelectedUser[]) => {
    if (!selectedGroup) return;

    try {
      setLoading(true);

      const response = await groupApi.addUsers(selectedGroup.id, {
        users: usersToUpdate.map((su) => ({
          userId: su.userId,
          timeInMinutes: su.timeInMinutes,
          planId: su.planId,
        })),
      });

      if (response.errors?.length > 0) {
        console.error('Errors adding users:', response.errors);
        return;
      }

      await fetchSessionDetails();
      manageUsers.onFalse();
      setSelectedUsers([]);
    } catch (error) {
      console.error('Error managing users:', error);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredUsers = () => {
    const query = searchQuery.toLowerCase();
    return allUsers.filter(
      (user: any) =>
        user.name.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query) ||
        (user.phone && user.phone.includes(query))
    );
  };

  const handleNewGroupChange = (field: string, value: string | number) => {
    setNewGroupData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAssignCart = async (
    groupId: string,
    userId: string,
    cartId: string,
    groupUserId: string
  ): Promise<void> => {
    try {
      await cartApi.assign(cartId, {
        userId,
        groupUserMappingId: groupUserId,
      });

      await refreshCarts();
      await fetchSessionDetails();
      await refreshGroupUsers();
    } catch (error) {
      console.error('Error assigning cart:', error);
      throw error;
    }
  };

  const handleGroupDeleted = (groupId: string, success: boolean) => {
    if (success) {
      setDeletedGroups((prev) => [...prev]);
    } else {
      setDeletedGroups((prev) => prev.filter((ida) => ida !== groupId));
      fetchSessionDetails();
    }
  };

  if (sessionLoading) return <SessionPageSkeleton />;
  if (!session) return null;

  return (
    <>
      <Helmet>
        <title>{`${session?.session_name ?? session.id.toUpperCase()}`}</title>
      </Helmet>

      <Box sx={{ p: 3 }}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          alignItems="center"
          justifyContent="space-between"
          spacing={2}
          mb={5}
        >
          <Stack direction="column" spacing={2}>
            <Typography variant="h4">
              {session.session_name ? session.session_name.toUpperCase() : session.id.toUpperCase()}
            </Typography>
            <Typography variant="subtitle2" color="text.secondary" marginTop="-2px !important">
              SID #{session.id.toUpperCase()}
            </Typography>
          </Stack>
          <Stack direction="row" spacing={2}>
            <Button
              variant="outlined"
              startIcon={<Iconify icon="eva:arrow-back-fill" />}
              onClick={() => navigate('/sessions')}
            >
              Back
            </Button>
            {/* {session.status !== 'active' && <Button
              variant="contained"
              color="primary"
              startIcon={<Iconify icon="material-symbols:leaderboard" />}
              onClick={() => navigate( `${pathname}/live-leaderboard`)}
            >
              View Leaderboard
            </Button>} */}
            {session.status !== 'active' && (
              <Button
                variant="contained"
                // color="error"
                onClick={() => navigate('lap-data')}
              >
                Lap Data
              </Button>
            )}
            {session.status !== 'active' && (
              <Button
                variant="contained"
                onClick={() => setReviewConfirmation(true)}
              >
                Send Review Link
              </Button>
            )}
            {session.status === 'active' && (
              <Button variant="contained" color="error" onClick={() => setOpenEndSession(true)}>
                End Session
              </Button>
            )}
          </Stack>
        </Stack>

        <Card sx={{ p: 3, mb: 3 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Stack spacing={1} alignItems="flex-start">
                <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
                  Status
                </Typography>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    position: 'relative',
                    mt: '18px !important',
                    ml: '24px !important',
                  }}
                  marginLeft={15}
                >
                  <Badge
                    badgeContent={session.status.toUpperCase()}
                    color={session.status === 'active' ? 'success' : 'warning'}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                    sx={session.status !== 'active' ? { marginLeft: '15px !important' } : {}}
                  />
                </Box>
              </Stack>
            </Grid>

            <Grid item xs={12} md={4}>
              <Stack spacing={1}>
                <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
                  Participants
                </Typography>
                <Typography variant="body1">
                  {session.current_participants}/{session.max_participants ?? '∞'}
                </Typography>
              </Stack>
            </Grid>

            <Grid item xs={12} md={4}>
              <Stack spacing={1}>
                <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
                  Start Time
                </Typography>
                <Typography variant="body1">
                  {new Date(session.start_time).toLocaleString()}
                </Typography>
              </Stack>
            </Grid>
          </Grid>
        </Card>

        {session.status === 'active' && (
          <>
            <Stack direction="row" alignItems="center" justifyContent="space-between" mb={3}>
              <Typography variant="h6">Groups</Typography>
              {session.status === 'active' && (
                <Button
                  variant="contained"
                  startIcon={<Iconify icon="eva:plus-fill" />}
                  onClick={() => setOpenNewGroup(true)}
                  disabled={session.current_participants === session.max_participants}
                >
                  New Group
                </Button>
              )}
            </Stack>

            {groupDataLoad ? (
              <GroupSkeleton />
            ) : groups.length === 0 ? (
              <Card sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="subtitle1" sx={{ color: 'text.secondary', mb: 2 }}>
                  No groups created yet
                </Typography>
                {session.status === 'active' && (
                  <Button
                    variant="outlined"
                    startIcon={<Iconify icon="eva:plus-fill" />}
                    onClick={() => setOpenNewGroup(true)}
                  >
                    Create First Group
                  </Button>
                )}
              </Card>
            ) : (
              <Grid container spacing={3}>
                {groups
                  .filter((group) => !deletedGroups.includes(group.id))
                  .map((group) => (
                    <Grid key={group.id} item xs={12} md={6} lg={4}>
                      <GroupCard
                        group={group}
                        onManageUsers={handleOpenManageUsers}
                        isActive={session.status === 'active'}
                        onAssignCart={handleAssignCart}
                        onGroupDeleted={handleGroupDeleted}
                        sessionId={session.id}
                        onGroupDeleteSuccess={() => setDeletedGroups((prev) => [...prev, group.id])}
                      />
                    </Grid>
                  ))}
              </Grid>
            )}
          </>
        )}
        {session.status !== 'active' && <LiveLeaderboard />}
      </Box>

      <CreateGroupDialog
        open={openNewGroup}
        loading={loading}
        data={newGroupData}
        onClose={() => setOpenNewGroup(false)}
        onChange={handleNewGroupChange}
        onSubmit={handleCreateGroup}
      />

      <ManageUsersDialog
        open={manageUsers.value}
        loading={loading}
        group={selectedGroup}
        allUsers={allUsers}
        selectedUsers={selectedUsers}
        searchQuery={searchQuery}
        onClose={manageUsers.onFalse}
        onSearch={setSearchQuery}
        onSelectUser={handleSelectUser}
        onTimeChange={handleTimeChange}
        onSelectAll={handleSelectAll}
        onSave={handleManageUsers}
        otherGroups={groups}
      />

      <ConfirmDialog
        open={openEndSession}
        title="End Session"
        content="Are you sure you want to end this session? This action cannot be undone."
        confirmText="End Session"
        confirmColor="error"
        loading={loading}
        onClose={() => setOpenEndSession(false)}
        onConfirm={handleEndSession}
      />

      <ConfirmDialog
        open={reviewConfirmation}
        title="Send Review Link"
        content="Are you sure you want to send google review link over whatsap to all the users?"
        confirmText="Send Review Link"
        confirmColor="success"
        loading={reviewLoading}
        onClose={() => setReviewConfirmation(false)}
        onConfirm={handleReviewLink}
      />

      <Toast />
    </>
  );
}
