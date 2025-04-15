import React, { useState, useEffect, useCallback, ChangeEvent, FormEvent } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Checkbox,
  Select,
  MenuItem,
  IconButton,
  Typography,
  Box,
  Stack,
  InputAdornment,
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import { Group, NewUser, Plan, UpdatingUser, User as SessionUser } from 'src/types/session';
import { userApi } from 'src/services/api/user.api';
import { User } from 'src/types/user';
import { Scrollbar } from 'src/components/scrollbar';
import { UserTableSkeleton } from 'src/components/skeleton';

interface ManageUsersDialogProps {
  open: boolean;
  onClose: VoidFunction;
  group: Group;
  handleAddUsers: (group_id: string, data: NewUser[], onComplete?: () => void) => Promise<void>;
  handleUpdateUser: (group_id: string, user_id: string, data: UpdatingUser) => void;
  handleRemoveUser: (group_id: string, user_id: string) => void;
  plans: Plan[];
  sessionUsers: User[];
}

// Utility: simple debounce hook
function useDebounce(value: string, delay: number) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

async function fetchAllUsers(searchTerm?: string, page: number = 1, pageSize: number = 10): Promise<{users: User[], hasMore: boolean}> {
  try {
    const response = await userApi.list({
      search: searchTerm,
      pageSize,
      page,
    });
    return {
      users: response.users,
      hasMore: response.users.length >= pageSize
    };
  } catch (error) {
    console.error('Error fetching users:', error);
    return { users: [], hasMore: false };
  }
}

