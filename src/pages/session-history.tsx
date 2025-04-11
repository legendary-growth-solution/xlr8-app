import { Helmet } from 'react-helmet-async';
import { Box, Button, Typography, Card, Stack, TextField } from '@mui/material';
import { useState, useEffect, useCallback, useRef } from 'react';
import { Session } from 'src/types/session';
import DataTable from 'src/components/table/DataTable';
import { Iconify } from 'src/components/iconify';
import { useNavigate } from 'react-router-dom';
import ExportMenu from 'src/components/export/ExportMenu';
import { showToast } from 'src/components/toast';
import axios from 'axios';
import { apiEndpoints } from 'src/api/apiEndpoints';

export default function SessionHistoryPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [totalPages, setTotalPages] = useState(0);

  const navigate = useNavigate();
  const searchTimeout = useRef<NodeJS.Timeout>();
  const currentSearch = useRef('');

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

  const transformSessionData = (sessionsArg: Session[]) =>
    sessionsArg.map((session) => ({
      'Session ID': session.session_id,
      Name: session.name,
      'Start Time': new Date(session.start_time).toLocaleString(),
      'End Time': session.end_time ? new Date(session.end_time).toLocaleString() : '-',
      'Duration (mins)': calculateDuration(session),
    }));

  const columns = [
    {
      id: 'session_id',
      label: 'Session ID',
      minWidth: 130,
      format: (value: string) => value?.toUpperCase(),
    },
    { id: 'name', label: 'Session Name', minWidth: 170 },
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
      format: (value: string) => (value ? new Date(value).toLocaleString() : '-'),
    },
  ];

  const fetchSessionHistory = useCallback(async (resetPage = false) => {
    try {
      setLoading(true);
      
      const currentPage = resetPage ? 1 : page;
      if (resetPage) {
        setPage(1);
      }

      const response = await axios.get(apiEndpoints.session.completedSessions, {
        params: {
          page: currentPage,
          pageSize: rowsPerPage,
          search: currentSearch.current,
        },
      });
      
      const res = response.data;
      setSessions(res.sessions);
      setTotalPages(res.pagination?.totalPages || 0);
    } catch (err) {
      showToast.error(err?.data?.error);
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage]);

  const handleSearch = (value: string) => {
    currentSearch.current = value;
    setSearchQuery(value);

    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }

    searchTimeout.current = setTimeout(() => {
      fetchSessionHistory(true);
    }, 500);
  };

  // Clean up effect
  useEffect(() => {
    fetchSessionHistory();
    return () => {
      if (searchTimeout.current) {
        clearTimeout(searchTimeout.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Pagination effect - only trigger if not from search
  useEffect(() => {
    if (sessions.length > 0) {
      fetchSessionHistory(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, rowsPerPage]);

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
              rows={sessions}
              page={page}
              rowsPerPage={rowsPerPage}
              totalPages={totalPages}
              onPageChange={(newPage) => setPage(newPage)}
              onRowsPerPageChange={(newRowsPerPage) => {
                setRowsPerPage(newRowsPerPage);
                setPage(1);
              }}
              actions={(row) => (
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => navigate(`/sessions/${row.session_id}`)}
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
