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
import { CountryCodeSelect } from 'src/components/common/CountryCodeSelect';

import { Iconify } from 'src/components/iconify';
import { HighlightedText } from 'src/components/common/HighlightedText';

interface UserManageModalProps {
  open: boolean;
  onClose: () => void;
  onSelectUser: (user: User) => void;
  onAddUser: (user: { name: string; first_name?: string; last_name?: string; phone: string; email?: string; age?: number; country_code?: string; full_phone?: string }) => void;
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
  const [newUserFirstName, setNewUserFirstName] = useState('');
  const [newUserLastName, setNewUserLastName] = useState('');
  const [newUserAge, setNewUserAge] = useState('');
  const [newUserCountryCode, setNewUserCountryCode] = useState('+91');
  const [newUserPhone, setNewUserPhone] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [ageError, setAgeError] = useState('');
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
    if (!newUserFirstName.trim() || !newUserLastName.trim() || !newUserPhone.trim()) {
      return;
    }

    if (!newUserAge || Number.isNaN(Number(newUserAge)) || Number(newUserAge) <= 0) {
      setAgeError('Valid age is required');
      return;
    }

    const phoneValidationError = validatePhoneNumber(newUserPhone);
    if (phoneValidationError) {
      setPhoneError(phoneValidationError);
      return;
    }

    const cc = newUserCountryCode.trim() || '+91';
    const rawPhone = newUserPhone.trim();
    const fullPhone = `${cc}${rawPhone}`;
    const fullName = `${newUserFirstName.trim()} ${newUserLastName.trim()}`;

    onAddUser({
      name: fullName,
      first_name: newUserFirstName.trim(),
      last_name: newUserLastName.trim(),
      phone: rawPhone,
      email: newUserEmail.trim() || undefined,
      age: Number(newUserAge),
      country_code: cc,
      full_phone: fullPhone,
    });

    handleClose();
  };

  const handleClose = () => {
    setSearchQuery('');
    setUsers([]);
    setNewUserFirstName('');
    setNewUserLastName('');
    setNewUserAge('');
    setNewUserCountryCode('+91');
    setNewUserPhone('');
    setNewUserEmail('');
    setPhoneError('');
    setAgeError('');
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
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: { height: '80vh', maxHeight: 650 },
      }}
    >
      <DialogTitle sx={{ m: 0, p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="h6">{title}</Typography>
        <Button onClick={handleClose} color="inherit" size="small">
          Close
        </Button>
      </DialogTitle>

      <DialogContent dividers sx={{ p: 2.5, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            Search Existing User
          </Typography>
          <TextField
            fullWidth
            placeholder={placeholderText}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Iconify icon="eva:search-fill" width={20} />
                </InputAdornment>
              ),
              endAdornment: loading ? (
                <InputAdornment position="end">
                  <CircularProgress size={20} />
                </InputAdornment>
              ) : null,
            }}
          />

          {searchQuery.trim().length > 0 && (
            <Box sx={{ mt: 1.5, maxHeight: 220, overflow: 'auto', border: 1, borderColor: 'divider', borderRadius: 1 }}>
              {searchQuery.trim().length < 2 ? (
                <Box sx={{ p: 2, textAlign: 'center', color: 'text.secondary' }}>
                  Type at least 2 characters to search...
                </Box>
              ) : users.length === 0 && !loading ? (
                <Box sx={{ p: 2, textAlign: 'center', color: 'text.secondary' }}>
                  No users found
                </Box>
              ) : (
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
          )}
        </Box>

        <Divider />

        <Box>
          <Typography variant="subtitle2" sx={{ mb: 2 }}>
            Add New User
          </Typography>
          <Stack spacing={2}>
            <Stack direction="row" spacing={2}>
              <TextField
                fullWidth
                label="First Name"
                value={newUserFirstName}
                onChange={(e) => setNewUserFirstName(e.target.value)}
                required
              />
              <TextField
                fullWidth
                label="Last Name"
                value={newUserLastName}
                onChange={(e) => setNewUserLastName(e.target.value)}
                required
              />
            </Stack>
            <TextField
              fullWidth
              type="number"
              label="Age"
              value={newUserAge}
              onChange={(e) => {
                setNewUserAge(e.target.value);
                if (e.target.value) setAgeError('');
              }}
              error={!!ageError}
              helperText={ageError}
              required
              inputProps={{ min: 1, max: 120 }}
            />
            <Stack direction="row" spacing={2} alignItems="center">
              <CountryCodeSelect
                value={newUserCountryCode}
                onChange={(val) => setNewUserCountryCode(val)}
                sx={{ width: 140 }}
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
            </Stack>
            <TextField
              fullWidth
              label="Email (Optional)"
              value={newUserEmail}
              onChange={(e) => setNewUserEmail(e.target.value)}
            />
          </Stack>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleAddUser}
          disabled={!newUserFirstName.trim() || !newUserLastName.trim() || !newUserPhone.trim()}
        >
          Add New Racer
        </Button>
      </DialogActions>
    </Dialog>
  );
}
