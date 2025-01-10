import { LoadingButton } from '@mui/lab';
import { Box, Button, Card, Dialog, DialogActions, DialogContent, DialogTitle, Stack, TextField, Typography } from '@mui/material';
import { useEffect, useRef, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { ConfirmDialog } from 'src/components/dialog/confirm-dialog';
import { Iconify } from 'src/components/iconify';
import DataTable from 'src/components/table/DataTable';
import { userApi } from 'src/services/api/user.api';
import { User } from 'src/types/session';

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
  const [totalPages, setTotalPages] = useState(0);
  
  const navigate = useNavigate();

  const columns = [
    // { 
    //   id: 'sno', 
    //   label: 'S.No', 
    //   minWidth: 130,
    //   format: (value: number) => value.toString(),
    //   noWrap: true,
    //   sx: { whiteSpace: 'nowrap' },
    // },
    { 
      id: 'name', 
      label: 'Name', 
      minWidth: 170, 
      noWrap: true,
      sx: { whiteSpace: 'nowrap' },
      format: (value: string) => value.charAt(0).toUpperCase() + value.slice(1),
    },
    // { 
    //   id: 'sessions', 
    //   label: 'Sessions', 
    //   minWidth: 170, 
    //   noWrap: true,
    //   sx: { whiteSpace: 'nowrap' },
    // },
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
    // { 
    //   id: 'dob', 
    //   label: 'Date of Birth',
    //   minWidth: 120,
    //   format: (value: string) => value ? new Date(value).toLocaleDateString() : '-',
    //   noWrap: true,
    //   sx: { whiteSpace: 'nowrap' },
    // },
    { 
      id: 'created_at', 
      label: 'Joined',
      minWidth: 160,
      format: (value: string) => new Date(value).toLocaleString(),
      noWrap: true,
      sx: { whiteSpace: 'nowrap' },
    },
  ];


  const fetchUsers = async (resetPage = false) => {
    try {
      setLoading(true);
  
      const currentPage = resetPage ? 1 : page;
      if (resetPage) {
        setPage(1);
      }
  
      const response = await userApi.list({
        page: currentPage,
        pageSize: rowsPerPage,
        search: currentSearch.current,
      });
      
      setUsers(response.users);
      setTotalPages(response?.pagination?.totalPages);
    } catch (error) {
      console.error('Error fetching users:', error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;

    try {
      setDeleteLoading(true);
      
      await userApi.delete(selectedUser.user_id);
      
      await fetchUsers();
      setSelectedUser(null);
      setIsDeleting(false);
    } catch (error) {
      console.error('Error deleting user:', error);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleEditUser = async () => {
    if (!selectedUser) return;

    try {
      setEditLoading(true);
      
      const cleanedData = Object.fromEntries(
        Object.entries(editData).filter(([_, v]) => v !== undefined && v !== '')
      );
      
      await userApi.update(selectedUser.user_id, cleanedData);
      
      await fetchUsers();
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
      // dob: user.dob || '',
    });
    setOpenEdit(true);
    setIsDeleting(false);
  };

  const handleOpenDelete = (user: User) => {
    setSelectedUser(user);
    setIsDeleting(true);
  };

  const searchTimeout = useRef<NodeJS.Timeout>();
  const currentSearch = useRef('');  // Add this to track current search value

  const handleSearch = (value: string) => {
    currentSearch.current = value;  // Update the ref immediately
    setSearchQuery(value);  // Update state for input field
    
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }
  
    searchTimeout.current = setTimeout(() => {
      fetchUsers(true);  // This will now use the current search value
    }, 500);
  };
  
// Clean up effect
useEffect(() => {
  fetchUsers();
  return () => {
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }
  };
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, []);

// Pagination effect - only trigger if not from search
useEffect(() => {
  if (users.length > 0) {
    fetchUsers(false);
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [page, rowsPerPage]);

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
              onChange={(e) => handleSearch(e.target.value)}
              InputProps={{
                startAdornment: <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled', mr: 1 }} />,
              }}
            />

            <DataTable
              loading={loading}
              columns={columns}
              rows={users?.map((user, index) => ({
                ...user,
                sno: (page - 1) * rowsPerPage + index + 1,
              }))}
              page={page}
              rowsPerPage={rowsPerPage}
              totalPages={totalPages}
              onPageChange={(newPage) => setPage(newPage)}
              onRowsPerPageChange={(newRowsPerPage) => {
                setRowsPerPage(newRowsPerPage);
                setPage(1);
              }}
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
        <DialogContent>
          <Stack spacing={3} mt={1}>
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
            {/* <TextField
              fullWidth
              type="date"
              label="Date of Birth"
              value={editData.dob || ''}
              onChange={(e) => setEditData(prev => ({ ...prev, dob: e.target.value }))}
              InputLabelProps={{
                shrink: true,
              }}
            /> */}
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