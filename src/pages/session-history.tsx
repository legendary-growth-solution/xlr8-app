import { Helmet } from 'react-helmet-async';
import { Box, Button, Typography, Card, Stack, TextField } from '@mui/material';
import { useState, useEffect } from 'react';
import { Session } from 'src/types/session';
import DataTable from 'src/components/table/DataTable';
import { Iconify } from 'src/components/iconify';
import { useNavigate } from 'react-router-dom';
import { MOCK_SESSIONS } from 'src/services/mock/mock-data';
import ExportMenu from 'src/components/export/ExportMenu';
import { sessionApi } from 'src/services/api/session.api';

export default function SessionHistoryPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [totalPages, setTotalPages] = useState(1);
  
  const navigate = useNavigate();

  const handleExportClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleExportClose = () => {
    setAnchorEl(null);
  };

  const calculateDuration = (session: Session) => {
    const start = new Date(session.start_time);
    const end = session.end_time ? new Date(session.end_time) : new Date();
    const diff = Math.abs(end.getTime() - start.getTime());
    return Math.floor(diff / 1000 / 60);
  };

  const transformSessionData = (sessionsArg: Session[]) => sessionsArg.map(session => ({
    'Session ID': session.id,
    'Name': session.session_name,
    'Start Time': new Date(session.start_time).toLocaleString(),
    'End Time': session.end_time ? new Date(session.end_time).toLocaleString() : '-',
    'Duration (mins)': calculateDuration(session),
    'Participants': `${session.current_participants}/${session.max_participants}`,
  }));

  const columns = [
    { 
      id: 'id', 
      label: 'Session ID', 
      minWidth: 130,
      format: (value: string) => value?.toUpperCase(),
    },
    { id: 'session_name', label: 'Session Name', minWidth: 170 },
    { 
      id: 'start_time', 
      label: 'Start Time',
      minWidth: 160,
      format: (value: string) => new Date(value).toLocaleString(),
    },
    { 
      id: 'end_time', 
      label: 'End Time',
      minWidth: 160,
      format: (value: string) => value ? new Date(value).toLocaleString() : '-',
    },
    {
      id: 'duration',
      label: 'Duration',
      minWidth: 120,
      format: (value: string, row: Session) => {
        const start = new Date(row.start_time);
        const end = row.end_time ? new Date(row.end_time) : new Date();
        const diff = Math.abs(end.getTime() - start.getTime());
        const minutes = Math.floor(diff / 1000 / 60);
        return `${minutes} mins`;
      },
    },
    {
      id: 'current_participants',
      label: 'Participants',
      minWidth: 120,
      format: (value: number, row: Session) => `${value}/${row.max_participants ?? '-'}`,
    },
  ];

  useEffect(() => {
    fetchSessionHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, rowsPerPage, searchQuery]);

  const fetchSessionHistory = async () => {
    const filteredMSessions = MOCK_SESSIONS.filter(session => 
      session.status === 'completed' &&
      (session.session_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
       session.id.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    try {
      setLoading(true);
      
      try {
        const response = await sessionApi.history({
          page,
          pageSize: rowsPerPage,
          search: searchQuery,
        });
        
        setSessions(response.sessions);
        setTotalPages(response.total);
      } catch (apiError) {
        console.error('API Error:', apiError);
        setSessions(filteredMSessions);
      }
    } catch (error) {
      console.error('Error fetching session history:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Session History</title>
      </Helmet>

      <Box sx={{ p: 3 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
          <Typography variant="h4">Session History</Typography>
          
          <Button
            variant="outlined"
            startIcon={<Iconify icon="eva:download-fill" />}
            onClick={handleExportClick}
          >
            Export Data
          </Button>
        </Stack>

        <ExportMenu
          anchorEl={anchorEl}
          onClose={handleExportClose}
          data={sessions}
          filename="session-history"
          transformData={transformSessionData}
        />

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
                <Button 
                  variant="outlined" 
                  size="small"
                  onClick={() => navigate(`/sessions/${row.id}`)}
                >
                  View Details
                </Button>
              )}
            />
          </Stack>
        </Card>
      </Box>
    </>
  );
} 