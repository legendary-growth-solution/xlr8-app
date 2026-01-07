import { useEffect, useState } from 'react';

import { Helmet } from 'react-helmet-async';

import {
  Alert,
  Box,
  Button,
  Card,
  Chip,
  CircularProgress,
  IconButton,
  Stack,
  Switch,
  Tab,
  Tabs,
  Tooltip,
  Typography
} from '@mui/material';

import { Iconify } from 'src/components/iconify';

import BulkReleaseDialog from 'src/components/timslot/BulkReleaseDialog';
import CopyModeSection from 'src/components/timslot/CopyModeSection';
import CopySlotsDialog from 'src/components/timslot/CopySlotsDialog';
import DeleteConfirmation from 'src/components/timslot/DeleteConfirmation';
import ReleaseSlotDialog from 'src/components/timslot/ReleaseSlotDialog';
import TimeSlotForm from 'src/components/timslot/TimeSlotForm';

import { createTimeSlot, deleteTimeSlot, getTimeSlotsForDay, releaseTimeSlot, releaseTimeSlotsForDay, toggleTimeSlotActive } from 'src/services/api/timeslots';
import type { TimeSlot } from 'src/types/bookings';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const isSlotOccupiedInComingWeek = (lastBookedFor?: string): boolean => {
  if (!lastBookedFor) return false;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const bookedDate = new Date(lastBookedFor);
  bookedDate.setHours(0, 0, 0, 0);
  
  const weekFromNow = new Date(today);
  weekFromNow.setDate(weekFromNow.getDate() + 7);
  
  return bookedDate >= today && bookedDate <= weekFromNow;
};

const hasOccupiedSlots = (slots: TimeSlot[]): boolean =>
  slots.some(slot => isSlotOccupiedInComingWeek(slot.last_booked_for));

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

  const [releaseSlot, setReleaseSlot] = useState<TimeSlot | null>(null);
  const [bulkReleaseDialogOpen, setBulkReleaseDialogOpen] = useState(false);
  const [releasing, setReleasing] = useState(false);
  const [togglingSlotId, setTogglingSlotId] = useState<string | null>(null);

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
        fetchTimeSlots();
      } catch (error) {
        console.error('Error deleting time slot:', error);
      }
    }
  };

  const handleReleaseConfirm = async () => {
    if (releaseSlot) {
      setReleasing(true);
      try {
        await releaseTimeSlot(releaseSlot.id);
        setReleaseSlot(null);
        fetchTimeSlots();
      } catch (error) {
        console.error('Error releasing time slot:', error);
      } finally {
        setReleasing(false);
      }
    }
  };

  const handleBulkReleaseConfirm = async () => {
    setReleasing(true);
    try {
      await releaseTimeSlotsForDay(DAYS[selectedDay]);
      setBulkReleaseDialogOpen(false);
      fetchTimeSlots();
    } catch (error) {
      console.error('Error releasing time slots:', error);
    } finally {
      setReleasing(false);
    }
  };

  const handleToggleActive = async (slot: TimeSlot) => {
    setTogglingSlotId(slot.id);
    try {
      await toggleTimeSlotActive(slot.id);
      fetchTimeSlots();
    } catch (error) {
      console.error('Error toggling time slot:', error);
    } finally {
      setTogglingSlotId(null);
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

  const filteredSlots = slots.filter((slot) => slot.day.toLowerCase() === DAYS[selectedDay].toLowerCase());

  return (
    <>
      <Helmet>
        <title>Time Slots | Management</title>
      </Helmet>

      <Box sx={{ p: 3 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
          <Typography variant="h4">Time Slots</Typography>
          <Stack direction="row" spacing={2}>
            {hasOccupiedSlots(filteredSlots) && (
              <Button
                variant="outlined"
                color="warning"
                startIcon={<Iconify icon="eva:unlock-fill" />}
                onClick={() => setBulkReleaseDialogOpen(true)}
                disabled={copyMode}
              >
                Release All
              </Button>
            )}
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
              filteredSlots.map((slot) => {
                const isOccupied = isSlotOccupiedInComingWeek(slot.last_booked_for);
                return (
                  <Box
                    key={slot.id}
                    sx={{
                      py: 2,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      borderBottom: '1px solid',
                      borderColor: 'divider',
                      opacity: slot.is_active === false ? 0.5 : 1,
                    }}
                  >
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Typography>
                        {slot.start_time} - {slot.end_time} (L1 : {slot.l1_max_slots}, L2 : {slot.l2_max_slots}, L3 : {slot.l3_max_slots} slots)
                      </Typography>
                      {isOccupied && (
                        <Chip
                          label={`Booked: ${slot.last_booked_for}`}
                          size="small"
                          color="warning"
                          variant="outlined"
                        />
                      )}
                      {slot.is_active === false && (
                        <Chip
                          label="Disabled"
                          size="small"
                          color="error"
                          variant="filled"
                        />
                      )}
                    </Stack>
                    <Stack direction="row" spacing={1}>
                      {isOccupied && (
                        <Tooltip title="Release slot">
                          <IconButton
                            onClick={() => setReleaseSlot(slot)}
                            size="small"
                            color="warning"
                            disabled={copyMode}
                          >
                            <Iconify icon="eva:unlock-fill" />
                          </IconButton>
                        </Tooltip>
                      )}
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
                      <Tooltip title={slot.is_active === false ? 'Enable slot' : 'Disable slot'}>
                        <Switch
                          size="small"
                          checked={slot.is_active !== false}
                          onChange={() => handleToggleActive(slot)}
                          disabled={copyMode || togglingSlotId === slot.id}
                        />
                      </Tooltip>
                    </Stack>
                  </Box>
                );
              })
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

        <ReleaseSlotDialog
          open={Boolean(releaseSlot)}
          onClose={() => setReleaseSlot(null)}
          onConfirm={handleReleaseConfirm}
          slot={releaseSlot}
          releasing={releasing}
        />

        <BulkReleaseDialog
          open={bulkReleaseDialogOpen}
          onClose={() => setBulkReleaseDialogOpen(false)}
          onConfirm={handleBulkReleaseConfirm}
          day={DAYS[selectedDay]}
          slots={filteredSlots}
          releasing={releasing}
        />
      </Box>
    </>
  );
}