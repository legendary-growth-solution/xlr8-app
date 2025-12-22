import {
  Alert,
  Box,
  Button,
  IconButton,
  Stack,
  Typography
} from '@mui/material';
import { Iconify } from 'src/components/iconify';
import type { TimeSlot } from 'src/types/bookings';

interface CopyModeSectionProps {
  copySourceDay: string;
  copiedSlots: TimeSlot[];
  onEditSlot: (slot: TimeSlot) => void;
  onRemoveSlot: (index: number) => void;
  onAddSlot: () => void;
  onSaveSlots: () => void;
  onCancelCopy: () => void;
}

export default function CopyModeSection({
  copySourceDay,
  copiedSlots,
  onEditSlot,
  onRemoveSlot,
  onAddSlot,
  onSaveSlots,
  onCancelCopy,
}: CopyModeSectionProps) {
  return (
    <Box sx={{ p: 3, borderBottom: '1px solid', borderColor: 'divider', bgcolor: 'background.neutral' }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="h6" color="primary">
          Copied from {copySourceDay} ({copiedSlots.length} slots)
        </Typography>
        <Stack direction="row" spacing={1}>
          <Button
            size="small"
            startIcon={<Iconify icon="eva:plus-fill" />}
            onClick={onAddSlot}
          >
            Add Slot
          </Button>
          <Button
            size="small"
            variant="contained"
            onClick={onSaveSlots}
            disabled={copiedSlots.length === 0}
          >
            Save Copied Slots
          </Button>
          <Button
            size="small"
            color="error"
            onClick={onCancelCopy}
          >
            Cancel
          </Button>
        </Stack>
      </Stack>

      {copiedSlots.length === 0 ? (
        <Alert severity="info" sx={{ mb: 2 }}>
          No slots copied. Add slots or cancel copy mode.
        </Alert>
      ) : (
        copiedSlots.map((slot, index) => (
          <Box
            key={index}
            sx={{
              py: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom: '1px solid',
              borderColor: 'divider',
              bgcolor: 'action.hover',
              borderRadius: 1,
              mb: 1,
              pl: 1,
            }}
          >
            <Typography>
              {slot.start_time} - {slot.end_time} (L1 : {slot.l1_max_slots}, L2 : {slot.l2_max_slots}, L3 : {slot.l3_max_slots} slots)
            </Typography>
            <Stack direction="row" spacing={1}>
              <IconButton onClick={() => onEditSlot(slot)} size="small">
                <Iconify icon="eva:edit-fill" />
              </IconButton>
              <IconButton
                onClick={() => onRemoveSlot(index)}
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
  );
}
