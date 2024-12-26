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
  MenuItem,
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { Scrollbar } from 'src/components/scrollbar';
import { Iconify } from 'src/components/iconify';
import { User, Group } from 'src/types/session';
import { useState, useEffect, useCallback } from 'react';
import { groupApi } from 'src/services/api/group.api';
import { useGUCData } from 'src/contexts/DataContext';
import { Plan } from 'src/types/billing';
import { billingApi } from 'src/services/api/billing.api';

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
  onTimeChange: (userId: string, minutes: number, planId?: string) => void;
  onSelectAll: (checked: boolean) => void;
  onSave: (users: any[]) => void;
  otherGroups: Group[];
}

const MIN_TIME = 5;
const MIN_TIME_ALLOWED = 5;
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
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(false);
  const [planError, setPlanError] = useState<string | null>(null);
  const [selectedPlans, setSelectedPlans] = useState<Record<string, string>>({});

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
        timeInMinutes: user.time_in_minutes,
        planId: user.id
      }));
      
      existingUsers.forEach(user => {
        onSelectUser(user.userId, true);
      });
      
      await refreshGroupUsers();
      
    } catch (error) {
      console.error('Error fetching group users:', error);
    } finally {
      setLoadingUsers(false);
    }
  }, [group, onSelectAll, onSelectUser, refreshGroupUsers]);

  useEffect(() => {
    if (open && group) {
      fetchGroupUsers();
    }
    if (open && group && allGroupUsers) {
      const initialTimes: Record<string, number> = {};
      allGroupUsers.forEach(gu => {
        if (gu.time_in_minutes) {
          initialTimes[gu.user_id] = gu.time_in_minutes;
        }
      });
      setPendingTimeChanges(initialTimes);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, group]);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        setLoadingPlans(true);
        setPlanError(null);
        const response = await billingApi.getPlans() as any;
        const availablePlans = response?.data?.filter((plan: any) => plan.is_visible);
        setPlans(
          availablePlans?.map((plan: any) => ({
            ...plan,
            defaultTime: plan.default_time,
            isVisible: plan.is_visible,
          }))
        );
        
        if (availablePlans.length > 0) {
          selectedUsers.forEach(user => {
            if (!selectedPlans[user.userId]) {
              handlePlanChange(user.userId, availablePlans[0].id);
            }
          });
        }
      } catch (error) {
        console.error('Error fetching plans:', error);
        setPlanError('Failed to load plans');
      } finally {
        setLoadingPlans(false);
      }
    };

    if (open && !plans.length) {
      fetchPlans();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, selectedUsers, plans]);

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
      if (plans.length > 0) {
        const defaultPlan = plans[0];
        handlePlanChange(userId, defaultPlan.id);
      }
    } else {
      onSelectUser(userId, checked);
      setSelectedPlans(prev => {
        const next = { ...prev };
        delete next[userId];
        return next;
      });
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

    const usersWithoutPlans = selectedUsers.filter(user => !selectedPlans[user.userId]);
    if (usersWithoutPlans.length > 0) {
      setErrors(['Please select a plan for all users']);
      return;
    }

    const invalidUsers = selectedUsers.filter(user => {
      const existingTime = allGroupUsers.find(gu => gu.user_id === user.userId)?.time_in_minutes;
      const pendingTime = pendingTimeChanges[user.userId];
      const currentTime = pendingTime ?? existingTime ?? user.timeInMinutes;
      return !currentTime || currentTime < MIN_TIME_ALLOWED;
    });
    
    if (invalidUsers.length > 0) {
      setErrors([`Please set valid time (minimum ${MIN_TIME_ALLOWED} minutes) for all selected users`]);
      return;
    }

    try {
      setIsSubmitting(true);
      
      const userUpdatesMap = new Map();
      
      selectedUsers.forEach(user => {
        const existingTime = allGroupUsers.find(gu => gu.user_id === user.userId)?.time_in_minutes;
        userUpdatesMap.set(user.userId, {
          userId: user.userId,
          timeInMinutes: pendingTimeChanges[user.userId] ?? existingTime ?? user.timeInMinutes,
          planId: selectedPlans[user.userId]
        });
      });

      const usersToUpdate = Array.from(userUpdatesMap.values());

      onSave(usersToUpdate);
      
      setPendingTimeChanges({});
      await refreshGroupUsers();
      await fetchGroupUsers();
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
  const getInvalidTimeUsers = () => [
      ...selectedUsers.filter(user => {
        const time = pendingTimeChanges[user.userId] || user.timeInMinutes;
        return !time || time < MIN_TIME_ALLOWED;
      }),
      ...Object.entries(pendingTimeChanges)
        .filter(([userId]) => !selectedUsers.find(u => u.userId === userId))
        .filter(([_, minutes]) => !minutes || minutes < MIN_TIME_ALLOWED)
    ];


  const getMissingPlanUsers = () => selectedUsers.filter(user => !selectedPlans[user.userId]);
  

  const invalidTimeUsers = getInvalidTimeUsers();
  const missingPlanUsers = getMissingPlanUsers();
  const hasErrors = invalidTimeUsers.length > 0 || missingPlanUsers.length > 0;

  const handlePlanChange = (userId: string, planId: string) => {
    setSelectedPlans(prev => ({ ...prev, [userId]: planId }));
    const plan = plans.find(p => p.id === planId);
    if (plan) {
      const minutes = plan.defaultTime;
      handleTimeChange(userId, minutes);
      onTimeChange(userId, minutes);
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const filteredUser = getFilteredUsers();
      filteredUser.forEach(user => {
        if (!isUserInActiveRace(user.id)) {
          handleSelectUser(user.id, true);
        }
      });
    } else {
      onSelectAll(false);
      setSelectedPlans({});
    }
  };

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
                  const selectedUser = allGroupUsers.find(su => su.user_id === user.id) ? {
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
                          <Stack direction="row" spacing={1} justifyContent="center">
                            {loadingPlans ? (
                              <TextField
                                disabled
                                size="small"
                                value="Loading plans..."
                                sx={{ width: '50%' }}
                              />
                            ) : planError ? (
                              <TextField
                                error
                                disabled
                                size="small"
                                value={planError}
                                sx={{ width: '50%' }}
                              />
                            ) : (
                              <TextField
                                select
                                size="small"
                                value={selectedPlans[user.id] || ''}
                                onChange={(e) => handlePlanChange(user.id, e.target.value)}
                                disabled={hasRaceStarted || false}
                                sx={{ width: '50%', maxWidth: '180px' }}
                                error={!selectedPlans[user.id] && isSelected}
                                helperText={!selectedPlans[user.id] && isSelected ? 'Plan is required' : ''}
                              >
                                {plans.map((plan) => (
                                  <MenuItem key={plan.id} value={plan.id}>
                                    {plan.name} ({plan.defaultTime} mins)
                                  </MenuItem>
                                ))}
                              </TextField>
                            )}
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
                              disabled={hasRaceStarted || false}
                              sx={{ width: '40%', maxWidth: '120px' }}
                              InputProps={{
                                endAdornment: <InputAdornment position="end">min</InputAdornment>,
                                inputProps: { min: 0 }
                              }}
                              error={!hasRaceStarted && (
                                isExistingGroupUser ? 
                                (pendingTimeChanges[user.id] || getUserExistingTime(user.id)) < MIN_TIME_ALLOWED :
                                (!selectedUser?.timeInMinutes || selectedUser?.timeInMinutes < MIN_TIME_ALLOWED)
                              )}
                            />
                          </Stack>
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
        {!loadingUsers && hasErrors && !errors.length && (
          <Stack sx={{ flexGrow: 1 }}>
            {invalidTimeUsers.length > 0 && (
              <Typography variant="caption" color="error">
                {`Please set valid time (minimum ${MIN_TIME_ALLOWED} minutes) for all users`}
              </Typography>
            )}
            {missingPlanUsers.length > 0 && (
              <Typography variant="caption" color="error">
                Please select a plan for all users
              </Typography>
            )}
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
          disabled={isSubmitting || hasErrors || !group || loadingUsers}
        >
          Save Changes
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
} 