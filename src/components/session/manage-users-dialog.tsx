import React, {
  useState,
  useEffect,
  useCallback,
  ChangeEvent,
  FormEvent,
} from 'react';
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
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import { Group, NewUser, Plan } from 'src/types/session';
import { User } from 'src/types/user';

interface ManageUsersDialogProps {
  open: boolean;
  onClose: VoidFunction;
  group: Group;
  handleAddUsers: (group_id: string, data: NewUser[]) => void;
  handleUpdateUser: (
    group_id: string,
    user_id: string,
    data: NewUser
  ) => void;
  handleRemoveUser: (group_id: string, user_id: string) => void;
  plans: Plan[];
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

/**
 * Example function to fetch all users.
 * Replace this with your actual data-fetching logic or pass the user list as a prop if you prefer.
 */
async function fetchAllUsers(): Promise<User[]> {
  // Mocked example data
  return [
    {
      user_id: 'u1',
      name: 'Alice Johnson',
      email: 'alice@example.com',
      phone: '555-1234',
    },
    {
      user_id: 'u2',
      name: 'Bob Smith',
      email: 'bob@example.com',
      phone: '555-5678',
    },
    {
      user_id: 'u3',
      name: 'Charlie Brown',
      email: 'charlie@example.com',
      phone: '555-9999',
    },
    {
      user_id: 'u4',
      name: 'Diana Prince',
      email: 'diana@example.com',
      phone: '555-1111',
    },
    // etc...
  ];
}

export const ManageUsersDialog: React.FC<ManageUsersDialogProps> = ({
  open,
  onClose,
  group,
  handleAddUsers,
  handleUpdateUser,
  handleRemoveUser,
  plans,
}) => {
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  // For newly selected users
  // Key: user_id -> { plan_id, user_name, user_id }
  const [selectedUsers, setSelectedUsers] = useState<Record<string, NewUser>>(
    {}
  );

  // For plan changes on existing group members (optional immediate or batch)
  // We'll store them for immediate or separate update action
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editingPlanId, setEditingPlanId] = useState<string>('');

  // For remove confirmation
  const [confirmRemoveUserId, setConfirmRemoveUserId] = useState<
    string | null
  >(null);

  /**
   * Fetch all users once the dialog opens.
   */
  useEffect(() => {
    if (open) {
      fetchAllUsers().then((users) => {
        setAllUsers(users);
      });
    }
  }, [open]);

  /**
   * Reset states when dialog closes
   */
  useEffect(() => {
    if (!open) {
      setSearchTerm('');
      setSelectedUsers({});
      setEditingUserId(null);
      setConfirmRemoveUserId(null);
    }
  }, [open]);

  /**
   * Handler for search input change
   */
  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  /**
   * Filter & sort users:
   * 1. Group users come first
   * 2. Then the rest
   * 3. Then filter by searchTerm
   */
  const filteredUsers = React.useMemo(() => {
    const inGroup = new Set(group.users.map((u) => u.user_id));

    // filter by search term ignoring case
    const lowerSearch = debouncedSearchTerm.toLowerCase();
    const matchesSearch = (str: string) =>
      str.toLowerCase().includes(lowerSearch);

    const sortedUsers = [...allUsers].sort((a, b) => {
      // Sort by whether in group or not
      const aInGroup = inGroup.has(a.user_id) ? 0 : 1;
      const bInGroup = inGroup.has(b.user_id) ? 0 : 1;
      if (aInGroup !== bInGroup) return aInGroup - bInGroup;
      // Then by name if needed
      return a.name.localeCompare(b.name);
    });

    return sortedUsers.filter((user) => (
        matchesSearch(user.name) ||
        matchesSearch(user.email) ||
        matchesSearch(user.phone)
      )
    );
  }, [allUsers, group.users, debouncedSearchTerm]);

  /**
   * Checks if a user is already in the group
   */
  const isUserInGroup = (userId: string): boolean => {
    return group.users.some((gu) => gu.user_id === userId);
  };

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
  const handleSelectPlanForNewUser = (
    user: User,
    e: ChangeEvent<{ value: unknown }>
  ) => {
    const plan_id = e.target.value as string;
    setSelectedUsers((prev) => ({
      ...prev,
      [user.user_id]: {
        user_id: user.user_id,
        user_name: user.name,
        plan_id,
      },
    }));
  };

  /**
   * Handler for toggling selection of a user (checkbox).
   */
  const handleToggleUserSelection = (user: User) => {
    setSelectedUsers((prev) => {
      // If user is already selected, remove them
      if (prev[user.user_id]) {
        const { [user.user_id]: _, ...rest } = prev;
        return rest;
      }
      // Otherwise, add with default plan if you want
      return {
        ...prev,
        [user.user_id]: {
          user_id: user.user_id,
          user_name: user.name,
          plan_id: plans.length ? plans[0].plan_id : '',
        },
      };
    });
  };

