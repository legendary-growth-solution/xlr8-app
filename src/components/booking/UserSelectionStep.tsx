import type { Plan } from 'src/types/session';
import type { TimeSlot } from 'src/types/bookings';

import dayjs, { type Dayjs } from 'dayjs';
import { useState, useEffect, forwardRef, useCallback, useImperativeHandle } from 'react';

import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import {
  Box,
  Stack,
  Select,
  Divider,
  MenuItem,
  TextField,
  Typography,
  InputLabel,
  FormControl,
} from '@mui/material';

import { bookingApi } from 'src/services/api/booking.api';
import { getTimeSlots } from 'src/services/api/timeslots';

import { showToast } from 'src/components/toast';

import { UserCard } from './UserCard';
import { UserManageModal } from './UserManageModal';
import { InlineUserSearch } from './InlineUserSearch';

import type { PlanCartSelection } from './bookingSummaryUtils';

interface BookingUser {
  user_id: string;
  name: string;
  email: string;
  phone: string;
  plan_id: string;
  cart_type_requested?: string;
  is_new?: boolean;
  time_in_minutes?: number;
}

interface UserSelectionStepProps {
  peopleCount: number;
  selections: PlanCartSelection[];
  plans: Plan[];
  sameForAll: boolean;
  onSubmit: (bookingData: any) => Promise<void>;
  submitting: boolean;
  onValidityChange?: (valid: boolean) => void;
}


export const UserSelectionStep = forwardRef<
  { handleSubmit: () => Promise<void> },
  UserSelectionStepProps
