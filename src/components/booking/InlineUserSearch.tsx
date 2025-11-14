import type { User } from 'src/types/user';

import { useRef, useState, useEffect } from 'react';

import {
  Box,
  Chip,
  List,
  Paper,
  Stack,
  Popper,
  Skeleton,
  TextField,
  Typography,
  InputAdornment,
  ListItemButton,
  CircularProgress,
  ClickAwayListener,
} from '@mui/material';

import { userApi } from 'src/services/api/user.api';

import { Iconify } from 'src/components/iconify';
import { HighlightedText } from 'src/components/common/HighlightedText';

interface InlineUserSearchProps {
  onSelectUser: (user: User) => void;
  alreadyAddedUserIds?: string[];
  currentUserIndex?: number;
  placeholder?: string;
  disabled?: boolean;
  currentUserPlan?: string;
}

export function InlineUserSearch({
  onSelectUser,
  alreadyAddedUserIds = [],
  currentUserIndex,
  placeholder,
  disabled = false,
  currentUserPlan = '',
}: InlineUserSearchProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const anchorRef = useRef<HTMLDivElement>(null);

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
      setOpen(false);
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
      setOpen(true);
    } catch (error) {
      console.error('Error searching users:', error);
      setUsers([]);
      setOpen(false);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectUser = (user: User) => {
    onSelectUser(user);
    setSearchQuery('');
    setUsers([]);
    setOpen(false);
  };

  const handleFocus = () => {
    if (searchQuery.trim().length >= 2 && users.length > 0) {
      setOpen(true);
    }
  };

  const handleClickAway = () => {
    setOpen(false);
  };

  const placeholderText = placeholder || 
    (currentUserIndex !== undefined
      ? `Search racer ${currentUserIndex + 1}${currentUserPlan ? ` - ${currentUserPlan}` : ''}`
      : 'Search racer name, phone, or email');

  return (
    <ClickAwayListener onClickAway={handleClickAway}>
      <Box ref={anchorRef} sx={{ position: 'relative' }}>
        <TextField
          fullWidth
          placeholder={disabled ? 'All racers selected' : placeholderText}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={handleFocus}
          disabled={disabled}
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

        <Popper
          open={open}
          anchorEl={anchorRef.current}
          placement="bottom-start"
          style={{ width: anchorRef.current?.offsetWidth, zIndex: 1300 }}
        >
          <Paper
            elevation={8}
            sx={{
              maxHeight: 300,
              overflowY: 'auto',
              mt: 0.5,
            }}
          >
            {searchQuery.trim().length > 0 && searchQuery.trim().length < 2 && (
              <Box sx={{ py: 2, px: 2, textAlign: 'center' }}>
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
              <Box sx={{ py: 2, px: 2, textAlign: 'center' }}>
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
                        py: 1,
                      }}
                    >
                      <Box sx={{ flex: 1 }}>
                        <HighlightedText
                          text={user.highlight_result?.name?.value || user.name}
                          variant="body2"
                          sx={{ fontWeight: 500 }}
                        />
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
                      </Box>
                      {isAlreadyAdded && (
                        <Chip
                          label="Added"
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
          </Paper>
        </Popper>
      </Box>
    </ClickAwayListener>
  );
}
