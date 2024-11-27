import { useState } from 'react';
import { MenuItem } from '@mui/material';
import { Cart } from 'src/types/cart';
import BaseDialog from '../common/BaseDialog';
import FormField from '../common/FormField';

interface AssignCartDialogProps {
  open: boolean;
  onClose: () => void;
  cart: Cart | null;
}

export default function AssignCartDialog({ open, onClose, cart }: AssignCartDialogProps) {
  const [selectedSession, setSelectedSession] = useState('');
  const [selectedUser, setSelectedUser] = useState('');

  const sessions = [
    { id: '1', name: 'Morning Session' },
    { id: '2', name: 'Evening Session' },
  ];
  
  const getUsersBySession = (sessionId: string) => [
    { id: '1', name: 'User 1' },
    { id: '2', name: 'User 2' },
  ];

  const handleSessionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedSession(event.target.value);
    setSelectedUser('');
  };

  const handleAssign = () => {
    onClose();
  };

  return (
    <BaseDialog
      open={open}
      onClose={onClose}
      title={`Assign Cart - ${cart?.name}`}
      onSubmit={handleAssign}
      submitText="Assign"
    >
      <FormField
        label="Session"
        select
        value={selectedSession}
        onChange={handleSessionChange}
      >
        {sessions.map((session) => (
          <MenuItem key={session.id} value={session.id}>
            {session.name}
          </MenuItem>
        ))}
      </FormField>
      <FormField
        label="User"
        select
        value={selectedUser}
        onChange={(e) => setSelectedUser(e.target.value)}
        disabled={!selectedSession}
      >
        {selectedSession &&
          getUsersBySession(selectedSession).map((user) => (
            <MenuItem key={user.id} value={user.id}>
              {user.name}
            </MenuItem>
          ))}
      </FormField>
    </BaseDialog>
  );
} 