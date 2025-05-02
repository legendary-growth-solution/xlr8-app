import { LoadingButton } from '@mui/lab';
import {
  Box,
  Button,
  Card,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useEffect, useRef, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { ConfirmDialog } from 'src/components/dialog/confirm-dialog';
import { Iconify } from 'src/components/iconify';
import DataTable from 'src/components/table/DataTable';
import { showToast } from 'src/components/toast';
import { userApi } from 'src/services/api/user.api';
import { User } from 'src/types/user';
import { formatLapTime } from 'src/utils/timeFormatter';

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
  const [openView, setOpenView] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [totalPages, setTotalPages] = useState(0);
  const [userStats, setUserStats] = useState<any>(null);
  const [statsLoading, setStatsLoading] = useState(false);

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
      sx: { whiteSpace: 'nowrap', cursor: 'pointer' },
      format: (value: string) => value,
      onClick: (value: string) => {
        navigator.clipboard.writeText(value);
        showToast.success('Email copied to clipboard');
      },
    },
    {
      id: 'phone',
      label: 'Phone',
      minWidth: 130,
      noWrap: true,
      sx: { whiteSpace: 'nowrap', cursor: 'pointer' },
      format: (value: string) => value,
      onClick: (value: string) => {
        navigator.clipboard.writeText(value);
        showToast.success('Phone number copied to clipboard');
      },
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
      format: (value: string) => {
        const date = new Date(value);
        return date.toLocaleString('en-IN', {
          timeZone: 'Asia/Kolkata',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        });
      },
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

  const handleOpenView = async (user: User) => {
    showToast.error('Feature under development!');
    // return;
    setSelectedUser(user);
    setOpenView(true);
    setStatsLoading(true);
    try {
      const response = await userApi.getStats(user.user_id);
      setUserStats(response);
    } catch (error) {
      console.error('Error fetching user stats:', error);
    } finally {
      setStatsLoading(false);
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

  const handleViewUserStats = (user: User) => {
    navigate(`/users/${user.user_id}/stats`);
  };

  const handleViewUserHistory = (user: User) => {
    navigate(`/users/${user.user_id}/history`);
  };

  const searchTimeout = useRef<NodeJS.Timeout>();
  const currentSearch = useRef(''); // Add this to track current search value

  const handleSearch = (value: string) => {
    currentSearch.current = value; // Update the ref immediately
    setSearchQuery(value); // Update state for input field

    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }

    searchTimeout.current = setTimeout(() => {
      fetchUsers(true); // This will now use the current search value
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
                startAdornment: (
                  <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled', mr: 1 }} />
                ),
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
                    color="primary"
                    onClick={() => handleViewUserStats(row)}
                  >
                    Stats
                  </Button>
                  <Button
                    variant="outlined"
                    size="small"
                    color="secondary"
                    onClick={() => handleViewUserHistory(row)}
                  >
                    History
                  </Button>
                  <Button variant="outlined" size="small" onClick={() => handleOpenEdit(row)}>
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
              onChange={(e) => setEditData((prev) => ({ ...prev, name: e.target.value }))}
            />
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={editData.email || ''}
              onChange={(e) => setEditData((prev) => ({ ...prev, email: e.target.value }))}
            />
            <TextField
              fullWidth
              label="Phone"
              value={editData.phone || ''}
              onChange={(e) => setEditData((prev) => ({ ...prev, phone: e.target.value }))}
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

      <Dialog open={openView} onClose={() => setOpenView(false)} maxWidth="sm" fullWidth>
        <DialogTitle>User Details</DialogTitle>
        <DialogContent>
          {statsLoading ? (
            <Box display="flex" justifyContent="center" p={3}>
              <CircularProgress />
            </Box>
          ) : (
            <Stack spacing={2} mt={2}>
              <Typography variant="subtitle1">
                <strong>Name:</strong> {selectedUser?.name}
              </Typography>
              <Typography variant="subtitle1">
                <strong>Email:</strong> {selectedUser?.email}
              </Typography>
              <Typography variant="subtitle1">
                <strong>Phone:</strong> {selectedUser?.phone}
              </Typography>

              <Typography variant="h6" sx={{ mt: 2 }}>
                User Stats
              </Typography>
              <Typography variant="subtitle1">
                <strong>Best Time:</strong> {formatLapTime(userStats?.best_time)}
              </Typography>
              <Typography variant="subtitle1">
                <strong>Total Laps:</strong> {userStats?.total_laps || 0}
              </Typography>
              <Typography variant="subtitle1">
                <strong>Total Sessions:</strong> {userStats?.total_sessions || 0}
              </Typography>
              <Typography variant="subtitle1">
                <strong>Total Time:</strong>{' '}
                {userStats?.total_time
                  ? userStats.total_time.toString().length >= 4
                    ? (userStats.total_time / 100 / 60).toFixed(2)
                    : (userStats.total_time / 60).toFixed(2)
                  : 0}{' '}
                minutes
              </Typography>
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenView(false)}>Close</Button>
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
