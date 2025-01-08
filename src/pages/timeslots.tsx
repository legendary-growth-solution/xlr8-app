import {
    Alert,
    Box,
    Button,
    Card,
    CircularProgress,
    IconButton,
    Stack,
    Tab,
    Tabs,
    Typography
} from '@mui/material';
import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Iconify } from 'src/components/iconify';
import DeleteConfirmation from 'src/components/timslot/DeleteConfirmation';
import TimeSlotForm from 'src/components/timslot/TimeSlotForm';
import { deleteTimeSlot, getTimeSlotsForDay } from 'src/services/api/timeslots';
import { TimeSlot } from 'src/types/bookings';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function TimeSlotsPage() {
  const [selectedDay, setSelectedDay] = useState(0);
  const [openForm, setOpenForm] = useState(false);
  const [editingSlot, setEditingSlot] = useState<TimeSlot | null>(null);
  const [deleteSlot, setDeleteSlot] = useState<TimeSlot | null>(null);
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(true);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setSelectedDay(newValue);
  };

  const handleEdit = (slot: TimeSlot) => {
    setEditingSlot(slot);
    setOpenForm(true);
  };

  const handleAdd = () => {
    setEditingSlot(null);
    setOpenForm(true);
  };

  const handleFormClose = () => {
    setOpenForm(false);
    setEditingSlot(null);
    fetchTimeSlots(); // Refresh data after form closes
  };

  const handleDeleteConfirm = async () => {
    if (deleteSlot) {
      try {
        await deleteTimeSlot(deleteSlot.id);
        setDeleteSlot(null);
        fetchTimeSlots(); // Refresh data after deletion
      } catch (error) {
        console.error('Error deleting time slot:', error);
      }
    }
  };

  const fetchTimeSlots = async () => {
    setLoading(true);
    try {
      const data = await getTimeSlotsForDay(DAYS[selectedDay].toLowerCase());
      setSlots(data);
    } catch (error) {
      console.error('Error fetching time slots:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTimeSlots();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDay]);

  return (
    <>
      <Helmet>
        <title>Time Slots | Management</title>
      </Helmet>

      <Box sx={{ p: 3 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
          <Typography variant="h4">Time Slots</Typography>
          <Button
            variant="contained"
            startIcon={<Iconify icon="eva:plus-fill" />}
            onClick={handleAdd}
          >
            Add Slot
          </Button>
        </Stack>

        <Card>
          <Tabs
            value={selectedDay}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
          >
            {DAYS.map((day) => (
              <Tab key={day} label={day} />
            ))}
          </Tabs>

          <Box sx={{ p: 3 }}>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress />
              </Box>
            ) : slots.length === 0 ? (
              <Alert severity="info" sx={{ mb: 3 }}>
                No time slots found for {DAYS[selectedDay]}. Click <b>Add Slot</b> to create one.
              </Alert>
            ) : (
              slots
                .filter((slot) => slot.day.toLowerCase() === DAYS[selectedDay].toLowerCase())
                .map((slot) => (
                  <Box
                    key={slot.id}
                    sx={{
                      py: 2,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      borderBottom: '1px solid',
                      borderColor: 'divider',
                    }}
                  >
                    <Typography>
                      {slot.start_time} - {slot.end_time} ({slot.max_slots} slots)
                    </Typography>
                    <Stack direction="row" spacing={1}>
                      <IconButton onClick={() => handleEdit(slot)} size="small">
                        <Iconify icon="eva:edit-fill" />
                      </IconButton>
                      <IconButton
                        onClick={() => setDeleteSlot(slot)}
                        size="small"
                        color="error"
                      >
                        <Iconify icon="eva:trash-2-fill" />
                      </IconButton>
                    </Stack>
                  </Box>
                ))
            )}
          </Box>
        </Card>

        <TimeSlotForm
          open={openForm}
          onClose={handleFormClose}
          slot={editingSlot}
          day={DAYS[selectedDay]}
        />

        <DeleteConfirmation
          open={Boolean(deleteSlot)}
          onClose={() => setDeleteSlot(null)}
          onConfirm={handleDeleteConfirm}
        />
      </Box>
    </>
  );
}