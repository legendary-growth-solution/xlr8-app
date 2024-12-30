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
  Box,
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
import { debounce } from 'src/utils/debounce';
import { UserTableSkeleton } from 'src/components/skeleton';

interface SelectedUser {
  userId: string;
  timeInMinutes: number;
}

interface ManageUsersDialogProps {
  open: boolean;
  loading: boolean;
  group: any;
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
const MIN_TIME_ALLOWED = 1;
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
  const {
    isUserInActiveRace,
    getGroupUsers,
    activeGroupUsers: fullGroupUsers,
    refreshGroupUsers,
    fetchUsers,
    totalUsers,
  } = useGUCData();
  const [pendingTimeChanges, setPendingTimeChanges] = useState<Record<string, number>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(false);
  const [planError, setPlanError] = useState<string | null>(null);
  const [selectedPlans, setSelectedPlans] = useState<Record<string, string>>({});
  const [deletingUsers, setDeletingUsers] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const pageSize = 10;
  const [loadedUsers, setLoadedUsers] = useState<User[]>([]);
  const [loadingMore, setLoadingMore] = useState(false);

  const allGroupUsers = getGroupUsers(group?.id || '');

  const fetchGroupUsers = useCallback(async () => {
    if (!group) return;

    try {
      setLoadingUsers(true);
      const response = await groupApi.getUsers(group.id);
      const users = response && response.users && response.users.length > 0 ? response.users : [];

      setGroupUsers(users);

      onSelectAll(false);

      const existingUsers = users.map((user) => ({
        userId: user.user_id,
        timeInMinutes: user.time_in_minutes,
        planId: user.id,
      }));

      existingUsers.forEach((user) => {
        onSelectUser(user.userId, true);
      });

    } catch (error) {
      console.error('Error fetching group users:', error);
    } finally {
      setLoadingUsers(false);
    }
  }, [group, onSelectAll, onSelectUser]);

