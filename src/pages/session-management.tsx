import { Helmet } from 'react-helmet-async';
import { Box, Button, Typography, Stack } from '@mui/material';
import { useState, useEffect, useCallback } from 'react';
import { Session } from 'src/types/session'
import { Iconify } from 'src/components/iconify';
import { useNavigate } from 'react-router-dom';
import { CreateSessionDialog } from 'src/components/session/create-session-dialog';
import { sessionApi } from 'src/services/api/session.api';
import SessionCard from 'src/components/session/session-card';
import SessionCardSkeleton from 'src/components/session/session-card-skeleton';

export default function SessionManagementPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [endSessionLoading, setEndSessionLoading] = useState<boolean>(false);
  const [openCreate, setOpenCreate] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [createData, setCreateData] = useState<{
    name?: string;
    maxParticipants?: number;
    race_duration_minutes?: number;
    laps?: number;
  }>({});

  const navigate = useNavigate();

  const fetchSessions = useCallback(async () => {
    try {
      setLoading(true);
      try {
        const response = await sessionApi.list({
          page: 1,
          pageSize: 1,
        });

        setSessions([...response.sessions]);
      } catch (apiError) {
        console.error('API Error:', apiError);
        setSessions([]);
      }
    } catch (error) {
      console.error('Error fetching sessions:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleEndSession = useCallback(async (selectedSessionId: string) => {
    try {
      setEndSessionLoading(true);
      await sessionApi.update(selectedSessionId, { status: 'completed' });
      await fetchSessions();
    } catch (error) {
      console.error('Error ending session:', error);
    } finally {
      setEndSessionLoading(false);
    }
  }, [fetchSessions]);

  const handleCreateSession = useCallback(async () => {
    try {
      setCreateLoading(true);

      const newSession = await sessionApi.create({
        max_participants: createData.maxParticipants,
      });

      setSessions([...sessions, newSession]);

      setOpenCreate(false);
      setCreateData({});
    } catch (error) {
      console.error('Error creating session:', error);
    } finally {
      setCreateLoading(false);
    }
  }, [createData, sessions]);

  const handleCreateChange = useCallback((field: string, value: string | number) => {
    setCreateData(prev => ({ ...prev, [field]: value }));
  }, []);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

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

          <Stack direction="row" spacing={2}>
            {loading && <SessionCardSkeleton />}
            {!loading && sessions?.map((item: Session, index: number) => (
              <SessionCard
                key={index}
                name={item.session_name}
                startTime={item.start_time}
                numParticipants={item?.current_participants}
                maxParticipants={item?.max_participants}
                onView={() => navigate(`/sessions/${item.id}`)}
                onEnd={() => { handleEndSession(item?.id) }}
                endSessionLoading={endSessionLoading}
              />
            ))}
          </Stack>
      </Box>

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