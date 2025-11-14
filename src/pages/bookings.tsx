import type { Plan } from 'src/types/session';
import type { Booking } from 'src/types/booking';
import type { TimeSlot } from 'src/types/bookings';

import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect, useCallback } from 'react';

import { LoadingButton } from '@mui/lab';
import {
  Box,
  Card,
  Fade,
  Grow,
  Chip,
  Stack,
  Table,
  alpha,
  Button,
  Dialog,
  Divider,
  TableRow,
  Skeleton,
  Checkbox,
  Container,
  TableBody,
  TableCell,
  TableHead,
  IconButton,
  Typography,
  DialogTitle,
  DialogActions,
  DialogContent,
  TableContainer,
  TablePagination,
} from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { fDateTime } from 'src/utils/format-time';

import { api } from 'src/api/api';
import { bookingApi } from 'src/services/api/booking.api';
import { getTimeSlots } from 'src/services/api/timeslots';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import Toast, { showToast } from 'src/components/toast';
import ConversionAnimation from 'src/components/animations/ConversionAnimation';
import { NewBookingDialog, BulkCreateSessionDialog } from 'src/components/booking';

const TABLE_HEAD = [
  { id: 'select', label: '', width: 50 },
  { id: 'date', label: 'Date', width: 150 },
  { id: 'time_slot', label: 'Time Slot', width: 150 },
  { id: 'users', label: 'Users', width: 250 },
  { id: 'total', label: 'Total', width: 120 },
  { id: 'discount', label: 'Discount', width: 100 },
  { id: 'status', label: 'Status', width: 100 },
  { id: 'notes', label: 'Notes', width: 200 },
  { id: 'created_at', label: 'Created At', width: 150 },
  { id: 'actions', label: 'Actions', width: 100 },
];

const CONVERSION_STEPS = [
  'Preparing data', 
  'Creating users', 
  'Starting session', 
  'Creating groups', 
  'Assigning plans',
  'Finalizing'
];

