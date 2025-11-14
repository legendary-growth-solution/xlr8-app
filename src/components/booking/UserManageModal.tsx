import type { User } from 'src/types/user';

import { useRef, useState, useEffect } from 'react';

import {
  Box,
  Chip,
  List,
  Stack,
  Button,
  Dialog,
  Divider,
  Skeleton,
  TextField,
  Typography,
  DialogTitle,
  ListItemText,
  DialogContent,
  DialogActions,
  InputAdornment,
  ListItemButton,
  CircularProgress,
} from '@mui/material';

import { userApi } from 'src/services/api/user.api';

import { Iconify } from 'src/components/iconify';
import { HighlightedText } from 'src/components/common/HighlightedText';

interface UserManageModalProps {
  open: boolean;
  onClose: () => void;
  onSelectUser: (user: User) => void;
  onAddUser: (user: { name: string; phone: string; email?: string }) => void;
  alreadyAddedUserIds?: string[];
  currentUserIndex?: number;
  currentUserPlan?: string;
}

export function UserManageModal({
  open,
  onClose,
  onSelectUser,
  onAddUser,
  alreadyAddedUserIds = [],
  currentUserIndex,
  currentUserPlan = '',
}: UserManageModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserPhone, setNewUserPhone] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (searchQuery.trim().length >= 2) {
      searchTimeoutRef.current = setTimeout(() => {
        searchUsers(searchQuery.trim());
      }, 300);
    } else {
      setUsers([]);
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery]);

  const searchUsers = async (query: string) => {
    try {
      setLoading(true);
      const response = await userApi.list({
        search: query,
        page: 1,
        pageSize: 10,
      });
      setUsers(response.users || []);
    } catch (error) {
      console.error('Error searching users:', error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectUser = (user: User) => {
    onSelectUser(user);
    handleClose();
  };

  const validatePhoneNumber = (phone: string) => {
    const digitsOnly = phone.replace(/\D/g, '');
    if (digitsOnly.length < 4) {
      return 'Phone number must be at least 4 digits';
    }
    if (digitsOnly.length > 15) {
      return 'Phone number cannot exceed 15 digits';
    }
    return '';
  };

  const handlePhoneChange = (value: string) => {
    const digitsOnly = value.replace(/\D/g, '');
    if (digitsOnly.length <= 15) {
      setNewUserPhone(digitsOnly);
      if (digitsOnly.trim()) {
        const error = validatePhoneNumber(digitsOnly);
        setPhoneError(error);
      } else {
        setPhoneError('');
      }
    }
  };

  const handleAddUser = () => {
    if (!newUserName.trim() || !newUserPhone.trim()) {
      return;
    }

    const phoneValidationError = validatePhoneNumber(newUserPhone);
    if (phoneValidationError) {
      setPhoneError(phoneValidationError);
      return;
    }

    onAddUser({
      name: newUserName.trim(),
      phone: newUserPhone.trim(),
      email: newUserEmail.trim() || undefined,
    });

    handleClose();
  };

  const handleClose = () => {
    setSearchQuery('');
    setUsers([]);
    setNewUserName('');
    setNewUserPhone('');
    setNewUserEmail('');
    setPhoneError('');
    onClose();
  };

  const placeholderText =
    currentUserIndex !== undefined
      ? `Search racer ${currentUserIndex + 1}${currentUserPlan ? ` - ${currentUserPlan}` : ''}`
      : 'Search racer name, phone, or email';

  const title = currentUserIndex !== undefined 
    ? `Manage Racer ${currentUserIndex + 1}${currentUserPlan ? ` - ${currentUserPlan}` : ''}`
    : 'Manage Racer';

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <Stack spacing={3} sx={{ mt: 1 }}>
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Search Existing Users
            </Typography>
            <TextField
              fullWidth
              placeholder={placeholderText}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Iconify icon="eva:search-fill" />
                  </InputAdornment>
                ),
                endAdornment: loading && (
                  <InputAdornment position="end">
                    <CircularProgress size={20} />
                  </InputAdornment>
                ),
              }}
            />

            <Box
              sx={{
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 2,
                minHeight: 150,
                maxHeight: 300,
                overflowY: 'auto',
                backgroundColor: 'background.default',
                mt: 1,
              }}
            >
              {searchQuery.trim().length > 0 && searchQuery.trim().length < 2 && (
                <Box sx={{ py: 3, textAlign: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    Type at least 2 characters to search
                  </Typography>
                </Box>
              )}

              {loading && searchQuery.trim().length >= 2 && (
                <List disablePadding>
                  {[1, 2, 3].map((item) => (
                    <Box key={`skeleton-${item}`} sx={{ px: 2, py: 1 }}>
                      <Skeleton width="60%" height={18} />
                      <Skeleton width="40%" height={14} />
                    </Box>
                  ))}
                </List>
              )}

              {!loading && searchQuery.trim().length >= 2 && users.length === 0 && (
                <Box sx={{ py: 3, textAlign: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    No users found
                  </Typography>
                </Box>
              )}

              {users.length > 0 && (
                <List disablePadding>
                  {users.map((user) => {
                    const isAlreadyAdded = alreadyAddedUserIds.includes(user.user_id);
                    return (
                      <ListItemButton
                        key={user.user_id}
                        onClick={() => handleSelectUser(user)}
                        disabled={isAlreadyAdded}
                        sx={{ 
                          justifyContent: 'space-between',
                          px: 2,
                          py: 1.5,
                        }}
                      >
                        <ListItemText
                          primary={
                            <HighlightedText
                              text={user.highlight_result?.name?.value || user.name}
                              variant="body1"
                            />
                          }
                          secondary={
                            <Stack spacing={0.25}>
                              <HighlightedText
                                text={user.highlight_result?.phone?.value || user.phone}
                                variant="body2"
                                color="text.secondary"
                              />
                              {user.email && (
                                <HighlightedText
                                  text={user.highlight_result?.email?.value || user.email}
                                  variant="body2"
                                  color="text.secondary"
                                />
                              )}
                            </Stack>
                          }
                        />
                        {isAlreadyAdded && (
                          <Chip
                            label="Already Added"
                            size="small"
                            color="warning"
                            variant="outlined"
                          />
                        )}
                      </ListItemButton>
                    );
                  })}
                </List>
              )}
            </Box>
          </Box>

          <Divider />

          <Box>
            <Typography variant="subtitle2" sx={{ mb: 2 }}>
              Add New User
            </Typography>
            <Stack spacing={2}>
              <TextField
                fullWidth
                label="Name"
                value={newUserName}
                onChange={(e) => setNewUserName(e.target.value)}
                required
              />
              <TextField
                fullWidth
                label="Phone"
                value={newUserPhone}
                onChange={(e) => handlePhoneChange(e.target.value)}
                error={!!phoneError}
                helperText={phoneError}
                required
                inputMode="numeric"
                inputProps={{
                  maxLength: 15,
                }}
              />
              <TextField
                fullWidth
                label="Email (Optional)"
                value={newUserEmail}
                onChange={(e) => setNewUserEmail(e.target.value)}
                type="email"
              />
            </Stack>
          </Box>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleAddUser}
          disabled={!newUserName.trim() || !newUserPhone.trim()}
        >
          Add New Racer
        </Button>
      </DialogActions>
    </Dialog>
  );
}
