import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Checkbox,
  Avatar,
  Typography,
  Button,
  Chip,
  Stack,
  InputAdornment,
  IconButton,
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { Scrollbar } from 'src/components/scrollbar';
import { Iconify } from 'src/components/iconify';
import { User, Group } from 'src/types/session';
import { useState, useEffect, useCallback } from 'react';
import { groupApi } from 'src/services/api/group.api';
import { useGUCData } from 'src/contexts/DataContext';

interface SelectedUser {
  userId: string;
  timeInMinutes: number;
}

interface ManageUsersDialogProps {
  open: boolean;
  loading: boolean;
  group: Group | null;
  allUsers: User[];
  selectedUsers: SelectedUser[];
  searchQuery: string;
  onClose: () => void;
  onSearch: (query: string) => void;
  onSelectUser: (userId: string, checked: boolean) => void;
  onTimeChange: (userId: string, minutes: number) => void;
  onSelectAll: (checked: boolean) => void;
  onSave: () => void;
  otherGroups: Group[];
}

const MIN_TIME = 5;
const DEFAULT_TIME = 10;

interface GroupUserMapping {
  id: string;
  group_id: string;
  user_id: string;
  time_in_minutes: number;
  status: string;
  race_status: string;
}

export function ManageUsersDialog({
  open,
  loading,
  group,
  allUsers,
  selectedUsers,
  searchQuery,
  onClose,
  onSearch,
  onSelectUser,
  onTimeChange,
  onSelectAll,
  onSave,
  otherGroups,
}: ManageUsersDialogProps) {
  const [errors, setErrors] = useState<string[]>([]);
  const [groupUsers, setGroupUsers] = useState<GroupUserMapping[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const { isUserInActiveRace, getGroupUsers, activeGroupUsers : fullGroupUsers, refreshGroupUsers } = useGUCData();
  const [pendingTimeChanges, setPendingTimeChanges] = useState<Record<string, number>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const allGroupUsers = getGroupUsers(group?.id || '');

  const fetchGroupUsers = useCallback(async () => {
    if (!group) return;
    
    try {
      setLoadingUsers(true);
      const response = await groupApi.getUsers(group.id);
      setGroupUsers(response.users);
      
      onSelectAll(false); 
      
      const existingUsers = response.users.map(user => ({
        userId: user.user_id,
        timeInMinutes: user.time_in_minutes
      }));
      
      existingUsers.forEach(user => {
        onSelectUser(user.userId, true);
        onTimeChange(user.userId, user.timeInMinutes);
      });
      
      await refreshGroupUsers();
      
    } catch (error) {
      console.error('Error fetching group users:', error);
    } finally {
      setLoadingUsers(false);
    }
  }, [group, onSelectAll, onSelectUser, onTimeChange, refreshGroupUsers]);

  useEffect(() => {
    if (open && group) {
      fetchGroupUsers();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, group]);


  const isUserRaceStarted = (userId: string) => {
    const userMapping = groupUsers.find(gu => gu.user_id === userId);
    return userMapping?.race_status === 'in_progress' || userMapping?.race_status === 'completed';
  };

  const getUserExistingTime = (userId: string) => {
    const userMapping = allGroupUsers.find(gu => gu.user_id === userId);
    return userMapping?.time_in_minutes || 0;
  };

  const handleSelectUser = (userId: string, checked: boolean) => {
    if (checked && isUserInActiveRace(userId)) {
      return;
    }
    if (checked) {
      onSelectUser(userId, checked);
      const existingTime = getUserExistingTime(userId);
      onTimeChange(userId, existingTime || DEFAULT_TIME);
    } else {
      onSelectUser(userId, checked);
    }
  };

  const handleRemoveMember = async (userId: string) => {
    if (!group) return;

    try {
      const confirmed = window.confirm(
        'Are you sure you want to remove this member from the group?',
      );

      if (confirmed) {
        await groupApi.deleteMember(group.id, userId);
        await refreshGroupUsers();
        await fetchGroupUsers();
        onClose();
      }
    } catch (error) {
      console.error('Error removing group member:', error);
      setErrors(['Failed to remove group member']);
    }
  };

  const handleTimeChange = (userId: string, minutes: number) => {
    const existingGroupUser = allGroupUsers.find(gu => gu.user_id === userId);
    if (existingGroupUser) {
      setPendingTimeChanges(prev => ({
        ...prev,
        [userId]: minutes
      }));
    } else {
      onTimeChange(userId, minutes);
    }
  };

  const handleSave = async () => {
    if (!group) return;

    const invalidUsers = selectedUsers.filter(user => !user.timeInMinutes || user.timeInMinutes < MIN_TIME);
    if (invalidUsers.length > 0) {
      setErrors([`Please set valid time (minimum ${MIN_TIME} minutes) for all selected users`]);
      return;
    }

    try {
      setIsSubmitting(true);
      const usersToUpdate = [
        ...selectedUsers,
        ...Object.entries(pendingTimeChanges).map(([userId, minutes]) => ({
          userId,
          timeInMinutes: minutes
        }))
      ];

      const response = await groupApi.addUsers(group.id, {
        users: usersToUpdate
      });

      if (response.errors?.length > 0) {
        setErrors(response.errors);
        return;
      }

      setPendingTimeChanges({});
      await refreshGroupUsers();
      await fetchGroupUsers();
      onSave();
      onClose();
    } catch (error) {
      console.error('Error saving changes:', error);
      setErrors(['Failed to save changes']);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getFilteredUsers = () => {
    const query = searchQuery.toLowerCase();
    const groupUserIds = allGroupUsers.map(gu => gu.user_id);
    
    const groupFilteredUsers = allUsers
      .filter(user => groupUserIds.includes(user.id))
      .filter(user => 
        user.name.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query) ||
        (user.phone && user.phone.includes(query))
      );

    const otherFilteredUsers = allUsers
      .filter(user => !groupUserIds.includes(user.id))
      .filter(user => 
        user.name.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query) ||
        (user.phone && user.phone.includes(query))
      );

    return [...groupFilteredUsers, ...otherFilteredUsers];
  };

  const filteredUsers = getFilteredUsers();
  const hasInvalidTimes = selectedUsers.some(user => !user.timeInMinutes || user.timeInMinutes < MIN_TIME);

  return (
    <Dialog fullWidth maxWidth="md" open={open} onClose={onClose}>
      <DialogTitle>Manage Group Users</DialogTitle>
      
      <DialogContent sx={{ pb: 0, minHeight: 400 }}>
        <TextField
          fullWidth
          placeholder="Search users..."
          value={searchQuery}
          onChange={(e) => onSearch(e.target.value)}
          InputProps={{
            startAdornment: <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled', mr: 1 }} />,
          }}
          sx={{ mb: 2 }}
        />

        <Scrollbar>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox">
                  <Checkbox
                    checked={selectedUsers.length === filteredUsers.length}
                    indeterminate={selectedUsers.length > 0 && selectedUsers.length < filteredUsers.length}
                    onChange={(e) => onSelectAll(e.target.checked)}
                  />
                </TableCell>
                <TableCell>Racer</TableCell>
                <TableCell>Contact</TableCell>
                <TableCell align="center">Time (mins)</TableCell>
                <TableCell align="center">Status</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {loadingUsers ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    Loading users...
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((user) => {
                  const selectedUser = allGroupUsers.find(su => su.user_id === user.id) ?  {
                    timeInMinutes: allGroupUsers.find(su => su.user_id === user.id)?.time_in_minutes || 0,
                    userId: user.id
                  } : selectedUsers.find(su => su.userId === user.id);
                  const isSelected = !!selectedUser;
                  const isAssigned = fullGroupUsers.some(g => 
                    g.group_id !== group?.id && g.user_id === user.id
                  );
                  const hasRaceStarted = group && isUserRaceStarted(user.id);
                  const existingTime = group ? getUserExistingTime(user.id) : 0;
                  const isExistingGroupUser = allGroupUsers.some(gu => gu.user_id === user.id);

                  return (
                    <TableRow 
                      key={user.id} 
                      hover
                      sx={isExistingGroupUser ? { bgcolor: 'action.selected' } : undefined}
                    >
                      <TableCell padding="checkbox">
                        {isExistingGroupUser ? (
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleRemoveMember(user.id)}
                            disabled={hasRaceStarted || false}
                            sx={{ marginLeft: 1 }}
                          >
                            <Iconify icon="eva:trash-2-outline" />
                          </IconButton>
                        ) : (
                          <Checkbox
                            checked={isSelected || hasRaceStarted || false}
                            disabled={isAssigned || hasRaceStarted || false}
                            onChange={(e) => handleSelectUser(user.id, e.target.checked)}
                          />
                        )}
                      </TableCell>

                      <TableCell sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar sx={{ mr: 2 }}>{user.name[0]}</Avatar>
                        <Typography variant="subtitle2">{user.name}</Typography>
                      </TableCell>

                      <TableCell>
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                          {user.email}
                        </Typography>
                        {user.phone && (
                          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                            {user.phone}
                          </Typography>
                        )}
                      </TableCell>

                      <TableCell align="center">
                        {(isSelected || isExistingGroupUser) && (
                          <TextField
                            type="number"
                            size="small"
                            value={
                              hasRaceStarted ? existingTime : 
                              pendingTimeChanges[user.id] !== undefined ? pendingTimeChanges[user.id] :
                              isExistingGroupUser ? getUserExistingTime(user.id) :
                              selectedUser?.timeInMinutes || ''
                            }
                            onChange={(e) => handleTimeChange(user.id, Number(e.target.value))}
                            InputProps={{
                              endAdornment: <InputAdornment position="end">min</InputAdornment>,
                              inputProps: { min: MIN_TIME },
                              readOnly: hasRaceStarted || false
                            }}
                            sx={{ 
                              width: 120,
                              '& .MuiInputBase-input.Mui-disabled': {
                                WebkitTextFillColor: hasRaceStarted ? 'text.primary' : 'inherit',
                              }
                            }}
                            disabled={hasRaceStarted || false}
                            error={!hasRaceStarted && (
                              isExistingGroupUser ? 
                              (pendingTimeChanges[user.id] || getUserExistingTime(user.id)) < MIN_TIME :
                              (!selectedUser?.timeInMinutes || selectedUser?.timeInMinutes < MIN_TIME)
                            )}
                          />
                        )}
                      </TableCell>

                      <TableCell align="center">
                        <Chip
                          size="small"
                          label={
                            hasRaceStarted ? 'Race Started' :
                            isExistingGroupUser ? 'Group Member' :
                            isAssigned ? 'Assigned' : 
                            isSelected ? 'Selected' : 
                            'Available'
                          }
                          color={
                            hasRaceStarted ? 'error' :
                            isExistingGroupUser ? 'success' :
                            isAssigned ? 'warning' : 
                            isSelected ? 'primary' : 
                            'default'
                          }
                        />
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </Scrollbar>
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        {errors.length > 0 && (
          <Stack sx={{ flexGrow: 1 }}>
            {errors.map((error, index) => (
              <Typography key={index} variant="caption" color="error">
                {error}
              </Typography>
            ))}
          </Stack>
        )}
        <Button 
          variant="outlined" 
          onClick={onClose}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <LoadingButton 
          variant="contained" 
          loading={isSubmitting} 
          onClick={handleSave}
          disabled={hasInvalidTimes || isSubmitting}
        >
          Save Changes
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
} 