  /**
   * Check if user is selected (for new additions)
   */
  const isSelectedForAddition = (userId: string): boolean => {
    return !!selectedUsers[userId];
  };

  /**
   * Handler for Save button (add newly selected users in batch).
   */
  const handleSave = () => {
    const newUsersArray: NewUser[] = Object.values(selectedUsers);
    if (newUsersArray.length > 0) {
      handleAddUsers(group.group_id, newUsersArray);
    }
    onClose();
  };

  /**
   * Handle editing plan for existing user
   */
  const handleEditUser = (user_id: string) => {
    setEditingUserId(user_id);
    // initialize editingPlanId from existing user’s plan
    const currentPlan = getUserPlanFromGroup(user_id);
    if (currentPlan) setEditingPlanId(currentPlan);
  };

  /**
   * Confirm the plan update for an existing user
   */
  const handleConfirmUpdateUser = () => {
    if (!editingUserId) return;
    const data: NewUser = {
      user_id: editingUserId,
      user_name: '', // or fill from some source if needed
      plan_id: editingPlanId,
    };
    handleUpdateUser(group.group_id, editingUserId, data);
    setEditingUserId(null);
  };

  /**
   * Handle removing an existing user from the group
   */
  const handleConfirmRemoveUser = () => {
    if (!confirmRemoveUserId) return;
    handleRemoveUser(group.group_id, confirmRemoveUserId);
    setConfirmRemoveUserId(null);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        Manage Users in "{group.name}"
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
          <SearchIcon sx={{ mr: 1 }} />
          <TextField
            label="Search users..."
            variant="outlined"
            fullWidth
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </Box>

        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell />
              <TableCell>User Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Phone</TableCell>
              <TableCell>Plan</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredUsers.map((user) => {
              const inGroup = isUserInGroup(user.user_id);
              const selected = isSelectedForAddition(user.user_id);

              return (
                <TableRow key={user.user_id}>
                  <TableCell>
                    {!inGroup && (
                      <Checkbox
                        checked={selected}
                        onChange={() => handleToggleUserSelection(user)}
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
                          onChange={(e) =>
                            setEditingPlanId(e.target.value as string)
                          }
                          size="small"
                          sx={{ minWidth: 120 }}
                        >
                          {plans.map((plan) => (
                            <MenuItem key={plan.plan_id} value={plan.plan_id}>
                              {plan.name}
                            </MenuItem>
                          ))}
                        </Select>
                      ) : (
                        // Display read-only plan name
                        <Typography variant="body2">
                          {
                            plans.find(
                              (p) =>
                                p.plan_id ===
                                getUserPlanFromGroup(user.user_id)
                            )?.name
                          }
                        </Typography>
                      )
                    ) : (
                      // If user is not in group, plan dropdown for new user
                      selected && (
                        <Select
                          value={selectedUsers[user.user_id]?.plan_id || ''}
                          onChange={(e: any) => handleSelectPlanForNewUser(user, e)}
                          size="small"
                          sx={{ minWidth: 120 }}
                        >
                          {plans.map((plan) => (
                            <MenuItem key={plan.plan_id} value={plan.plan_id}>
                              {plan.name}
                            </MenuItem>
                          ))}
                        </Select>
                      )
                    )}
                  </TableCell>

                  <TableCell align="center">
                    {/* If already in group, show edit/remove actions */}
                    {inGroup && (
                      <>
                        {editingUserId === user.user_id ? (
                          <>
                            <Button
                              variant="outlined"
                              color="primary"
                              size="small"
                              onClick={handleConfirmUpdateUser}
                              sx={{ mr: 1 }}
                            >
                              Save
                            </Button>
                            <Button
                              variant="outlined"
                              color="inherit"
                              size="small"
                              onClick={() => setEditingUserId(null)}
                            >
                              Cancel
                            </Button>
                          </>
                        ) : (
                          <>
                            <IconButton
                              onClick={() => handleEditUser(user.user_id)}
                              size="small"
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                            <IconButton
                              onClick={() =>
                                setConfirmRemoveUserId(user.user_id)
                              }
                              color="error"
                              size="small"
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </>
                        )}
                      </>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>

        {/* Confirm Remove Dialog (simple version) */}
        {confirmRemoveUserId && (
          <Dialog open onClose={() => setConfirmRemoveUserId(null)}>
            <DialogTitle>Remove User</DialogTitle>
            <DialogContent>
              Are you sure you want to remove this user from the group?
            </DialogContent>
            <DialogActions>
              <Button
                onClick={() => setConfirmRemoveUserId(null)}
                color="inherit"
              >
                Cancel
              </Button>
              <Button
                onClick={handleConfirmRemoveUser}
                color="error"
                variant="contained"
              >
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
        <Button
          onClick={handleSave}
          color="primary"
          variant="contained"
          disabled={!Object.keys(selectedUsers).length}
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};
