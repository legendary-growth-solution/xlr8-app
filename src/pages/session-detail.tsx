import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  Grid,
  Stack,
  Button,
  Dialog,
  TextField,
  Typography,
  DialogTitle,
  DialogContent,
  DialogActions,
  Badge,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Checkbox,
  DialogContentText,
  Avatar,
  Chip,
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { Helmet } from 'react-helmet-async';
import { Iconify } from 'src/components/iconify';
import { Session, Group, User } from 'src/types/session';
import { MOCK_SESSIONS, MOCK_GROUPS, MOCK_USERS } from 'src/services/mock/mock-data';
import { Scrollbar } from 'src/components/scrollbar';
import { useBoolean } from 'src/hooks/use-boolean';
import { GroupCard } from 'src/components/session/group-card';
import { ManageUsersDialog } from 'src/components/session/manage-users-dialog';
import { ConfirmDialog } from 'src/components/dialog/confirm-dialog';
import { CreateGroupDialog } from 'src/components/session/create-group-dialog';

interface SelectedUser {
  userId: string;
  timeInMinutes: number;
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
  const manageUsers = useBoolean();
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const mockSession = MOCK_SESSIONS.find((s) => s.id === id);
    const mockGroups = MOCK_GROUPS[id] || [];
    setSession(mockSession || null);
    setGroups(mockGroups);
  }, [id]);

  const getAvailableUsers = () => {
    const assignedUserIds = groups.flatMap(group => group.users.map(user => user.id));
    return MOCK_USERS.filter(user => !assignedUserIds.includes(user.id));
  };

  const handleEndSession = async () => {
    try {
      setLoading(true);
      setTimeout(() => {
        navigate('/sessions');
      }, 1000);
    } catch (error) {
      console.error('Error ending session:', error);
    } finally {
      setLoading(false);
      setOpenEndSession(false);
    }
  };

  const handleOpenUserDialog = (groupId: string) => {
    setSelectedGroupId(groupId);
    setSelectedUsers([]);
    setOpenUserDialog(true);
  };

  const handleAddUsers = async () => {
    if (!selectedGroupId) return;
    
    setLoading(true);
    setTimeout(() => {
      const selectedGroupFinal = groups.find(g => g.id === selectedGroupId);
      if (selectedGroupFinal) {
        const newUsers = selectedUsers.map(su => ({
          ...MOCK_USERS.find(u => u.id === su.userId)!,
          timeInMinutes: su.timeInMinutes,
        }));
        const updatedGroups = groups.map(group => 
          group.id === selectedGroupId 
            ? { ...group, users: [...group.users, ...newUsers] }
            : group
        );
        setGroups(updatedGroups);
      }
      setOpenUserDialog(false);
      setLoading(false);
      setSelectedUsers([]);
    }, 1000);
  };

  const handleCreateGroup = async () => {
    setLoading(true);
    setTimeout(() => {
      const newGroup: Group = {
        id: `group-${groups.length + 1}`,
        name: newGroupData.name,
        timeInMinutes: newGroupData.timeInMinutes,
        users: [],
        CartAssignments: [],
        startTime: new Date(),
      };
      setGroups([...groups, newGroup]);
      setOpenNewGroup(false);
      setLoading(false);
      setNewGroupData({ name: '', timeInMinutes: 15 });
    }, 1000);
  };

  const handleOpenManageUsers = (group: Group) => {
    setSelectedGroup(group);
    setSelectedUsers(
      group.users.map(u => ({
        userId: u.id,
        timeInMinutes: u.timeInMinutes || 0,
      }))
    );
    manageUsers.onTrue();
  };

  const handleTimeChange = (userId: string, minutes: number) => {
    setSelectedUsers(prev => 
      prev.map(user => 
        user.userId === userId 
          ? { ...user, timeInMinutes: minutes }
          : user
      )
    );
  };

  const handleSelectUser = (userId: string, checked: boolean) => {
    if (checked) {
      setSelectedUsers(prev => [...prev, { userId, timeInMinutes: 0 }]);
    } else {
      setSelectedUsers(prev => prev.filter(u => u.userId !== userId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const filteredUsers = getFilteredUsers();
      setSelectedUsers(
        filteredUsers.map(user => ({
          userId: user.id,
          timeInMinutes: 0,
        }))
      );
    } else {
      setSelectedUsers([]);
    }
  };

  const handleManageUsers = async () => {
    if (!selectedGroup) return;
    
    setLoading(true);
    setTimeout(() => {
      const selectedUserObjects = selectedUsers.map(su => ({
        ...MOCK_USERS.find(u => u.id === su.userId)!,
        timeInMinutes: su.timeInMinutes,
      }));

      const updatedGroups = groups.map(group => 
        group.id === selectedGroup.id 
          ? { ...group, users: selectedUserObjects }
          : group
      );
      setGroups(updatedGroups);
      manageUsers.onFalse();
      setLoading(false);
    }, 1000);
  };

  const getFilteredUsers = () => {
    const query = searchQuery.toLowerCase();
    return MOCK_USERS.filter(user => 
      user.name.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query) ||
      (user.phone && user.phone.includes(query))
    );
  };

  const handleNewGroupChange = (field: string, value: string | number) => {
    setNewGroupData(prev => ({ ...prev, [field]: value }));
  };

  if (!session) return null;

  return (
    <>
      <Helmet>
        <title>{`Session: ${session.name ?? session.id.toUpperCase()}`}</title>
      </Helmet>

      <Box sx={{ p: 3 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
          <Typography variant="h4">{session.name ? session.name.toUpperCase() : session.id.toUpperCase()}</Typography>

          <Stack direction="row" spacing={2}>
            <Button
              variant="outlined"
              startIcon={<Iconify icon="eva:arrow-back-fill" />}
              onClick={() => navigate('/sessions')}
            >
              Back
            </Button>
            {session.status === 'active' && (
              <Button
                variant="contained"
                color="error"
                onClick={() => setOpenEndSession(true)}
              >
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
                <Box sx={{ display: 'flex', alignItems: 'center', position: 'relative', mt: "18px !important", ml: "24px !important" }}>
                  <Badge
                    badgeContent={session.status.toUpperCase()}
                    color={session.status === 'active' ? 'success' : 'warning'}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
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
                  {session.currentParticipants}/{session.maxParticipants}
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

        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={3}>
          <Typography variant="h6">Groups</Typography>
          {session.status === 'active' && (
            <Button
              variant="contained"
              startIcon={<Iconify icon="eva:plus-fill" />}
              onClick={() => setOpenNewGroup(true)}
            >
              New Group
            </Button>
          )}
        </Stack>

        {groups.length === 0 ? (
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
            {groups.map((group) => (
              <Grid key={group.id} item xs={12} md={6} lg={4}>
                <GroupCard
                  group={group}
                  onManageUsers={handleOpenManageUsers}
                  isActive={session.status === 'active'}
                />
              </Grid>
            ))}
          </Grid>
        )}
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
        allUsers={MOCK_USERS}
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
    </>
  );
} 