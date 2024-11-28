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
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { Scrollbar } from 'src/components/scrollbar';
import { Iconify } from 'src/components/iconify';
import { User, Group } from 'src/types/session';
import { MOCK_GROUP_USERS } from 'src/services/mock/mock-data';

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
  const getFilteredUsers = () => {
    const query = searchQuery.toLowerCase();
    return allUsers.filter(user => 
      user.name.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query) ||
      (user.phone && user.phone.includes(query))
    );
  };

  const filteredUsers = getFilteredUsers();
  const MIN_TIME = 5;
  const hasInvalidTimes = selectedUsers.some(user => !user.timeInMinutes || user.timeInMinutes < MIN_TIME);

  const isUserRaceStarted = (userId: string, groupId: string) => {
    const mapping = MOCK_GROUP_USERS.find(
      gu => gu.groupId === groupId && gu.userId === userId
    );
    return mapping?.raceStatus === 'in_progress' || mapping?.raceStatus === 'completed';
  };

  const getUserExistingTime = (userId: string, groupId: string) => {
    const mapping = MOCK_GROUP_USERS.find(
      gu => gu.groupId === groupId && gu.userId === userId
    );
    return mapping?.allowedDuration || 0;
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
              {filteredUsers.map((user) => {
                const selectedUser = selectedUsers.find(su => su.userId === user.id);
                const isSelected = !!selectedUser;
                const isAssigned = otherGroups.some(g => 
                  g.id !== group?.id && g.users.some(u => u.id === user.id)
                );
                const hasRaceStarted = group && isUserRaceStarted(user.id, group.id);
                const existingTime = group ? getUserExistingTime(user.id, group.id) : 0;

                return (
                  <TableRow key={user.id} hover>
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={isSelected || hasRaceStarted || false}
                        disabled={isAssigned || hasRaceStarted || false}
                        onChange={(e) => onSelectUser(user.id, e.target.checked)}
                      />
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
                      {(isSelected || hasRaceStarted) && (
                        <TextField
                          type="number"
                          size="small"
                          value={hasRaceStarted ? existingTime : (selectedUser?.timeInMinutes || '')}
                          onChange={(e) => onTimeChange(user.id, Number(e.target.value))}
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
                          error={!hasRaceStarted && (!selectedUser?.timeInMinutes || selectedUser.timeInMinutes < MIN_TIME)}
                        />
                      )}
                    </TableCell>

                    <TableCell align="center">
                      <Chip
                        size="small"
                        label={
                          hasRaceStarted ? 'Race Started' :
                          isAssigned ? 'Assigned' : 
                          isSelected ? 'Selected' : 
                          'Available'
                        }
                        color={
                          hasRaceStarted ? 'error' :
                          isAssigned ? 'warning' : 
                          isSelected ? 'primary' : 
                          'default'
                        }
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Scrollbar>
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Typography variant="caption" sx={{ color: 'error.main', flexGrow: 1 }}>
          {hasInvalidTimes && `Please set valid time (minimum ${MIN_TIME} minutes) for all selected users`}
        </Typography>
        <Button variant="outlined" onClick={onClose}>
          Cancel
        </Button>
        <LoadingButton 
          variant="contained" 
          loading={loading} 
          onClick={onSave}
          disabled={hasInvalidTimes}
        >
          Save Changes
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
} 