export const ManageUsersDialog: React.FC<ManageUsersDialogProps> = ({
  open,
  onClose,
  group,
  handleAddUsers,
  handleUpdateUser,
  handleRemoveUser,
  plans,
  sessionUsers,
}) => {
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const pageSize = 10;

  // For newly selected users
  // Key: user_id -> { plan_id, user_name, user_id }
  const [selectedUsers, setSelectedUsers] = useState<Record<string, NewUser>>({});

  // For plan changes on existing group members (optional immediate or batch)
  // We'll store them for immediate or separate update action
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editingPlanId, setEditingPlanId] = useState<string>('');

  const [originalUserData, setOriginalUserData] = useState<{
    plan_id: string;
    time_in_minutes: number;
  } | null>(null);

  // For remove confirmation
  const [confirmRemoveUserId, setConfirmRemoveUserId] = useState<string | null>(null);

  const [customTime, setCustomTime] = useState<Record<string, number>>({});
  const [hasChanges, setHasChanges] = useState(false);

  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  /**
   * Fetch all users once the dialog opens.
   */
  useEffect(() => {
    if (open) {
      setLoadingUsers(true);
      fetchAllUsers(debouncedSearchTerm, 1, pageSize).then(({ users, hasMore: moreResults }) => {
        setAllUsers(users);
        setHasMore(moreResults);
        setCurrentPage(1);
        setLoadingUsers(false);
      });
    }
  }, [open, debouncedSearchTerm, pageSize]);

  /**
   * Function to load more users when scrolling
   */
  const handleLoadMore = async () => {
    if (loadingMore || !hasMore) return;
    
    setLoadingMore(true);
    const nextPage = currentPage + 1;
    
    try {
      const { users: newUsers, hasMore: moreAvailable } = await fetchAllUsers(debouncedSearchTerm, nextPage, pageSize);
      
      const newUniqueUsers = newUsers.filter(
        newUser => !allUsers.some(existingUser => existingUser.user_id === newUser.user_id)
      );
      
      setAllUsers(prevUsers => [...prevUsers, ...newUniqueUsers]);
      setHasMore(moreAvailable);
      setCurrentPage(nextPage);
    } catch (error) {
      console.error('Error loading more users:', error);
    } finally {
      setLoadingMore(false);
    }
  };

  /**
   * Reset states when dialog closes
   */
  useEffect(() => {
    if (!open) {
      setSearchTerm('');
      setSelectedUsers({});
      setEditingUserId(null);
      setConfirmRemoveUserId(null);
      setCustomTime({});
      setHasChanges(false);
    }
  }, [open]);

  /**
   * Handler for search input change
   */
  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newSearchTerm = e.target.value;
    setSearchTerm(newSearchTerm);
    
    if (newSearchTerm.length >= 2 || newSearchTerm.length === 0) {
      setLoadingUsers(true);
    }
  };

  /**
   * Filter & sort users:
   * 1. Group users come first
   * 2. Then the rest
   * 3. Then filter by searchTerm
   */
  const filteredUsers = React.useMemo(() => {
    const inGroup = new Set(group.users.map((u) => u.user_id));
    const inOtherGroups = new Set(
      sessionUsers.filter((u) => !inGroup.has(u.user_id)).map((u) => u.user_id)
    );

    return [...allUsers].sort((a, b) => {
      if (inGroup.has(a.user_id) !== inGroup.has(b.user_id)) {
        return inGroup.has(a.user_id) ? -1 : 1;
      }
      if (inOtherGroups.has(a.user_id) !== inOtherGroups.has(b.user_id)) {
        return inOtherGroups.has(a.user_id) ? 1 : -1;
      }
      return a.name.localeCompare(b.name);
    });
  }, [allUsers, group.users, sessionUsers]);

  /**
   * Checks if a user is already in the group
   */
  const isUserInGroup = (userId: string): boolean =>
    group.users.some((gu) => gu.user_id === userId);

  /**
   * Get existing plan_id for a user in the group
   */
  const getUserPlanFromGroup = (userId: string): string | undefined => {
    const gu = group.users.find((u) => u.user_id === userId);
    return gu?.plan_id || undefined;
  };

  /**
   * Handler for plan dropdown changes for newly selected users
   */
  const handleSelectPlanForNewUser = (user: User, e: ChangeEvent<{ value: unknown }>) => {
    const plan_id = e.target.value as string;
    const selectedPlan = plans.find((p) => p.plan_id === plan_id);
    const customTimeValue = selectedPlan?.timeInMinutes || 0;

    setSelectedUsers((prev) => ({
      ...prev,
      [user.user_id]: {
        user_id: user.user_id,
        user_name: user.name,
        plan_id,
        time_in_minutes: customTimeValue,
      },
    }));

    setCustomTime((prev) => ({
      ...prev,
      [user.user_id]: customTimeValue,
    }));

    setHasChanges(true);
  };

  const handleCustomTimeChange = (user: User, value: number) => {
    setCustomTime((prev) => ({
      ...prev,
      [user.user_id]: value,
    }));

    if (selectedUsers[user.user_id]) {
      setSelectedUsers((prev) => ({
        ...prev,
        [user.user_id]: {
          ...prev[user.user_id],
          time_in_minutes: value,
        },
      }));
      setHasChanges(true);
    }
  };

  /**
   * Handler for toggling selection of a user (checkbox).
   */
  const handleToggleUserSelection = (user: User) => {
    setSelectedUsers((prev) => {
      // If user is already selected, remove them
      if (prev[user.user_id]) {
        const { [user.user_id]: removed, ...rest } = prev;
        setCustomTime((prevCustomTime) => {
          const { [user.user_id]: removedTime, ...restCustomTime } = prevCustomTime;
          return restCustomTime;
        });
        setHasChanges(Object.keys(rest).length > 0);
        return rest;
      }
      // Otherwise, add with default plan
      const defaultPlan = plans.length ? plans[0] : null;
      const defaultCustomTime = defaultPlan?.timeInMinutes || 0;

      setCustomTime((prevCustomTime) => ({
        ...prevCustomTime,
        [user.user_id]: defaultCustomTime,
      }));

      setHasChanges(true);
      return {
        ...prev,
        [user.user_id]: {
          user_id: user.user_id,
          user_name: user.name,
          plan_id: defaultPlan?.plan_id || '',
          time_in_minutes: defaultCustomTime,
        },
      };
    });
  };

  /**
   * Check if user is selected (for new additions)
   */
  const isSelectedForAddition = (userId: string): boolean => !!selectedUsers[userId];

  /**
   * Handler for Save button (add newly selected users in batch).
   */
  const handleSave = async () => {
    const usersToAdd: NewUser[] = Object.entries(selectedUsers)
      .filter(([_, user]) => user)
      .map(([_, user]) => ({
        user_id: user.user_id,
        user_name: user.user_name,
        plan_id: user.plan_id,
        time_in_minutes: user.time_in_minutes,
      }));

    if (usersToAdd.length === 0) return;

    setIsSaving(true);

    await handleAddUsers(group.group_id, usersToAdd, () => {
      setIsSaving(false);
    });

    setSelectedUsers({});
    setCustomTime({});
    setHasChanges(false);

    onClose();
  };

  /**
   * Handle editing plan for existing user
   */
  const handleEditUser = (user_id: string) => {
    setEditingUserId(user_id);

    // initialize editingPlanId from existing user's plan
    const currentPlan = getUserPlanFromGroup(user_id);
    if (currentPlan) setEditingPlanId(currentPlan);

    const currentUser = group.users.find((u) => u.user_id === user_id);
    if (currentUser) {
      const userPlan = plans.find((p) => p.plan_id === currentUser.plan_id);
      const timeValue =
        currentUser.time_in_minutes || currentUser.time_allotted || userPlan?.timeInMinutes || 0;

      setCustomTime((prev) => ({
        ...prev,
        [user_id]: timeValue,
      }));

      setOriginalUserData({
        plan_id: currentUser.plan_id,
        time_in_minutes: timeValue,
      });
    }

    setHasChanges(false);
  };

  const hasEditingChanges = (): boolean => {
    if (!editingUserId || !originalUserData) return false;

    return (
      editingPlanId !== originalUserData.plan_id ||
      (customTime[editingUserId] || 0) !== originalUserData.time_in_minutes
    );
  };

  /**
   * Confirm the plan update for an existing user
   */
  const handleConfirmUpdateUser = () => {
    if (!editingUserId) return;

    const selectedPlan = plans.find((p) => p.plan_id === editingPlanId);

    const timeToUse = customTime[editingUserId] || selectedPlan?.timeInMinutes || 0;

    const data: UpdatingUser = {
      user_id: editingUserId,
      plan_id: editingPlanId,
      time_in_minutes: timeToUse,
    };

    handleUpdateUser(group.group_id, editingUserId, data);
    setEditingUserId(null);
    setOriginalUserData(null);
  };

  /**
   * Handle removing an existing user from the group
   */
  const handleConfirmRemoveUser = () => {
    if (!confirmRemoveUserId) return;
    handleRemoveUser(group.group_id, confirmRemoveUserId);
    setConfirmRemoveUserId(null);
    setHasChanges(false);
  };

  const isUserInOtherGroup = (userId: string): boolean =>
    sessionUsers.some((u) => u.user_id === userId && !isUserInGroup(userId));

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        Manage Users in &quot;{group.name}&quot;
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent>
        {/* Search bar */}
        <Box display="flex" alignItems="center" mb={2}>
          <TextField
            label="Search users..."
            variant="outlined"
            fullWidth
            value={searchTerm}
            style={{ marginTop: 5 }}
            onChange={handleSearchChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
        </Box>

        <Scrollbar>
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell />
                <TableCell style={{ whiteSpace: 'nowrap' }}>User Name</TableCell>
                <TableCell style={{ whiteSpace: 'nowrap' }}>Email</TableCell>
                <TableCell style={{ whiteSpace: 'nowrap' }}>Phone</TableCell>
                <TableCell style={{ whiteSpace: 'nowrap' }}>Plan</TableCell>
                <TableCell style={{ whiteSpace: 'nowrap' }}>Custom Duration (min)</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loadingUsers ? (
                <UserTableSkeleton rows={5} />
              ) : (
                <>
                  {filteredUsers.map((user) => {
                    const inGroup = isUserInGroup(user.user_id);
                    const selected = isSelectedForAddition(user.user_id);

                    return (
                      <TableRow
                        key={user.user_id}
                        sx={{
                          opacity: isUserInOtherGroup(user.user_id) ? 0.5 : 1,
                          bgcolor: isUserInOtherGroup(user.user_id) ? 'action.hover' : 'inherit',
                        }}
                      >
                        <TableCell>
                          {!inGroup && (
                            <Checkbox
                              checked={selected}
                              onChange={() => handleToggleUserSelection(user)}
                              disabled={isUserInOtherGroup(user.user_id) || user.race_active}
                            />
                          )}
                        </TableCell>
                        <TableCell>{user.name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>{user.phone}</TableCell>
                        <TableCell>
                          {/* If user is already in group, show plan dropdown for editing if editingUserId matches */}
                          {inGroup ? (
                            editingUserId === user.user_id ? (
                              <Select
                                value={editingPlanId}
                                onChange={(e) => {
                                  const newPlanId = e.target.value as string;
                                  setEditingPlanId(newPlanId);

                                  const selectedPlan = plans.find((p) => p.plan_id === newPlanId);
                                  if (selectedPlan) {
                                    setCustomTime((prev) => ({
                                      ...prev,
                                      [user.user_id]: selectedPlan.timeInMinutes,
                                    }));
                                  }
                                }}
                                size="small"
                                sx={{ minWidth: 120 }}
                              >
                                {plans.map((plan) => (
                                  <MenuItem key={plan.plan_id} value={plan.plan_id}>
                                    {plan.title}
                                  </MenuItem>
                                ))}
                              </Select>
                            ) : (
                              // Display read-only plan name
                              <Typography variant="body2">
                                {
                                  plans.find((p) => p.plan_id === getUserPlanFromGroup(user.user_id))
                                    ?.name
                                }
                              </Typography>
                            )
                          ) : (
                            selected && (
                              <Select
                                value={selectedUsers[user.user_id]?.plan_id || ''}
                                onChange={(e: any) => handleSelectPlanForNewUser(user, e)}
                                size="small"
                                sx={{ minWidth: 120 }}
                                disabled={isUserInOtherGroup(user.user_id)}
                              >
                                {plans.map((plan) => (
                                  <MenuItem key={plan.plan_id} value={plan.plan_id}>
                                    {plan.title}
                                  </MenuItem>
                                ))}
                              </Select>
                            )
                          )}
                        </TableCell>
                        <TableCell>
                          <TextField
                            type="number"
                            size="small"
                            value={
                              editingUserId === user.user_id
                                ? customTime[user.user_id] || ''
                                : inGroup
                                  ? group.users.find((u) => u.user_id === user.user_id)
                                      ?.time_in_minutes ||
                                    group.users.find((u) => u.user_id === user.user_id)?.time_allotted ||
                                    plans.find((p) => p.plan_id === getUserPlanFromGroup(user.user_id))
                                      ?.timeInMinutes ||
                                    ''
                                  : customTime[user.user_id] || ''
                            }
                            onChange={(e) => handleCustomTimeChange(user, Number(e.target.value))}
                            disabled={
                              (inGroup && editingUserId !== user.user_id) ||
                              (!inGroup && !selected) ||
                              isUserInOtherGroup(user.user_id)
                            }
                            InputProps={{ inputProps: { min: 1 } }}
                          />
                        </TableCell>
                        <TableCell align="center">
                          {inGroup && (
                            <Stack direction="row" spacing={1}>
                              {editingUserId === user.user_id ? (
                                <>
                                  <Button
                                    variant="outlined"
                                    color="primary"
                                    size="small"
                                    onClick={handleConfirmUpdateUser}
                                    disabled={!hasEditingChanges()}
                                  >
                                    Save
                                  </Button>
                                  <Button
                                    variant="outlined"
                                    color="inherit"
                                    size="small"
                                    onClick={() => {
                                      setEditingUserId(null);
                                      setOriginalUserData(null);
                                    }}
                                  >
                                    Cancel
                                  </Button>
                                </>
                              ) : (
                                <>
                                  {(() => {
                                    const groupUser = group.users.find((u) => u.user_id === user.user_id);
                                    const isUserActive =
                                      groupUser?.race_active ||
                                      (groupUser?.total_active_seconds || 0) > 0;
                                    return (
                                      <>
                                        <IconButton
                                          onClick={() => handleEditUser(user.user_id)}
                                          size="small"
                                          disabled={isUserActive}
                                        >
                                          <EditIcon fontSize="small" />
                                        </IconButton>
                                        <IconButton
                                          onClick={() => setConfirmRemoveUserId(user.user_id)}
                                          color="error"
                                          size="small"
                                          disabled={isUserActive}
                                        >
                                          <DeleteIcon fontSize="small" />
                                        </IconButton>
                                      </>
                                    );
                                  })()}
                                </>
                              )}
                            </Stack>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  
                  {loadingMore && (
                    <UserTableSkeleton rows={3} />
                  )}
                  
                  {/* Empty state when no results found */}
                  {!loadingUsers && filteredUsers.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                        <Typography variant="body2">No users found</Typography>
                      </TableCell>
                    </TableRow>
                  )}
                  
                  {/* Load more button */}
                  {hasMore && filteredUsers.length > 0 && (
                    <TableRow>
                      <TableCell colSpan={7} align="center" sx={{ border: 0 }}>
                        <LoadingButton
                          loading={loadingMore}
                          variant="text"
                          onClick={handleLoadMore}
                          startIcon={!loadingMore && <SearchIcon />}
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

        {/* Confirm Remove Dialog (simple version) */}
        {confirmRemoveUserId && (
          <Dialog open onClose={() => setConfirmRemoveUserId(null)}>
            <DialogTitle>Remove User</DialogTitle>
            <DialogContent>Are you sure you want to remove this user from the group?</DialogContent>
            <DialogActions>
              <Button onClick={() => setConfirmRemoveUserId(null)} color="inherit">
                Cancel
              </Button>
              <Button onClick={handleConfirmRemoveUser} color="error" variant="contained">
                Remove
              </Button>
            </DialogActions>
          </Dialog>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        <LoadingButton 
          loading={isSaving} 
          onClick={handleSave} 
          variant="contained"
          color="primary" 
          disabled={!hasChanges || isSaving || loadingUsers}
        >
          Save
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
};
