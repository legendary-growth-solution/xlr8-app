import { Helmet } from 'react-helmet-async';
import { Box, Button, Typography, Card, Stack, TextField } from '@mui/material';
import { useState, useEffect } from 'react';
import { Session } from 'src/types/session';
import DataTable from 'src/components/table/DataTable';
import { Iconify } from 'src/components/iconify';
import { useNavigate } from 'react-router-dom';
import { MOCK_SESSIONS } from 'src/services/mock/mock-data';
import { ConfirmDialog } from 'src/components/dialog/confirm-dialog';
import { CreateSessionDialog } from 'src/components/session/create-session-dialog';

export default function SessionManagementPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [endSessionLoading, setEndSessionLoading] = useState(false);
  const [openCreate, setOpenCreate] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [createData, setCreateData] = useState<{
    name?: string;
    maxParticipants?: number;
  }>({});

  const navigate = useNavigate();

  const columns = [
    { 
      id: 'id', 
      label: 'Session ID', 
      minWidth: 130,
      format: (value: string) => value?.toUpperCase() || '-',
      noWrap: true,
      sx: { whiteSpace: 'nowrap' },
    },
    { 
      id: 'name', 
      label: 'Session Name', 
      minWidth: 170, 
      noWrap: true,
      sx: { whiteSpace: 'nowrap' },
    },
    { 
      id: 'status', 
      label: 'Status', 
      minWidth: 100,
      noWrap: true,
      sx: { whiteSpace: 'nowrap' },
      format: (value: string) => (
        <Box
          sx={{
            bgcolor: value === 'active' ? 'success.lighter' : 'warning.lighter',
            color: value === 'active' ? 'success.darker' : 'warning.darker',
            py: 0.5,
            px: 1,
            borderRadius: 1,
            display: 'inline-block',
            textTransform: 'capitalize',
          }}
        >
          {value}
        </Box>
      ),
    },
    { 
      id: 'start_time', 
      label: 'Start Time',
      minWidth: 160,
      format: (value: string) => new Date(value).toLocaleString(),
      noWrap: true,
      sx: { whiteSpace: 'nowrap' },
    },
    {
      id: 'currentParticipants',
      label: 'Participants',
      minWidth: 120,
      format: (value: number, row: Session) => `${value}/${row.maxParticipants}`,
      noWrap: true,
      sx: { whiteSpace: 'nowrap' },
    },
    {
      id: 'created_at',
      label: 'Created',
      minWidth: 160,
      format: (value: string) => new Date(value).toLocaleString(),
      noWrap: true,
      sx: { whiteSpace: 'nowrap' },
    },
  ];

  useEffect(() => {
    fetchSessions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, rowsPerPage, searchQuery]);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      setTimeout(() => {
        const filteredSessions = MOCK_SESSIONS
          .filter(session => 
            session.status === 'active' &&
            (session.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
             session.id.toLowerCase().includes(searchQuery.toLowerCase()))
          );
        setSessions(filteredSessions);
        setLoading(false);
      }, 500);
    } catch (error) {
      console.error('Error fetching sessions:', error);
      setLoading(false);
    }
  };

  const handleEndSession = async () => {
    if (!selectedSession) return;

    try {
      setEndSessionLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSessions(prev => prev.filter(s => s.id !== selectedSession.id));
      setSelectedSession(null);
    } catch (error) {
      console.error('Error ending session:', error);
    } finally {
      setEndSessionLoading(false);
    }
  };

  const handleCreateSession = async () => {
    try {
      setCreateLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newSession: Session = {
        id: `session-${Date.now()}`,
        name: createData.name ?? '',
        status: 'active',
        start_time: new Date().toISOString(),
        currentParticipants: 0,
        maxParticipants: createData.maxParticipants || 999,
        created_at: new Date().toISOString(),
      };

      setSessions(prev => [newSession, ...prev]);
      setOpenCreate(false);
      setCreateData({});
    } catch (error) {
      console.error('Error creating session:', error);
    } finally {
      setCreateLoading(false);
    }
  };

  const handleCreateChange = (field: string, value: string | number) => {
    setCreateData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <>
      <Helmet>
        <title>Active Sessions Management</title>
      </Helmet>

      <Box sx={{ p: 3 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
          <Typography variant="h4">Active Sessions</Typography>
          
          <Button
            variant="contained"
            startIcon={<Iconify icon="eva:plus-fill" />}
            onClick={() => setOpenCreate(true)}
          >
            New Session
          </Button>
        </Stack>

        <Card sx={{ p: 3 }}>
          <Stack spacing={2}>
            <TextField
              placeholder="Search sessions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled', mr: 1 }} />,
              }}
            />

            <DataTable
              loading={loading}
              columns={columns}
              rows={sessions}
              page={page}
              rowsPerPage={rowsPerPage}
              onPageChange={setPage}
              onRowsPerPageChange={setRowsPerPage}
              actions={(row) => (
                <Stack direction="row" spacing={1} sx={{ whiteSpace: 'nowrap' }}>
                  <Button 
                    variant="outlined" 
                    size="small"
                    onClick={() => navigate(`/sessions/${row.id}`)}
                  >
                    View
                  </Button>
                  <Button 
                    variant="contained" 
                    size="small"
                    color="error"
                    onClick={() => setSelectedSession(row)}
                  >
                    End Session
                  </Button>
                </Stack>
              )}
            />
          </Stack>
        </Card>
      </Box>

      <ConfirmDialog
        open={!!selectedSession}
        title="End Session"
        content={`Are you sure you want to end session "${selectedSession?.name || ''}"? This action cannot be undone.`}
        confirmText="End Session"
        confirmColor="error"
        loading={endSessionLoading}
        onClose={() => setSelectedSession(null)}
        onConfirm={handleEndSession}
      />

      <CreateSessionDialog
        open={openCreate}
        loading={createLoading}
        data={createData}
        onClose={() => setOpenCreate(false)}
        onChange={handleCreateChange}
        onSubmit={handleCreateSession}
      />
    </>
  );
} 