  useEffect(() => {
    if (open && group) {
      fetchGroupUsers();
    }
    if (open && group && allGroupUsers) {
      const initialTimes: Record<string, number> = {};
      allGroupUsers.forEach((gu) => {
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
        const response = (await billingApi.getPlans()) as any;
        const availablePlans = response?.data?.filter((plan: any) => plan.is_visible);
        setPlans(
          availablePlans?.map((plan: any) => ({
            ...plan,
            defaultTime: plan.default_time,
            isVisible: plan.is_visible,
          }))
        );

        if (availablePlans.length > 0) {
          selectedUsers.forEach((user) => {
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

    if (open) {
      fetchPlans();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const isUserRaceStarted = (userId: string) => {
    const userMapping = groupUsers.find((gu) => gu.user_id === userId);
    return userMapping?.race_status === 'in_progress' || userMapping?.race_status === 'completed';
  };

  const getUserExistingTime = (userId: string) => {
    const userMapping = allGroupUsers.find((gu) => gu.user_id === userId);
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
      setSelectedPlans((prev) => {
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
        'Are you sure you want to remove this member from the group?'
      );

      if (confirmed) {
        setDeletingUsers(prev => new Set(prev).add(userId));
        
        const updatedUsers = groupUsers.filter(user => user.user_id !== userId).map(user => ({
          ...user,
          user: allUsers.find(u => u.id === user.user_id) || {
            id: user.user_id,
            name: 'Unknown',
            email: '',
          }
        }));
        
        group.onUpdate?.(updatedUsers, true);
        setGroupUsers(updatedUsers);

        try {
          await groupApi.deleteMember(group.id, userId);
          await refreshGroupUsers();
          group.onUpdate?.(updatedUsers, false);
        } catch (error) {
          console.error('Error removing group member:', error);
          const revertedUsers = [...groupUsers];
          group.onUpdate?.(revertedUsers, false);
          setGroupUsers(revertedUsers);
        } finally {
          setDeletingUsers(prev => {
            const next = new Set(prev);
            next.delete(userId);
            return next;
          });
        }
      }
    } catch (error) {
      console.error('Error removing group member:', error);
      setErrors(['Failed to remove group member']);
      setDeletingUsers(prev => {
        const next = new Set(prev);
        next.delete(userId);
        return next;
      });
    }
  };

  const handleTimeChange = (userId: string, minutes: number) => {
    const existingGroupUser = allGroupUsers.find((gu) => gu.user_id === userId);
    if (existingGroupUser) {
      setPendingTimeChanges((prev) => ({
        ...prev,
        [userId]: minutes,
      }));
    } else {
      onTimeChange(userId, minutes);
    }
  };

  const handleSave = async () => {
    if (!group) return;

    const usersWithoutPlans = selectedUsers.filter((user) => !selectedPlans[user.userId]);
    if (usersWithoutPlans.length > 0) {
      setErrors(['Please select a plan for all users']);
      return;
    }

    const invalidUsers = selectedUsers.filter((user) => {
      const existingTime = allGroupUsers.find((gu) => gu.user_id === user.userId)?.time_in_minutes;
      const pendingTime = pendingTimeChanges[user.userId];
      const currentTime = pendingTime ?? existingTime ?? user.timeInMinutes;
      return !currentTime || currentTime < MIN_TIME_ALLOWED;
    });

    if (invalidUsers.length > 0) {
      setErrors([
        `Please set valid time (minimum ${MIN_TIME_ALLOWED} minutes) for all selected users`,
      ]);
      return;
    }

    try {
      const userUpdatesMap = new Map();

      selectedUsers.forEach((user) => {
        const existingTime = allGroupUsers.find(
          (gu) => gu.user_id === user.userId
        )?.time_in_minutes;
        userUpdatesMap.set(user.userId, {
          userId: user.userId,
          timeInMinutes: pendingTimeChanges[user.userId] ?? existingTime ?? user.timeInMinutes,
          planId: selectedPlans[user.userId],
        });
      });

      const usersToUpdate = Array.from(userUpdatesMap.values());

      const optimisticUsers = usersToUpdate.map(user => {
        const fullUser = allUsers.find(u => u.id === user.userId) || {
          id: user.userId,
          name: 'Unknown',
          email: '',
        };
        
        return {
          id: Math.random().toString(),
          user_id: user.userId,
          group_id: group.id,
          time_in_minutes: user.timeInMinutes,
          status: 'active',
          race_status: 'pending',
          user: {
            id: fullUser.id,
            name: fullUser.name,
            email: fullUser.email,
            phone: (fullUser as User).phone || '',
          },
        };
      });

      group.onUpdate?.(optimisticUsers, true);
      onClose();

      try {
        setIsSubmitting(true);
        await onSave(usersToUpdate);
        await refreshGroupUsers();
        group.onUpdate?.(optimisticUsers, false);
      } catch (error) {
        console.error('Error saving changes:', error);
        group.onUpdate?.(groupUsers, false);
        setErrors(['Failed to save changes']);
      } finally {
        setIsSubmitting(false);
      }

    } catch (error) {
      console.error('Error saving changes:', error);
      setErrors(['Failed to save changes']);
    }
  };

  const getInvalidTimeUsers = () => [
    ...selectedUsers.filter((user) => {
      const time = pendingTimeChanges[user.userId] || user.timeInMinutes;
      return !time || time < MIN_TIME_ALLOWED;
    }),
    ...Object.entries(pendingTimeChanges)
      .filter(([userId]) => !selectedUsers.find((u) => u.userId === userId))
      .filter(([_, minutes]) => !minutes || minutes < MIN_TIME_ALLOWED),
  ];

  const getMissingPlanUsers = () => selectedUsers.filter((user) => !selectedPlans[user.userId]);

  const invalidTimeUsers = getInvalidTimeUsers();
  const missingPlanUsers = getMissingPlanUsers();
  const hasErrors = invalidTimeUsers.length > 0 || missingPlanUsers.length > 0;

  const handlePlanChange = (userId: string, planId: string) => {
    setSelectedPlans((prev) => ({ ...prev, [userId]: planId }));
    const plan = plans.find((p) => p.id === planId);
    if (plan) {
      const minutes = plan.defaultTime;
      handleTimeChange(userId, minutes);
      onTimeChange(userId, minutes);
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const filteredUser = loadedUsers;
      filteredUser.forEach((user) => {
        if (!isUserInActiveRace(user.id)) {
          handleSelectUser(user.id, true);
        }
      });
    } else {
      onSelectAll(false);
      setSelectedPlans({});
    }
  };

  const debouncedFetchUsers = debounce(async (query: string) => {
    setLoadingMore(true);
    try {
      const response: any = await fetchUsers({
        page: 1,
        pageSize,
        search: query
      });

      if (response && response.users) {
        setLoadedUsers(sortUsers(response.users));
        setHasMore(response.users.length >= pageSize);
      } else {
        setLoadedUsers([]);
        setHasMore(false);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      setLoadedUsers([]);
    } finally {
      setLoadingMore(false);
    }
  }, 800);

  useEffect(() => {
    if (searchQuery.length >= 2 || searchQuery.length === 0) {
      debouncedFetchUsers(searchQuery);
    }

    return () => {
      debouncedFetchUsers.cancel();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);

  const handleSearch = (value: string) => {
    onSearch(value);
  };

  const getUserStatusPriority = (user: User, isSelected: boolean, isExistingGroupUser: boolean, isAssigned: boolean, hasRaceStarted: boolean) => {
    if (hasRaceStarted) return 1;
    if (isExistingGroupUser) return 2;
    if (isSelected) return 3;
    if (isAssigned) return 4;
    return 5; 
  };

  const sortUsers = (users: User[]) => [...users].sort((a, b) => {
      const aSelected = !!selectedUsers.find(su => su.userId === a.id);
      const bSelected = !!selectedUsers.find(su => su.userId === b.id);
      
      const aExisting = allGroupUsers.some(gu => gu.user_id === a.id);
      const bExisting = allGroupUsers.some(gu => gu.user_id === b.id);
      
      const aAssigned = fullGroupUsers.some(g => g.group_id !== group?.id && g.user_id === a.id);
      const bAssigned = fullGroupUsers.some(g => g.group_id !== group?.id && g.user_id === b.id);
      
      const aRaceStarted = group && isUserRaceStarted(a.id);
      const bRaceStarted = group && isUserRaceStarted(b.id);

      const aPriority = getUserStatusPriority(a, aSelected, aExisting, aAssigned, aRaceStarted);
      const bPriority = getUserStatusPriority(b, bSelected, bExisting, bAssigned, bRaceStarted);

      return aPriority - bPriority;
    });

  const handleLoadMore = async () => {
    try {
      setLoadingMore(true);
      const nextPage = currentPage + 1;
      const prevUsers = [...loadedUsers];
      
      const response: any = await fetchUsers({
        page: nextPage,
        pageSize,
        search: searchQuery
      });
      
      const newUsers = response.users.filter(
        (newUser: any) => !prevUsers.some((existingUser: any) => existingUser.id === newUser.id)
      );
      
      if (newUsers.length < pageSize) {
        setHasMore(false);
      }
      
      setLoadedUsers(prevU => sortUsers([...prevU, ...newUsers]));
      setCurrentPage(nextPage);
    } catch (error) {
      console.error('Error loading more users:', error);
    } finally {
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    if (open) {
      if (loadedUsers.length === 0) {
        setLoadingMore(true);
        fetchUsers({
          page: 1,
          pageSize,
          search: ''
        }).then((response: any) => {
          if (response && response.users) {
            setLoadedUsers(sortUsers(response.users));
            setHasMore(response.users.length >= pageSize);
          }
          setLoadingMore(false);
        });
      }
      setCurrentPage(1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  return (
    <Dialog fullWidth maxWidth="md" open={open} onClose={onClose}>
      <DialogTitle>Manage Group Users</DialogTitle>

      <DialogContent sx={{ pb: 0, minHeight: 400 }}>
        <TextField
          fullWidth
          placeholder="Search users..."
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          InputProps={{
            startAdornment: (
              <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled', mr: 1 }} />
            ),
          }}
          sx={{ mb: 2 }}
        />

        <Scrollbar>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox">
                  <Checkbox
                    checked={selectedUsers.length === loadedUsers.length}
                    indeterminate={
                      selectedUsers.length > 0 && selectedUsers.length < loadedUsers.length
                    }
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
                <UserTableSkeleton rows={5} />
              ) : (
                <>
                  {loadedUsers.map((user) => {
                    const selectedUser = allGroupUsers.find((su) => su.user_id === user.id)
                      ? {
                          timeInMinutes:
                            allGroupUsers.find((su) => su.user_id === user.id)?.time_in_minutes || 0,
                          userId: user.id,
                        }
                      : selectedUsers.find((su) => su.userId === user.id);
                    const isSelected = !!selectedUser;
                    const isAssigned = fullGroupUsers.some(
                      (g) => g.group_id !== group?.id && g.user_id === user.id
                    );
                    const hasRaceStarted = group && isUserRaceStarted(user.id);
                    const existingTime = group ? getUserExistingTime(user.id) : 0;
                    const isExistingGroupUser = allGroupUsers.some((gu) => gu.user_id === user.id);

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
                              disabled={hasRaceStarted || deletingUsers.has(user.id)}
                              sx={{ marginLeft: 1 }}
                            >
                              {deletingUsers.has(user.id) ? (
                                <LoadingButton
                                  loading
                                  size="small"
                                  sx={{ 
                                    minWidth: 20, 
                                    p: 0,
                                    '& .MuiCircularProgress-root': {
                                      width: '20px !important',
                                      height: '20px !important',
                                      color: 'error.main'
                                    }
                                  }}
                                />
                              ) : (
                                <Iconify icon="eva:trash-2-outline" />
                              )}
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
                                  helperText={
                                    !selectedPlans[user.id] && isSelected ? 'Plan is required' : ''
                                  }
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
                                  hasRaceStarted
                                    ? existingTime
                                    : pendingTimeChanges[user.id] !== undefined
                                      ? pendingTimeChanges[user.id]
                                      : isExistingGroupUser
                                        ? getUserExistingTime(user.id)
                                        : selectedUser?.timeInMinutes || ''
                                }
                                onChange={(e) => handleTimeChange(user.id, Number(e.target.value))}
                                disabled={hasRaceStarted || false}
                                sx={{ width: '40%', maxWidth: '120px' }}
                                InputProps={{
                                  endAdornment: <InputAdornment position="end">min</InputAdornment>,
                                  inputProps: { min: 0 },
                                }}
                                error={
                                  !hasRaceStarted &&
                                  (isExistingGroupUser
                                    ? (pendingTimeChanges[user.id] || getUserExistingTime(user.id)) <
                                      MIN_TIME_ALLOWED
                                    : !selectedUser?.timeInMinutes ||
                                      selectedUser?.timeInMinutes < MIN_TIME_ALLOWED)
                                }
                              />
                            </Stack>
                          )}
                        </TableCell>

                        <TableCell align="center">
                          <Chip
                            size="small"
                            label={
                              hasRaceStarted
                                ? 'Race Started'
                                : isExistingGroupUser
                                  ? 'Group Member'
                                  : isAssigned
                                    ? 'Assigned'
                                    : isSelected
                                      ? 'Selected'
                                      : 'Available'
                            }
                            color={
                              hasRaceStarted
                                ? 'error'
                                : isExistingGroupUser
                                  ? 'success'
                                  : isAssigned
                                    ? 'warning'
                                    : isSelected
                                      ? 'primary'
                                      : 'default'
                            }
                          />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {loadingMore && <UserTableSkeleton rows={3} />}
                  {hasMore && loadedUsers.length < totalUsers && (
                    <TableRow>
                      <TableCell colSpan={5} align="center" sx={{ border: 0 }}>
                        <LoadingButton
                          loading={loadingMore}
                          variant="text"
                          onClick={handleLoadMore}
                          startIcon={!loadingMore && <Iconify icon="eva:plus-fill" />}
                        >
                          {loadingMore ? 'Loading...' : 'Load More'}
                        </LoadingButton>
                      </TableCell>
                    </TableRow>
                  )}
                </>
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
        <Button variant="outlined" onClick={onClose} disabled={isSubmitting}>
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
