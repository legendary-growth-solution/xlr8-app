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
  IconButton,
  FormControl,
  InputAdornment,
  CircularProgress,
} from '@mui/material';

import { billingApi } from 'src/services/api/billing.api';
import { bookingApi } from 'src/services/api/booking.api';
import { getTimeSlots } from 'src/services/api/timeslots';

import { Iconify } from 'src/components/iconify';
import { showToast } from 'src/components/toast';

import { UserCard } from './UserCard';
import { UserManageModal } from './UserManageModal';
import { InlineUserSearch } from './InlineUserSearch';

import type { PlanCartSelection } from './bookingSummaryUtils';

interface BookingUser {
  user_id: string;
  name: string;
  first_name?: string;
  last_name?: string;
  email: string;
  phone: string;
  country_code?: string;
  full_phone?: string;
  age?: number;
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
  onDiscountChange?: (discount: { code: string; amount: number; type: 'absolute' | 'percentage' | 'percent' } | null) => void;
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
  onDiscountChange,
}, ref) => {
  const [users, setUsers] = useState<BookingUser[]>([]);
  const [date, setDate] = useState<Dayjs | null>(null);
  const [timeSlot, setTimeSlot] = useState('');
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [notes, setNotes] = useState('');
  const [discountCode, setDiscountCode] = useState('');
  const [validatingCode, setValidatingCode] = useState(false);
  const [codeError, setCodeError] = useState<string>('');
  const [codeValidated, setCodeValidated] = useState(false);
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

  useEffect(() => {
    if (timeSlot === 'immediate') {
      setDate(dayjs());
    } else if (timeSlot) {
      const selectedSlot = timeSlots.find((slot) => slot.id === timeSlot);
      if (selectedSlot) {
        const targetDay = selectedSlot.day.toLowerCase();
        const daysOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        const targetDayIndex = daysOfWeek.indexOf(targetDay);
        
        if (targetDayIndex !== -1) {
          const today = dayjs();
          const currentDayIndex = today.day();
          let daysToAdd = targetDayIndex - currentDayIndex;
          
          if (daysToAdd <= 0) {
            daysToAdd += 7;
          }
          
          setDate(today.add(daysToAdd, 'day'));
        }
      }
    }
  }, [timeSlot, timeSlots]);


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

  const validateForm = () => {
    if (!timeSlot) {
      showToast.error('Please select a time slot');
      return false;
    }
    if (!date) {
      showToast.error('Date is required');
      return false;
    }
    return evaluateUserData(true);
  };

  const handleValidateCode = async () => {
    if (!discountCode) {
      setCodeError('Please enter a discount code');
      return;
    }

    try {
      setValidatingCode(true);
      setCodeError('');
      setCodeValidated(false);
      const response = await billingApi.validateDiscountCode(discountCode);

      if (!response.data.valid) {
        setCodeError(response.data.message || 'Invalid or expired discount code');
        showToast.error(response.data.message || 'Invalid or expired discount code');
        setCodeValidated(false);
        if (onDiscountChange) {
          onDiscountChange(null);
        }
        return;
      }

      setCodeValidated(true);
      showToast.success(response.data.message || 'Discount code validated successfully');
      const upperCode = discountCode.toUpperCase();
      setDiscountCode(upperCode);
      
      if (onDiscountChange) {
        onDiscountChange({
          code: upperCode,
          amount: response.data.discount_amount || 0,
          type: response.data.discount_type || 'absolute',
        });
      }
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || 'Error validating code';
      setCodeError(errorMessage);
      showToast.error(errorMessage);
      setCodeValidated(false);
      if (onDiscountChange) {
        onDiscountChange(null);
      }
    } finally {
      setValidatingCode(false);
    }
  };

  useEffect(() => {
    if (onValidityChange) {
      const isUserDataValid = evaluateUserData(false);
      const isDiscountValid = !discountCode || codeValidated;
      const isTimeSlotValid = !!timeSlot && !!date;
      onValidityChange(isUserDataValid && isDiscountValid && isTimeSlotValid);
    }
  }, [evaluateUserData, onValidityChange, discountCode, codeValidated, timeSlot, date]);

  useEffect(() => {
    const trimmedPhones = users.map((user) => user.phone.trim()).filter((phone) => phone.length > 0);
    const hasDuplicates = trimmedPhones.some((phone, index) => trimmedPhones.indexOf(phone) !== index);
    setDuplicatePhoneMessage(hasDuplicates ? 'Phone number already used by another person' : '');
  }, [users]);

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    if (discountCode && !codeValidated) {
      showToast.error('Please validate the discount code before proceeding');
      setCodeError('Please validate the discount code');
      return;
    }
    
    try {
      const isImmediate = timeSlot === 'immediate';
      const selectedSlot = !isImmediate ? timeSlots.find((slot) => slot.id === timeSlot) : null;
      
      const raceTimeDisplay = selectedSlot 
        ? `${selectedSlot.start_time} - ${selectedSlot.end_time}` 
        : '';
      
      const bookingData = {
        date: date?.format('DD-MM-YYYY'),
        time_slot: isImmediate ? '' : timeSlot,
        race_time_display: raceTimeDisplay,
        race_day: selectedSlot?.day || date?.format('dddd') || '',
        users: users.map((user) => ({
          user_id: user.user_id,
          name: user.name,
          first_name: user.first_name,
          last_name: user.last_name,
          email: user.email,
          phone: user.phone,
          country_code: user.country_code,
          full_phone: user.full_phone,
          age: user.age,
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
      const cc = user.country_code || '+91';
      const rawPhone = user.phone || '';
      const fullPhone = user.full_phone || (rawPhone.startsWith('+') ? rawPhone : `${cc}${rawPhone}`);
      updatedUsers[selectedUserIndex] = {
        ...updatedUsers[selectedUserIndex],
        user_id: user.user_id || fullPhone,
        name: user.name,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email || '',
        phone: rawPhone,
        country_code: cc,
        full_phone: fullPhone,
        age: user.age,
        is_new: false,
      };
      setUsers(updatedUsers);
      focusNextSlot(updatedUsers);
    }
  };

  const handleAddNewUser = (user: { name: string; first_name?: string; last_name?: string; phone: string; email?: string; age?: number; country_code?: string; full_phone?: string }) => {
    if (selectedUserIndex !== null) {
      const updatedUsers = [...users];
      const cc = user.country_code || '+91';
      const rawPhone = user.phone;
      const fullPhone = user.full_phone || (rawPhone.startsWith('+') ? rawPhone : `${cc}${rawPhone}`);
      updatedUsers[selectedUserIndex] = {
        ...updatedUsers[selectedUserIndex],
        user_id: `new-${Date.now()}-${selectedUserIndex}`,
        name: user.name,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email || '',
        phone: rawPhone,
        country_code: cc,
        full_phone: fullPhone,
        age: user.age,
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
      const cc = user.country_code || '+91';
      const rawPhone = user.phone || '';
      const fullPhone = user.full_phone || (rawPhone.startsWith('+') ? rawPhone : `${cc}${rawPhone}`);
      updatedUsers[nextIndex] = {
        ...updatedUsers[nextIndex],
        user_id: user.user_id || fullPhone,
        name: user.name,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email || '',
        phone: rawPhone,
        country_code: cc,
        full_phone: fullPhone,
        age: user.age,
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
          <FormControl fullWidth>
            <InputLabel>Time Slot *</InputLabel>
            <Select
              value={timeSlot}
              label="Time Slot *"
              onChange={(e) => setTimeSlot(e.target.value)}
              required
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
              <MenuItem value="immediate">
                Immediate (Today)
              </MenuItem>
              {timeSlots.map((slot) => (
                <MenuItem key={slot.id} value={slot.id}>
                  {slot.start_time} - {slot.end_time} ({slot.day})
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <DatePicker
            label="Race Date"
            value={date}
            onChange={() => {}}
            disabled
            slotProps={{
              textField: {
                fullWidth: true,
                required: true,
              }
            }}
          />
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
            sx={{ maxWidth: 400 }}
            label="Discount Code (Optional)"
            value={discountCode}
            onChange={(e) => {
              setDiscountCode(e.target.value);
              setCodeError('');
              setCodeValidated(false);
              if (onDiscountChange) {
                onDiscountChange(null);
              }
            }}
            placeholder="Enter discount code"
            error={!!codeError}
            helperText={codeError || (codeValidated ? 'Discount code validated successfully' : '')}
            FormHelperTextProps={{
              sx: {
                color: codeValidated ? 'success.main' : 'error.main',
              },
            }}
            InputProps={{
              endAdornment: discountCode ? (
                <InputAdornment position="end">
                  <IconButton
                    onClick={handleValidateCode}
                    disabled={validatingCode || !discountCode}
                    edge="end"
                    color={codeValidated ? 'success' : 'primary'}
                  >
                    {validatingCode ? (
                      <CircularProgress size={24} />
                    ) : (
                      <Iconify 
                        icon={codeValidated ? 'eva:checkmark-circle-2-fill' : 'eva:checkmark-circle-2-outline'} 
                      />
                    )}
                  </IconButton>
                </InputAdornment>
              ) : null,
            }}
          />
        </Stack>

      </Stack>
    </LocalizationProvider>
  );
});
