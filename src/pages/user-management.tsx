import { Helmet } from 'react-helmet-async';
import { Box, Button, Typography, Card, Stack, TextField, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { useState, useEffect } from 'react';
import { User } from 'src/types/session';
import DataTable from 'src/components/table/DataTable';
import { Iconify } from 'src/components/iconify';
import { useNavigate } from 'react-router-dom';
import { MOCK_USERS } from 'src/services/mock/mock-data';
import { ConfirmDialog } from 'src/components/dialog/confirm-dialog';
import { LoadingButton } from '@mui/lab';

export default function UserManagementPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [editData, setEditData] = useState<Partial<User>>({});
  const [openEdit, setOpenEdit] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const navigate = useNavigate();

  const columns = [
    { 
      id: 'id', 
      label: 'User ID', 
      minWidth: 130,
      format: (value: string) => value.toUpperCase(),
      noWrap: true,
      sx: { whiteSpace: 'nowrap' },
    },
    { 
      id: 'name', 
      label: 'Name', 
      minWidth: 170, 
      noWrap: true,
      sx: { whiteSpace: 'nowrap' },
    },
    { 
      id: 'email', 
      label: 'Email', 
      minWidth: 200, 
      noWrap: true,
      sx: { whiteSpace: 'nowrap' },
    },
    { 
      id: 'phone', 
      label: 'Phone',
      minWidth: 130,
      noWrap: true,
      sx: { whiteSpace: 'nowrap' },
    },
    { 
      id: 'createdAt', 
      label: 'Joined',
      minWidth: 160,
      format: (value: Date) => value.toLocaleString(),
      noWrap: true,
      sx: { whiteSpace: 'nowrap' },
    },
  ];

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, rowsPerPage, searchQuery]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setTimeout(() => {
        const filteredUsers = MOCK_USERS.filter(user => 
          user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (user.phone && user.phone.includes(searchQuery))
        );
        setUsers(filteredUsers);
        setLoading(false);
      }, 500);
    } catch (error) {
      console.error('Error fetching users:', error);
      setLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;

    try {
      setIsDeleting(true);
      setDeleteLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setUsers(prev => prev.filter(u => u.id !== selectedUser.id));
      setSelectedUser(null);
    } catch (error) {
      console.error('Error deleting user:', error);
    } finally {
      setDeleteLoading(false);
      setIsDeleting(false);
    }
  };

  const handleEditUser = async () => {
    if (!selectedUser) return;

    try {
      setEditLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setUsers(prev => prev.map(u => 
        u.id === selectedUser.id 
          ? { ...u, ...editData }
          : u
      ));
      setOpenEdit(false);
      setSelectedUser(null);
      setEditData({});
    } catch (error) {
      console.error('Error updating user:', error);
    } finally {
      setEditLoading(false);
    }
  };

  const handleOpenEdit = (user: User) => {
    setSelectedUser(user);
    setEditData({
      name: user.name,
      email: user.email,
      phone: user.phone,
    });
    setOpenEdit(true);
    setIsDeleting(false);
  };

  const handleOpenDelete = (user: User) => {
    setSelectedUser(user);
    setIsDeleting(true);
  };

  return (
    <>
      <Helmet>
        <title>User Management</title>
      </Helmet>

      <Box sx={{ p: 3 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
          <Typography variant="h4">User Management</Typography>
          
          <Button
            variant="contained"
            startIcon={<Iconify icon="eva:plus-fill" />}
            onClick={() => navigate('/users/create')}
          >
            New User
          </Button>
        </Stack>

        <Card sx={{ p: 3 }}>
          <Stack spacing={2}>
            <TextField
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled', mr: 1 }} />,
              }}
            />

            <DataTable
              loading={loading}
              columns={columns}
              rows={users}
              page={page}
              rowsPerPage={rowsPerPage}
              onPageChange={setPage}
              onRowsPerPageChange={setRowsPerPage}
              actions={(row) => (
                <Stack direction="row" spacing={1}>
                  <Button 
                    variant="outlined" 
                    size="small"
                    onClick={() => handleOpenEdit(row)}
                  >
                    Edit
                  </Button>
                  <Button 
                    variant="contained" 
                    size="small"
                    color="error"
                    onClick={() => handleOpenDelete(row)}
                  >
                    Delete
                  </Button>
                </Stack>
              )}
            />
          </Stack>
        </Card>
      </Box>

      <Dialog open={openEdit} onClose={() => setOpenEdit(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit User</DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Stack spacing={3}>
            <TextField
              fullWidth
              label="Name"
              value={editData.name || ''}
              onChange={(e) => setEditData(prev => ({ ...prev, name: e.target.value }))}
            />
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={editData.email || ''}
              onChange={(e) => setEditData(prev => ({ ...prev, email: e.target.value }))}
            />
            <TextField
              fullWidth
              label="Phone"
              value={editData.phone || ''}
              onChange={(e) => setEditData(prev => ({ ...prev, phone: e.target.value }))}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenEdit(false)}>Cancel</Button>
          <LoadingButton loading={editLoading} onClick={handleEditUser} variant="contained">
            Save Changes
          </LoadingButton>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={!!selectedUser && isDeleting}
        title="Delete User"
        content={`Are you sure you want to delete user "${selectedUser?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        confirmColor="error"
        loading={deleteLoading}
        onClose={() => setSelectedUser(null)}
        onConfirm={handleDeleteUser}
      />
    </>
  );
} 