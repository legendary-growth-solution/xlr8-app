import { useState } from 'react';
import { TextField } from '@mui/material';
import BaseDialog from '../common/BaseDialog';

interface NewCartDialogProps {
  open: boolean;
  onClose: () => void;
  onAdd: (cartData: { name: string; rfidtag: string }) => void;
}

export default function NewCartDialog({ open, onClose, onAdd }: NewCartDialogProps) {
  const [name, setName] = useState('');
  const [rfidtag, setRfIdTag] = useState('');
  const isSubmitDisabled = rfidtag.trim() === '';

  const handleSubmit = () => {
    onAdd({ name, rfidtag });
    setName('');
    setRfIdTag('');
    onClose();
  };

  return (
    <BaseDialog
      open={open}
      onClose={onClose}
      title="Add New Cart"
      onSubmit={handleSubmit}
      submitText="Add Cart"
      submitDisabled={isSubmitDisabled}
    >
      <TextField
        label="Cart Name"
        fullWidth
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <TextField
        label="RFID Tag"
        fullWidth
        value={rfidtag}
        required
        onChange={(e) => setRfIdTag(e.target.value)}
      />
    </BaseDialog>
  );
} 