>(({
  peopleCount,
  selections,
  plans,
  sameForAll,
  onSubmit,
  submitting,
  onValidityChange,
}, ref) => {
  const [users, setUsers] = useState<BookingUser[]>([]);
  const [date, setDate] = useState<Dayjs | null>(dayjs());
  const [timeSlot, setTimeSlot] = useState('');
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [notes, setNotes] = useState('');
  const [discountCode, setDiscountCode] = useState('');
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  const [userManageModalOpen, setUserManageModalOpen] = useState(false);
  const [selectedUserIndex, setSelectedUserIndex] = useState<number | null>(null);
  const [duplicatePhoneMessage, setDuplicatePhoneMessage] = useState('');

  const initializeUsersCallback = useCallback(() => {
    const newUsers: BookingUser[] = [];
    
    if (sameForAll && selections.length > 0) {
      const selection = selections[0];
      for (let i = 0; i < peopleCount; i += 1) {
        newUsers.push({
          user_id: `new-${Date.now()}-${i}`,
          name: '',
          email: '',
          phone: '',
          plan_id: selection.planId,
          cart_type_requested: selection.cartType,
          is_new: true,
        });
      }
    } else {
      selections.forEach((selection, index) => {
        if (index < peopleCount) {
          newUsers.push({
            user_id: `new-${Date.now()}-${index}`,
            name: '',
            email: '',
            phone: '',
            plan_id: selection.planId,
            cart_type_requested: selection.cartType,
            is_new: true,
          });
        }
      });
    }
    
    setUsers(newUsers);
  }, [peopleCount, selections, sameForAll]);

  useEffect(() => {
    initializeUsersCallback();
  }, [initializeUsersCallback]);

  useEffect(() => {
    fetchTimeSlots();
  }, []);


  const fetchTimeSlots = async () => {
    try {
      const response = await getTimeSlots();
      setTimeSlots(response || []);
    } catch (error) {
      console.error('Error fetching time slots:', error);
      setTimeSlots([]);
    }
  };

  const updateUser = (index: number, field: keyof BookingUser, value: string) => {
    const updatedUsers = [...users];
    const normalizedValue =
      field === 'time_in_minutes'
        ? value === ''
          ? undefined
          : Number(value)
        : value;
    updatedUsers[index] = { ...updatedUsers[index], [field]: normalizedValue };
    setUsers(updatedUsers);
    
    if (formErrors[`user_${index}_${field}`]) {
      const newErrors = { ...formErrors };
      delete newErrors[`user_${index}_${field}`];
      setFormErrors(newErrors);
    }
  };

  const evaluateUserData = useCallback(
    (withErrors = false) => {
      const errors: { [key: string]: string } = {};
      const phoneNumbers = new Set<string>();
      let isValid = true;

      users.forEach((user, index) => {
        const trimmedName = user.name.trim();
        const trimmedPhone = user.phone.trim();

        if (!trimmedName) {
          isValid = false;
          if (withErrors) {
            errors[`user_${index}_name`] = 'Name is required';
          }
        }

        if (!trimmedPhone) {
          isValid = false;
          if (withErrors) {
            errors[`user_${index}_phone`] = 'Phone is required';
          }
        } else if (phoneNumbers.has(trimmedPhone)) {
          isValid = false;
          if (withErrors) {
            errors[`user_${index}_phone`] = 'Phone number already used by another person';
          }
        } else {
          phoneNumbers.add(trimmedPhone);
        }
      });

      if (withErrors) {
        setFormErrors(errors);
      }

      return isValid;
    },
    [users]
  );

  const validateForm = () => evaluateUserData(true);

  useEffect(() => {
    if (onValidityChange) {
      onValidityChange(evaluateUserData(false));
    }
  }, [evaluateUserData, onValidityChange]);

  useEffect(() => {
    const trimmedPhones = users.map((user) => user.phone.trim()).filter((phone) => phone.length > 0);
    const hasDuplicates = trimmedPhones.some((phone, index) => trimmedPhones.indexOf(phone) !== index);
    setDuplicatePhoneMessage(hasDuplicates ? 'Phone number already used by another person' : '');
  }, [users]);

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }
    
    try {
      const bookingData = {
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
          cart_type_requested: user.cart_type_requested,
        })),
        status: 'pending' as const,
        source: 'admin',
        notes,
        discount_code: discountCode || undefined,
      };
      
      await bookingApi.create(bookingData);
      showToast.success('Booking created successfully');
      await onSubmit(bookingData);
    } catch (error: any) {
      console.error('Error creating booking:', error);
      showToast.error(error?.response?.data?.error || 'Failed to create booking');
    }
  };

  const getPlanLabel = (planId: string) => {
    const plan = plans.find(p => p.plan_id === planId);
    return plan ? `${plan.title} - ₹${plan.amount} (${plan.timeInMinutes}min)` : '';
  };

  const getNextEmptyUserIndex = (sourceUsers: BookingUser[] = users) =>
    sourceUsers.findIndex((user) => !(user.name.trim() && user.phone.trim()));

  const handleManageUser = (index: number) => {
    setSelectedUserIndex(index);
    setUserManageModalOpen(true);
  };

  const handleSelectExistingUser = (user: any) => {
    if (selectedUserIndex !== null) {
      const updatedUsers = [...users];
      updatedUsers[selectedUserIndex] = {
        ...updatedUsers[selectedUserIndex],
        user_id: user.user_id,
        name: user.name,
        email: user.email || '',
        phone: user.phone,
        is_new: false,
      };
      setUsers(updatedUsers);
      focusNextSlot(updatedUsers);
    }
  };

  const handleAddNewUser = (user: { name: string; phone: string; email?: string }) => {
    if (selectedUserIndex !== null) {
      const updatedUsers = [...users];
      updatedUsers[selectedUserIndex] = {
        ...updatedUsers[selectedUserIndex],
        user_id: `new-${Date.now()}-${selectedUserIndex}`,
        name: user.name,
        email: user.email || '',
        phone: user.phone,
        is_new: true,
      };
      setUsers(updatedUsers);
      closeManageModal();
      focusNextSlot(updatedUsers);
    }
  };

  const handleInlineUserSelect = (user: any) => {
    const nextIndex = getNextEmptyUserIndex();
    if (nextIndex !== -1) {
      const updatedUsers = [...users];
      updatedUsers[nextIndex] = {
        ...updatedUsers[nextIndex],
        user_id: user.user_id,
        name: user.name,
        email: user.email || '',
        phone: user.phone,
        is_new: false,
      };
      setUsers(updatedUsers);
    }
  };

  const closeManageModal = () => {
    setUserManageModalOpen(false);
    setSelectedUserIndex(null);
  };

  const focusNextSlot = (updatedUsers: BookingUser[]) => {
    const nextIndex = getNextEmptyUserIndex(updatedUsers);
    if (nextIndex !== -1) {
      setSelectedUserIndex(nextIndex);
      setUserManageModalOpen(true);
    } else {
      closeManageModal();
    }
  };

  const handleClearUser = (index: number) => {
    const updatedUsers = [...users];
    updatedUsers[index] = {
      ...updatedUsers[index],
      user_id: `new-${Date.now()}-${index}`,
      name: '',
      email: '',
      phone: '',
      is_new: true,
    };
    setUsers(updatedUsers);
  };

  const getAlreadyAddedUserIds = () => users.filter(u => !u.is_new).map(u => u.user_id);

  useImperativeHandle(ref, () => ({
    handleSubmit,
  }));

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Stack spacing={3}>
        <Typography variant="h6" gutterBottom>
          Add User Details
        </Typography>


        <Stack direction="row" spacing={2} sx={{ maxWidth: 800 }}>
          <DatePicker
            label="Date"
            value={date}
            onChange={setDate}
            slotProps={{
              textField: {
                fullWidth: true,
                required: true,
              }
            }}
          />
          
          <FormControl fullWidth>
            <InputLabel>Time Slot (Optional)</InputLabel>
            <Select
              value={timeSlot}
              label="Time Slot (Optional)"
              onChange={(e) => setTimeSlot(e.target.value)}
              MenuProps={{
                PaperProps: {
                  style: {
                    maxHeight: 300,
                  },
                },
                anchorOrigin: {
                  vertical: 'bottom',
                  horizontal: 'left',
                },
                transformOrigin: {
                  vertical: 'top',
                  horizontal: 'left',
                },
              }}
            >
              <MenuItem value="">
                <em>No specific time slot</em>
              </MenuItem>
              {timeSlots.map((slot) => (
                <MenuItem key={slot.id} value={slot.id}>
                  {slot.start_time} - {slot.end_time} ({slot.day})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>

        <UserManageModal
          open={userManageModalOpen}
          onClose={closeManageModal}
          onSelectUser={handleSelectExistingUser}
          onAddUser={handleAddNewUser}
          alreadyAddedUserIds={getAlreadyAddedUserIds()}
          currentUserIndex={selectedUserIndex ?? undefined}
          currentUserPlan={selectedUserIndex !== null ? getPlanLabel(users[selectedUserIndex]?.plan_id) : ''}
        />

        <Divider sx={{ my: 3 }} />

        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle1" sx={{ mb: 2 }}>
            User Information ({users.length} people)
          </Typography>
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Quick Search
            </Typography>
            <InlineUserSearch
              onSelectUser={handleInlineUserSelect}
              alreadyAddedUserIds={getAlreadyAddedUserIds()}
              currentUserIndex={getNextEmptyUserIndex()}
              disabled={getNextEmptyUserIndex() === -1}
              currentUserPlan={getNextEmptyUserIndex() !== -1 ? getPlanLabel(users[getNextEmptyUserIndex()]?.plan_id) : ''}
            />
          </Box>
        </Box>
        {duplicatePhoneMessage && (
          <Typography variant="body2" color="error" sx={{ mb: 1 }}>
            {duplicatePhoneMessage}
          </Typography>
        )}

        <Stack spacing={2}>
          {users.map((user, index) => (
            <UserCard
              key={user.user_id}
              user={user}
              index={index}
              getPlanLabel={getPlanLabel}
              onManageUser={handleManageUser}
              onClearUser={handleClearUser}
              onUpdateUser={updateUser}
            />
          ))}
        </Stack>

        <Divider />

        <Stack spacing={2}>
          <TextField
            fullWidth
            label="Notes (Optional)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            multiline
            rows={3}
          />

          <TextField
            fullWidth
            sx={{ maxWidth: 400 }}
            label="Discount Code (Optional)"
            value={discountCode}
            onChange={(e) => setDiscountCode(e.target.value)}
            placeholder="Enter discount code"
          />
        </Stack>

      </Stack>
    </LocalizationProvider>
  );
});
