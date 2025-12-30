import { useNavigate } from 'react-router-dom';

import {
  Card,
  CardContent,
  CardHeader,
  Chip,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';

import { Iconify } from 'src/components/iconify';
import { RecentSessionsSkeleton } from 'src/components/skeleton/RecentSessionsSkeleton';

type Session = {
  session_id?: string;
  name?: string;
  start_time?: string;
  end_time?: string;
  active?: boolean;
};

type Props = {
  sessions: Session[];
  loading?: boolean;
};

export function RecentSessions({ sessions, loading }: Props) {
  const navigate = useNavigate();

  const handleSessionClick = (sessionId?: string) => {
    if (sessionId) {
      navigate(`/sessions/${sessionId}`);
    } else {
      navigate('/sessions/history');
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateString;
    }
  };

  if (loading) {
    return <RecentSessionsSkeleton />;
  }

  if (!sessions || sessions.length === 0) {
    return (
      <Card>
        <CardHeader title="Recent Sessions" subheader="Latest completed sessions" />
        <CardContent>
          <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 3 }}>
            No recent sessions available
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader
        title="Recent Sessions"
        subheader="Latest completed sessions"
        sx={{
          pb: 2,
        }}
        action={
          <IconButton onClick={() => navigate('/sessions/history')} size="small">
            <Iconify icon="eva:arrow-forward-fill" />
          </IconButton>
        }
      />
      <CardContent sx={{ p: 0 }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Session Name</TableCell>
                <TableCell>Session ID</TableCell>
                <TableCell>Start Time</TableCell>
                <TableCell>End Time</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sessions.map((session) => (
                <TableRow
                  key={session.session_id}
                  hover
                  sx={{ cursor: 'pointer' }}
                  onClick={() => handleSessionClick(session.session_id)}
                >
                  <TableCell>
                    <Typography variant="subtitle2">
                      {session.name || 'Unnamed Session'}
                    </Typography>
                    {session.active && (
                      <Chip label="Active" color="success" size="small" sx={{ ml: 1 }} />
                    )}
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {session.session_id?.substring(0, 8).toUpperCase() || 'N/A'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {formatDate(session.start_time)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {session.end_time ? formatDate(session.end_time) : '-'}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSessionClick(session.session_id);
                      }}
                    >
                      <Iconify icon="eva:arrow-forward-fill" width={20} />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  );
}

