import { useEffect, useState } from 'react';

import { Helmet } from 'react-helmet-async';

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

import { Iconify } from 'src/components/iconify';

import CopyModeSection from 'src/components/timslot/CopyModeSection';
import CopySlotsDialog from 'src/components/timslot/CopySlotsDialog';
import DeleteConfirmation from 'src/components/timslot/DeleteConfirmation';
import TimeSlotForm from 'src/components/timslot/TimeSlotForm';

import { createTimeSlot, deleteTimeSlot, getTimeSlotsForDay } from 'src/services/api/timeslots';
import type { TimeSlot } from 'src/types/bookings';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function TimeSlotsPage() {
  const [selectedDay, setSelectedDay] = useState(0);
  const [openForm, setOpenForm] = useState(false);
  const [editingSlot, setEditingSlot] = useState<TimeSlot | null>(null);
  const [deleteSlot, setDeleteSlot] = useState<TimeSlot | null>(null);
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(true);

  const [copyMode, setCopyMode] = useState(false);
  const [copyDialogOpen, setCopyDialogOpen] = useState(false);
  const [copySourceDay, setCopySourceDay] = useState('');
  const [copiedSlots, setCopiedSlots] = useState<TimeSlot[]>([]);
  const [editingCopiedSlot, setEditingCopiedSlot] = useState<TimeSlot | null>(null);

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

  const handleCopySlots = async (sourceDay: string) => {
    try {
      const sourceSlots = await getTimeSlotsForDay(sourceDay.toLowerCase());
      const copiedSlotsData = sourceSlots.map(slot => ({
        ...slot,
        id: '',
        day: DAYS[selectedDay].toLowerCase(),
      }));

      setCopySourceDay(sourceDay);
      setCopiedSlots(copiedSlotsData);
      setCopyMode(true);
    } catch (error) {
      console.error('Error copying time slots:', error);
    }
  };

  const handleCancelCopy = () => {
    setCopyMode(false);
    setCopiedSlots([]);
    setCopySourceDay('');
    setEditingCopiedSlot(null);
  };

  const handleEditCopiedSlot = (slot: TimeSlot) => {
    setEditingCopiedSlot(slot);
    setOpenForm(true);
  };

  const handleRemoveCopiedSlot = (index: number) => {
    setCopiedSlots(prev => prev.filter((_, i) => i !== index));
  };

  const handleAddCopiedSlot = () => {
    setEditingCopiedSlot(null);
    setOpenForm(true);
  };

  const handleSaveCopiedSlots = async () => {
    try {
      await Promise.all(
        copiedSlots.map(slot =>
          createTimeSlot({
            day: slot.day,
            start_time: slot.start_time,
            end_time: slot.end_time,
            l1_max_slots: slot.l1_max_slots,
            l2_max_slots: slot.l2_max_slots,
            l3_max_slots: slot.l3_max_slots,
          })
        )
      );

      setCopyMode(false);
      setCopiedSlots([]);
      setCopySourceDay('');
      fetchTimeSlots();
    } catch (error) {
      console.error('Error saving copied time slots:', error);
    }
  };

  const handleFormSubmit = (data: Omit<TimeSlot, 'id'>) => {
    if (copyMode && editingCopiedSlot) {
      setCopiedSlots(prev =>
        prev.map(slot =>
          slot === editingCopiedSlot ? { ...data, id: '' } : slot
        )
      );
    } else if (copyMode) {
      setCopiedSlots(prev => [...prev, { ...data, id: '' }]);
    }
  };

  const handleFormClose = () => {
    setOpenForm(false);
    setEditingSlot(null);
    setEditingCopiedSlot(null);
    if (!copyMode) {
      fetchTimeSlots();
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
          <Stack direction="row" spacing={2}>
            <Button
              variant="outlined"
              startIcon={<Iconify icon="eva:copy-fill" />}
              onClick={() => setCopyDialogOpen(true)}
              disabled={copyMode}
            >
              Copy Slots
            </Button>
            <Button
              variant="contained"
              startIcon={<Iconify icon="eva:plus-fill" />}
              onClick={handleAdd}
              disabled={copyMode}
            >
              Add Slot
            </Button>
          </Stack>
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

          {copyMode && (
            <CopyModeSection
              copySourceDay={copySourceDay}
              copiedSlots={copiedSlots}
              onEditSlot={handleEditCopiedSlot}
              onRemoveSlot={handleRemoveCopiedSlot}
              onAddSlot={handleAddCopiedSlot}
              onSaveSlots={handleSaveCopiedSlots}
              onCancelCopy={handleCancelCopy}
            />
          )}

          <Box sx={{ p: 3 }}>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress />
              </Box>
            ) : slots.length === 0 && !copyMode ? (
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
                      {slot.start_time} - {slot.end_time} (L1 : {slot.l1_max_slots}, L2 : {slot.l2_max_slots}, L3 : {slot.l3_max_slots} slots)
                    </Typography>
                    <Stack direction="row" spacing={1}>
                      <IconButton onClick={() => handleEdit(slot)} size="small" disabled={copyMode}>
                        <Iconify icon="eva:edit-fill" />
                      </IconButton>
                      <IconButton
                        onClick={() => setDeleteSlot(slot)}
                        size="small"
                        color="error"
                        disabled={copyMode}
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
          slot={editingSlot || editingCopiedSlot}
          day={DAYS[selectedDay]}
          onCustomSubmit={copyMode ? handleFormSubmit : undefined}
        />

        <DeleteConfirmation
          open={Boolean(deleteSlot)}
          onClose={() => setDeleteSlot(null)}
          onConfirm={handleDeleteConfirm}
        />

        <CopySlotsDialog
          open={copyDialogOpen}
          onClose={() => setCopyDialogOpen(false)}
          onCopy={handleCopySlots}
          currentDay={DAYS[selectedDay]}
          days={DAYS}
        />
      </Box>
    </>
  );
}