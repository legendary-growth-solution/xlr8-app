/* eslint-disable import/no-extraneous-dependencies */
import React, { useEffect, useState } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Box,
  Stack,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  InputAdornment,
  List,
  ListItem,
  ListItemText,
  Divider,
  Checkbox,
  Chip,
  alpha,
  Skeleton,
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs, { Dayjs } from 'dayjs';
import { bookingApi } from 'src/services/api/booking.api';
import { BookingUser, Booking } from 'src/types/booking';
import { Iconify } from 'src/components/iconify';
import { showToast } from 'src/components/toast';
import { TimeSlot } from 'src/types/bookings';
import { getTimeSlotsForDay } from 'src/services/api/timeslots';
import { User } from 'src/types/user';
import { userApi } from 'src/services/api/user.api';
import { Plan } from 'src/types/session';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import SearchUserSkeleton from 'src/components/skeleton/SearchUserSkeleton';
import AddUserDialog from './AddUserDialog';

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

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

interface DraftSessionDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmitSuccess: () => void;
  plans: Plan[];
}

const DraftSessionDialog = ({ open, onClose, onSubmitSuccess, plans }: DraftSessionDialogProps) => {
  const [date, setDate] = useState<Dayjs | null>(dayjs());
  const [timeSlot, setTimeSlot] = useState<string>('');
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [loadingTimeSlots, setLoadingTimeSlots] = useState(false);
  
  const [users, setUsers] = useState<BookingUser[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const pageSize = 10;
  
  const [submitting, setSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<{
    date?: string;
    timeSlot?: string;
    users?: string;
  }>({});
  
  const [addUserDialogOpen, setAddUserDialogOpen] = useState(false);
  const [notes, setNotes] = useState<string>('');
  
  useEffect(() => {
    if (open) {
      setDate(dayjs());
      setTimeSlot('');
      setUsers([]);
      setSearchTerm('');
      setSearchResults([]);
      setFormErrors({});
    }
  }, [open]);
  
  useEffect(() => {
    if (date) {
      setLoadingTimeSlots(true);
      const dayOfWeek = date.format('dddd').toLowerCase();
      getTimeSlotsForDay(dayOfWeek)
        .then((slots) => {
          setTimeSlots(slots);
          if (slots.length === 0) {
            setTimeSlot('');
          }
        })
        .catch((error) => {
          console.error('Error fetching time slots:', error);
          showToast.error('Failed to fetch time slots');
          setTimeSlots([]);
          setTimeSlot('');
        })
        .finally(() => {
          setLoadingTimeSlots(false);
        });
    }
  }, [date]);
  
  useEffect(() => {
    if (debouncedSearchTerm.length >= 2) {
      setLoadingUsers(true);
      setCurrentPage(1);
      
      userApi.list({
        search: debouncedSearchTerm,
        page: 1,
        pageSize,
      })
        .then((response) => {
          setSearchResults(response.users);
          setHasMore(response.users.length >= pageSize);
        })
        .catch((error) => {
          console.error('Error searching users:', error);
          showToast.error('Failed to search users');
          setSearchResults([]);
          setHasMore(false);
        })
        .finally(() => {
          setLoadingUsers(false);
        });
    } else if (debouncedSearchTerm.length === 0) {
      setSearchResults([]);
    }
  }, [debouncedSearchTerm, pageSize]);
  
  const handleLoadMore = async () => {
    if (loadingMore || !hasMore) return;
    
    setLoadingMore(true);
    const nextPage = currentPage + 1;
    
    try {
      const response = await userApi.list({
        search: debouncedSearchTerm,
        page: nextPage,
        pageSize,
      });
      
      const newUniqueUsers = response.users.filter(
        (user) => !searchResults.some((existingUser) => existingUser.user_id === user.user_id)
      );
      
      setSearchResults((prevUsers) => [...prevUsers, ...newUniqueUsers]);
      setHasMore(response.users.length >= pageSize);
      setCurrentPage(nextPage);
    } catch (error) {
      console.error('Error loading more users:', error);
      showToast.error('Failed to load more users');
    } finally {
      setLoadingMore(false);
    }
  };
  
  const handleAddUser = (newUser: BookingUser) => {
    setUsers([...users, newUser]);
    setFormErrors((prev) => ({ ...prev, users: undefined }));
  };
  
  const validateForm = () => {
    const errors: { date?: string; timeSlot?: string; users?: string } = {};
    
    if (!date) {
      errors.date = 'Date is required';
    }
    
    if (users.length === 0) {
      errors.users = 'At least one user is required';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }
    
    setSubmitting(true);
    
    try {
      const bookingData: Partial<Booking> = {
        date: date?.format('DD-MM-YYYY'),
        time_slot: timeSlot,
        race_time: timeSlots.find((slot) => slot.id === timeSlot)?.start_time || '',
        race_day: timeSlots.find((slot) => slot.id === timeSlot)?.day || '',
        users: users.map((user) => ({
          user_id: user.user_id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          plan_id: user.plan_id,
          plan_name: plans.find((p) => p.plan_id === user.plan_id)?.title || '',
          plan_amount: plans.find((p) => p.plan_id === user.plan_id)?.amount || 0,
          plan_time: plans.find((p) => p.plan_id === user.plan_id)?.timeInMinutes || 0,  
          is_new: user.is_new,
          time_in_minutes: user.time_in_minutes,
        })),
        status: 'pending',
        source: 'admin',
        notes,
      };
      await bookingApi.create(bookingData);
      showToast.success('Draft session created successfully');
      onSubmitSuccess();
      onClose();
    } catch (error) {
      console.error('Error creating booking:', error);
      showToast.error('Failed to create booking');
    } finally {
      setSubmitting(false);
    }
  };
  
  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle>
          Create Booking (Draft Session)
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
        
        <DialogContent sx={{ pb: 2 }}>
          <Box sx={{ mt: 2 }}>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <Stack spacing={3}>
                <FormControl fullWidth error={!!formErrors.date}>
                  <DatePicker
                    label="Date"
                    value={date}
                    onChange={(newValue) => {
                      setDate(newValue);
                      if (newValue) {
                        setFormErrors((prev) => ({ ...prev, date: undefined }));
                      }
                    }}
                    disablePast
                    sx={{ width: '100%' }}
                  />
                  {formErrors.date && <FormHelperText>{formErrors.date}</FormHelperText>}
                </FormControl>

                <FormControl fullWidth error={!!formErrors.timeSlot}>
                  <InputLabel id="time-slot-label">Time Slot (Optional)</InputLabel>
                  <Select
                    labelId="time-slot-label"
                    value={timeSlot}
                    onChange={(e) => {
                      setTimeSlot(e.target.value);
                      setFormErrors((prev) => ({ ...prev, timeSlot: undefined }));
                    }}
                    label="Time Slot (Optional)"
                    disabled={loadingTimeSlots || !date}
                  >
                    {loadingTimeSlots ? (
                      <MenuItem value="" disabled>
                        Loading...
                      </MenuItem>
                    ) : timeSlots.length === 0 ? (
                      <MenuItem value="" disabled>
                        No time slots available
                      </MenuItem>
                    ) : (
                      timeSlots.map((slot) => (
                        <MenuItem key={slot.id} value={slot.id}>
                          {slot.start_time} - {slot.end_time}
                        </MenuItem>
                      ))
                    )}
                  </Select>
                  {formErrors.timeSlot && <FormHelperText>{formErrors.timeSlot}</FormHelperText>}
                </FormControl>

                <Divider />

                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="subtitle1">Racers</Typography>
                  <Button
                    variant="text"
                    onClick={() => setAddUserDialogOpen(true)}
                    startIcon={<Iconify icon="eva:plus-fill" />}
                    size="small"
                  >
                    Create new user
                  </Button>
                </Stack>
                
                {formErrors.users && (
                  <FormHelperText error>{formErrors.users}</FormHelperText>
                )}

                <FormControl fullWidth>
                  <TextField
                    label="Search users"
                    variant="outlined"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon />
                        </InputAdornment>
                      ),
                    }}
                  />
                </FormControl>

                {loadingUsers && debouncedSearchTerm.length >= 2 && (
                  <SearchUserSkeleton />
                )}

                {!loadingUsers && debouncedSearchTerm.length >= 2 && searchResults.length === 0 && (
                  <Box sx={{ textAlign: 'center', py: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      No users found
                    </Typography>
                  </Box>
                )}

                {searchResults.length > 0 && (
                  <Box sx={{ maxHeight: 200, overflow: 'auto', border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                    <List>
                      {searchResults.map((user) => {
                        const isSelected = users.some((u) => u.user_id === user.user_id);
                        return (
                          <ListItem
                            key={user.user_id}
                            secondaryAction={
                              <Checkbox
                                edge="end"
                                checked={isSelected}
                                onChange={() => {
                                  if (isSelected) {
                                    setUsers(users.filter((u) => u.user_id !== user.user_id));
                                  } else {
                                    setUsers([
                                      ...users,
                                      {
                                        user_id: user.user_id,
                                        name: user.name,
                                        email: user.email || '',
                                        phone: user.phone || '',
                                        plan_id: plans.length > 0 ? plans[0].plan_id : '',
                                      },
                                    ]);
                                    setFormErrors((prev) => ({ ...prev, users: undefined }));
                                  }
                                }}
                              />
                            }
                          >
                            <ListItemText
                              primary={user.name}
                              secondary={`${user.phone}${user.email ? ` • ${user.email}` : ''}`}
                            />
                          </ListItem>
                        );
                      })}
                      {loadingMore && (
                        <ListItem>
                          <ListItemText primary={<Skeleton width="100%" />} />
                        </ListItem>
                      )}
                      {hasMore && !loadingMore && (
                        <ListItem button onClick={() => handleLoadMore()}>
                          <ListItemText primary="Load more..." />
                        </ListItem>
                      )}
                    </List>
                  </Box>
                )}

                {users.length > 0 && (
                  <Box>
                    <Typography variant="subtitle2" gutterBottom>
                      Selected Racers ({users.length})
                    </Typography>
                    <Stack spacing={1}>
                      {users.map((user, index) => (
                        <Box
                          key={user.user_id || index}
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            p: 1,
                            border: '1px solid',
                            borderColor: 'divider',
                            borderRadius: 1,
                            bgcolor: user.is_new ? alpha('#4caf50', 0.1) : 'background.paper',
                          }}
                        >
                          <Box>
                            <Typography variant="body2">
                              {user.name} {user.is_new && <Chip label="New" size="small" color="success" />}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {user.phone}
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <FormControl sx={{ minWidth: 120 }}>
                              <Select
                                size="small"
                                value={user.plan_id}
                                onChange={(e) => {
                                  const updatedUsers = [...users];
                                  updatedUsers[index] = {
                                    ...updatedUsers[index],
                                    plan_id: e.target.value,
                                  };
                                  setUsers(updatedUsers);
                                }}
                              >
                                {plans.map((plan) => (
                                  <MenuItem key={plan.plan_id} value={plan.plan_id}>
                                    {plan.title || plan.name}
                                  </MenuItem>
                                ))}
                              </Select>
                            </FormControl>
                            
                            <TextField
                              size="small"
                              type="number"
                              label="Minutes"
                              value={user.time_in_minutes || ''}
                              onChange={(e) => {
                                const value = e.target.value ? Number(e.target.value) : undefined;
                                const updatedUsers = [...users];
                                updatedUsers[index] = {
                                  ...updatedUsers[index],
                                  time_in_minutes: value,
                                };
                                setUsers(updatedUsers);
                              }}
                              sx={{ width: 80 }}
                              InputProps={{ inputProps: { min: 1 } }}
                            />
                            
                            <IconButton
                              size="small"
                              onClick={() => {
                                setUsers(users.filter((_, i) => i !== index));
                              }}
                            >
                              <Iconify icon="eva:trash-2-outline" />
                            </IconButton>
                          </Box>
                        </Box>
                      ))}
                    </Stack>
                  </Box>
                )}

                <FormControl fullWidth>
                  <TextField
                    label="Notes"
                    variant="outlined"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    multiline
                    rows={4}
                  />
                </FormControl>
              </Stack>
            </LocalizationProvider>
          </Box>
        </DialogContent>
        
        <DialogActions>
          <Button onClick={onClose} color="inherit">
            Cancel
          </Button>
          <LoadingButton loading={submitting} variant="contained" onClick={handleSubmit} disabled={submitting}>
            Create Booking
          </LoadingButton>
        </DialogActions>
      </Dialog>
      
      <AddUserDialog
        open={addUserDialogOpen}
        onClose={() => setAddUserDialogOpen(false)}
        onAddUser={handleAddUser}
        plans={plans}
      />
    </>
  );
};

export default DraftSessionDialog; 