export default function BookingsPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const convertLoading = useBoolean(false);
  const convertDialog = useBoolean(false);
  const conversionProgress = useBoolean(false);
  
  const [activeStep, setActiveStep] = useState(0);
  const conversionComplete = useBoolean(false);
  const [conversionError, setConversionError] = useState<string | null>(null);
  const [animationState, setAnimationState] = useState<'initial' | 'processing' | 'complete'>('initial');
  
  const [plans, setPlans] = useState<Plan[]>([]);
  const [newBookingDialog, setNewBookingDialog] = useState(false);
  const [isConversionAllowed, setIsConversionAllowed] = useState(false);
  const [allTimeSlots, setAllTimeSlots] = useState<TimeSlot[]>([]);
  const [deleteBookingId, setDeleteBookingId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [selectedBookings, setSelectedBookings] = useState<string[]>([]);
  const [bulkCreateLoading, setBulkCreateLoading] = useState(false);
  const bulkCreateDialog = useBoolean(false);

  const getBookings = useCallback(async () => {
    try {
      setLoading(true);
      const response = await bookingApi.list({
        page: page + 1,
        pageSize: rowsPerPage,
      });
      setBookings(response.bookings);
      setTotalCount(response.totalCount);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      showToast.error('Failed to fetch bookings');
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage]);

  const checkActiveSession = async () => {
    try {
      const data = await api.session.getActiveSession();
      setIsConversionAllowed(!data.isActive);
      return data.isActive;
    } catch (error) {
      console.error('Error checking active session:', error);
      setIsConversionAllowed(true);
      return false;
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      await getBookings();
      await checkActiveSession();
    };
    fetchData();

    const fetchPlans = async () => {
      try {
        const data = await api.plan.getPlans();
        setPlans(data.plans || []);
      } catch (error) {
        console.error('Error fetching plans:', error);
        showToast.error('Failed to fetch plans');
      }
    };

    const fetchTimeSlots = async () => {
      try {
        const timeSlots = await getTimeSlots();
        setAllTimeSlots(timeSlots);
      } catch (error) {
        console.error('Error fetching time slots:', error);
      }
    };

    fetchPlans();
    fetchTimeSlots();

    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key === 'b') {
        event.preventDefault();
        setNewBookingDialog(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [getBookings]);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const advanceConversionStep = () => {
    if (activeStep < CONVERSION_STEPS.length - 1) {
      setTimeout(() => {
        setActiveStep((prev) => prev + 1);
      }, 700 + Math.random() * 500); 
    }
  };

  const resetConversionStates = () => {
    setActiveStep(0);
    conversionComplete.onFalse();
    setConversionError(null);
    conversionProgress.onFalse();
    setAnimationState('initial');
  };

  const handleConvertBooking = async () => {
    if (!selectedBooking) return;
    
    const isActive = await checkActiveSession();
    if (isActive) {
      showToast.error('Conversion is not allowed while a session is active');
      return;
    }

    try {
      resetConversionStates();
      convertLoading.onTrue();
      conversionProgress.onTrue();
      setAnimationState('processing');
      
      const stepInterval = setInterval(() => {
        advanceConversionStep();
      }, 800);
      
      const response : any = await bookingApi.convert(selectedBooking.booking_id);
      
      clearInterval(stepInterval);
      
      if (response.success) {
        setActiveStep(CONVERSION_STEPS.length - 1);
        
        setTimeout(() => {
          setAnimationState('complete');
          conversionComplete.onTrue();
          showToast.success('Booking converted to session successfully');
          getBookings();
          
          setTimeout(() => {
            navigate('/active-session');
          }, 1500);
        }, 800);
      } else {
        setConversionError('Failed to convert booking to session');
        showToast.error('Failed to convert booking to session');
      }
    } catch (error) {
      setConversionError(error?.response?.data?.message || error?.response?.data?.error || 'Failed to convert booking to session');
      showToast.error(error?.response?.data?.message || error?.response?.data?.error || 'Failed to convert booking to session');
    } finally {
      convertLoading.onFalse();
      
      if (conversionError) {
        setTimeout(() => {
          convertDialog.onFalse();
          resetConversionStates();
        }, 3000);
      } else {
        setTimeout(() => {
          convertDialog.onFalse();
          resetConversionStates();
        }, 1500);
      }
    }
  };

  const openConvertDialog = (booking: Booking) => {
    setSelectedBooking(booking);
    resetConversionStates();
    convertDialog.onTrue();
  };

  const handleDeleteBooking = async () => {
    if (!deleteBookingId) return;

    const bookingToDelete = bookings.find(b => b.booking_id === deleteBookingId);
    if (!bookingToDelete) return;

    setBookings(prev => prev.filter(b => b.booking_id !== deleteBookingId));
    setTotalCount(prev => prev - 1);
    setDeleteBookingId(null);
    setDeleteLoading(true);

    try {
      await bookingApi.delete(deleteBookingId);
      showToast.success('Booking deleted successfully');
    } catch (error) {
      console.error('Error deleting booking:', error);
      showToast.error('Failed to delete booking');
      setBookings(prev => [...prev, bookingToDelete].sort((a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      ));
      setTotalCount(prev => prev + 1);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleBulkCreateSessions = async () => {
    if (selectedBookings.length === 0) return;

    const isActive = await checkActiveSession();
    if (isActive) {
      showToast.error('Cannot create sessions while another session is active');
      return;
    }

    try {
      setBulkCreateLoading(true);

      const response = await bookingApi.bulkConvert(selectedBookings);

      if (response.success) {
        showToast.success(`${selectedBookings.length} group${selectedBookings.length > 1 ? 's' : ''} created in new session successfully`);
        setSelectedBookings([]);
        bulkCreateDialog.onFalse();
        getBookings();

        setTimeout(() => {
          navigate('/active-session');
        }, 1500);
      } else {
        throw new Error(response.message || 'Failed to create session');
      }

    } catch (error) {
      console.error('Error creating sessions:', error);
      showToast.error(error?.response?.data?.message || error?.response?.data?.error || 'Failed to create session');
    } finally {
      setBulkCreateLoading(false);
      bulkCreateDialog.onFalse();
    }
  };

  const handleSelectBooking = (bookingId: string, checked: boolean) => {
    if (checked) {
      setSelectedBookings(prev => [...prev, bookingId]);
    } else {
      setSelectedBookings(prev => prev.filter(id => id !== bookingId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const pendingBookings = bookings.filter(booking => !booking.is_completed);
      setSelectedBookings(pendingBookings.map(booking => booking.booking_id));
    } else {
      setSelectedBookings([]);
    }
  };

  const getTimeSlotDisplay = (timeSlotId: string | null | undefined): string => {
    if (!timeSlotId || !allTimeSlots.length) {
      return 'Immediate';
    }

    const timeSlot = allTimeSlots.find(slot => slot.id === timeSlotId);
    if (!timeSlot) {
      return 'Immediate';
    }

    return `${timeSlot.start_time} - ${timeSlot.end_time}`;
  };

  const renderBookingRow = (booking: Booking) => {
    const { booking_id, date, time_slot, users, status, created_at, notes, discount_code, total } = booking;
    const isPending = !booking.is_completed;

    return (
      <TableRow key={booking_id} hover>
        <TableCell padding="checkbox">
          <Checkbox
            checked={selectedBookings.includes(booking_id)}
            onChange={(e) => handleSelectBooking(booking_id, e.target.checked)}
            disabled={!isPending || !isConversionAllowed}
          />
        </TableCell>
        <TableCell>
          {date}
        </TableCell>

        <TableCell>{getTimeSlotDisplay(time_slot)}</TableCell>
        
        <TableCell>
          <Stack spacing={1}>
            {users.map((user) => (
              <Typography key={user.user_id} variant="body2" noWrap>
                {user.name}
              </Typography>
            ))}
            <Typography variant="caption" color="text.secondary">
              {users.length} user{users.length !== 1 ? 's' : ''}
            </Typography>
          </Stack>
        </TableCell>

        <TableCell>
          <Typography variant="body2" fontWeight="medium">
            {total !== undefined && total !== null ? `₹${total.toFixed(2)}` : '-'}
          </Typography>
        </TableCell>

        <TableCell>
          {discount_code ? (
            <Chip label={discount_code} color="primary" size="small" />
          ) : (
            <Typography variant="body2" color="text.secondary">-</Typography>
          )}
        </TableCell>
        
        <TableCell>
          <Typography
            variant="subtitle2"
            sx={{
              color: 
                status === 'completed' || booking.is_completed
                  ? 'success.main'
                  : status === 'cancelled'
                  ? 'error.main'
                  : status === 'confirmed'
                  ? 'info.main'
                  : 'warning.main',
            }}
          >
            {status === 'completed' || booking.is_completed
              ? 'Completed'
              : status === 'cancelled'
              ? 'Cancelled'
              : status === 'confirmed'
              ? 'Confirmed'
              : 'Pending'}
          </Typography>
        </TableCell>
        
        <TableCell>
          {notes ? (
            <Typography 
              variant="body2" 
              noWrap
              sx={{ 
                maxWidth: 180,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                '&:hover': {
                  overflow: 'visible',
                  whiteSpace: 'normal',
                  wordBreak: 'break-word',
                }
              }}
            >
              {notes}
            </Typography>
          ) : (
            <Typography variant="body2" color="text.secondary">-</Typography>
          )}
        </TableCell>
        
        <TableCell>{fDateTime(created_at)}</TableCell>
        
        <TableCell align="center">
          <Stack direction="row" spacing={1} justifyContent="center">
            <Button
              variant="contained"
              color="primary"
              size="small"
              onClick={() => openConvertDialog(booking)}
              disabled={!isPending || !isConversionAllowed}
            >
              Convert
            </Button>
            <IconButton
              color="error"
              size="small"
              onClick={() => setDeleteBookingId(booking_id)}
              disabled={booking.is_completed}
            >
              <Iconify icon="eva:trash-2-outline" />
            </IconButton>
          </Stack>
        </TableCell>
      </TableRow>
    );
  };

  return (
    <>
      <Helmet>
        <title>Bookings | XLR8</title>
      </Helmet>

      <Container maxWidth={false}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
          <Typography variant="h4">Bookings</Typography>
          <Stack direction="row" spacing={2}>
            {selectedBookings.length > 0 && (
              <Button
                variant="contained"
                color="success"
                onClick={bulkCreateDialog.onTrue}
                startIcon={<Iconify icon="eva:play-circle-fill" />}
              >
                Create Session ({selectedBookings.length} groups)
              </Button>
            )}
            <Button
              variant="contained"
              color="primary"
              onClick={() => setNewBookingDialog(true)}
              startIcon={<Iconify icon="eva:plus-fill" />}
            >
              Create Booking
              <Typography variant="caption" sx={{ ml: 1, opacity: 0.72 }}>
              (⌘B/Ctrl+B)
            </Typography>
            </Button>
            <Button
              variant="outlined"
              startIcon={<Iconify icon="eva:calendar-fill" />}
              onClick={() => navigate('/timeslots')}
            >
              Manage Time Slots
            </Button>
          </Stack>
        </Stack>

        <Card>
          <TableContainer sx={{ position: 'relative', overflow: 'unset' }}>
            <Scrollbar>
              <Table size="medium" sx={{ minWidth: 960 }}>
                <TableHead>
                  <TableRow>
                    {TABLE_HEAD.map((column) => (
                      <TableCell key={column.id} width={column.width || 'auto'}>
                        {column.id === 'select' ? (
                          <Checkbox
                            indeterminate={
                              selectedBookings.length > 0 &&
                              selectedBookings.length < bookings.filter(b => !b.is_completed).length
                            }
                            checked={
                              bookings.filter(b => !b.is_completed).length > 0 &&
                              selectedBookings.length === bookings.filter(b => !b.is_completed).length
                            }
                            onChange={(e) => handleSelectAll(e.target.checked)}
                            disabled={!isConversionAllowed}
                          />
                        ) : (
                          column.label
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>

                <TableBody>
                  {loading ? (
                       <TableRow>
                         {TABLE_HEAD.map((column) => (
                           <TableCell key={column.id} sx={{ py: 3, textAlign: 'center' }}>
                             {column.id === 'select' ? (
                               <Skeleton variant="rectangular" width={24} height={24} />
                             ) : (
                               <Skeleton variant="text" width={column.width - (column.id === 'total' ? 50 : 100) || 'auto'} />
                             )}
                           </TableCell>
                         ))}
                       </TableRow>
                  ) : bookings.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={10} sx={{ py: 3, textAlign: 'center' }}>
                        <Typography variant="body2">No bookings found</Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    bookings.map((booking) => renderBookingRow(booking))
                  )}
                </TableBody>
              </Table>
            </Scrollbar>
          </TableContainer>

          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={totalCount}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Card>
      </Container>

      <Dialog
        open={convertDialog.value}
        onClose={() => {
          if (!conversionProgress.value) {
            convertDialog.onFalse();
            resetConversionStates();
          }
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {conversionProgress.value
            ? conversionComplete.value
              ? 'Booking Converted Successfully!'
              : 'Converting Booking to Session...'
            : 'Convert Booking to Session'}

          {!conversionProgress.value && (
            <IconButton
              aria-label="close"
              onClick={convertDialog.onFalse}
              sx={{
                position: 'absolute',
                right: 8,
                top: 8,
              }}
            >
              <Iconify icon="eva:close-fill" />
            </IconButton>
          )}
        </DialogTitle>

        <DialogContent>
          {conversionProgress.value ? (
            <Stack spacing={3} sx={{ pt: 2, pb: 2 }}>
              <ConversionAnimation state={animationState} />

              <Divider />

              {conversionComplete.value && (
                <Grow in={conversionComplete.value} timeout={800}>
                  <Box
                    sx={{
                      textAlign: 'center',
                      py: 2,
                      backgroundColor: (theme) => alpha(theme.palette.success.main, 0.1),
                      borderRadius: 1,
                    }}
                  >
                    <Iconify
                      icon="eva:checkmark-circle-2-fill"
                      width={60}
                      height={60}
                      sx={{ color: 'success.main', mb: 1 }}
                    />
                    <Typography variant="h6" color="success.main">
                      Session Created Successfully!
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      Redirecting to active session...
                    </Typography>
                  </Box>
                </Grow>
              )}

              {conversionError && (
                <Fade in={!!conversionError}>
                  <Box
                    sx={{
                      textAlign: 'center',
                      py: 2,
                      backgroundColor: (theme) => alpha(theme.palette.error.main, 0.1),
                      borderRadius: 1,
                    }}
                  >
                    <Iconify
                      icon="eva:alert-triangle-fill"
                      width={60}
                      height={60}
                      sx={{ color: 'error.main', mb: 1 }}
                    />
                    <Typography variant="h6" color="error.main">
                      Conversion Failed
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      {conversionError}
                    </Typography>
                  </Box>
                </Fade>
              )}
            </Stack>
          ) : (
            <Box sx={{ pt: 2 }}>
              <Typography variant="body1" sx={{ mb: 2 }}>
                Are you sure you want to convert this booking to an active session?
              </Typography>

              <Box
                sx={{
                  bgcolor: 'action.hover',
                  p: 2,
                  borderRadius: 1,
                  mb: 2,
                }}
              >
                <Typography variant="subtitle2" gutterBottom>
                  Booking Details:
                </Typography>

                {selectedBooking && (
                  <Stack spacing={1}>
                    <Typography variant="body2">
                      <strong>Date:</strong> {selectedBooking.date || 'N/A'}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Time Slot:</strong> {getTimeSlotDisplay(selectedBooking.time_slot)}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Users:</strong> {selectedBooking.users.length}
                    </Typography>
                    {selectedBooking.total !== undefined && selectedBooking.total !== null && (
                      <Typography variant="body2">
                        <strong>Total:</strong> ₹{selectedBooking.total.toFixed(2)}
                      </Typography>
                    )}
                    {selectedBooking.discount_code && (
                      <Typography variant="body2">
                        <strong>Discount:</strong> {selectedBooking.discount_code}
                      </Typography>
                    )}
                    {selectedBooking.notes && (
                      <Typography variant="body2">
                        <strong>Notes:</strong> {selectedBooking.notes}
                      </Typography>
                    )}
                  </Stack>
                )}
              </Box>

              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 'bold', mb: 1 }}>
                This action will:
              </Typography>

              <Box sx={{ pl: 2, mb: 2 }}>
                <Stack spacing={0.5}>
                  <Typography variant="body2">• Create users if they don&apos;t exist</Typography>
                  <Typography variant="body2">• Start a new session</Typography>
                  <Typography variant="body2">• Create a group with all booking users</Typography>
                  <Typography variant="body2">• Assign selected plans to users</Typography>
                </Stack>
              </Box>

              <ConversionAnimation state="initial" />
            </Box>
          )}
        </DialogContent>

        {!conversionProgress.value && (
          <DialogActions>
            <Button onClick={convertDialog.onFalse} color="inherit">
              Cancel
            </Button>
            <LoadingButton
              variant="contained"
              loading={convertLoading.value}
              onClick={handleConvertBooking}
            >
              Convert to Session
            </LoadingButton>
          </DialogActions>
        )}
      </Dialog>

      <Dialog
        open={!!deleteBookingId}
        onClose={() => setDeleteBookingId(null)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Delete Booking</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this booking? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteBookingId(null)} color="inherit">
            Cancel
          </Button>
          <LoadingButton
            onClick={handleDeleteBooking}
            color="error"
            variant="contained"
            loading={deleteLoading}
          >
            Delete
          </LoadingButton>
        </DialogActions>
      </Dialog>

      <NewBookingDialog
        open={newBookingDialog}
        onClose={() => setNewBookingDialog(false)}
        onSubmitSuccess={getBookings}
        plans={plans}
      />

      <BulkCreateSessionDialog
        open={bulkCreateDialog.value}
        onClose={bulkCreateDialog.onFalse}
        selectedBookingsCount={selectedBookings.length}
        onConfirm={handleBulkCreateSessions}
        loading={bulkCreateLoading}
      />

      <Toast />
    </>
  );
} 