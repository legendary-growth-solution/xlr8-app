import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { groupApi } from 'src/services/api/group.api';
import { Alert, Box, Paper, Typography, CircularProgress, Button } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import { ZoomControls } from 'src/components/leaderboard/ZoomControls';
import { LeaderboardTable } from 'src/components/leaderboard/LeaderboardTable';
import { LiveLeaderboardEntry } from 'src/types/leaderboard';
import { sessionApi } from 'src/services/api/session.api';

const SessionInfo = ({ name, id }: { name: string | null; id: string | null }) => (
  <Box sx={{ mb: 4, textAlign: 'center', position: 'relative' }}>
    <Typography 
      variant="h4" 
      sx={{ 
        fontWeight: 'bold',
        color: 'text.primary',
        mb: { xs: 1, sm: 0 }
      }}
    >
      {name || 'Unnamed Session'}
    </Typography>
    {id && (
      <Typography 
        variant="caption" 
        sx={{ 
          color: 'text.secondary',
          bgcolor: 'background.paper',
          px: 1,
          py: 0.5,
          borderRadius: 1,
          border: '1px solid',
          borderColor: 'divider',
          position: { xs: 'relative' },
          display: 'inline-block',
          top: { sm:'8px', xs: 'auto' },
        }}
      >
        #{id.toUpperCase()}
      </Typography>
    )}
  </Box>
);

const DisplayLeaderboard: React.FC = () => {
  const theme = useTheme();
  const { id } = useParams<{ id: string }>();
  const sid = id ?? '';
  const [leaderboard, setLeaderboard] = useState<LiveLeaderboardEntry[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [zoom, setZoom] = useState(100);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [sessionStatus, setSessionStatus] = useState<string | null>(null);
  const leaderboardRef = useRef<HTMLDivElement>(null);
  const [sessionName, setSessionName] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);

  const fetchLatestSessionId = async () => {
    const data = await sessionApi.getLatestSsnId();
    setSessionId(data?.session_id);
    fetchLeaderboard(data?.session_id);
  };

  const fetchLeaderboard = async (ssnId: string) => {
    try {
      setError(null);
      const data = await groupApi.getLiveLeaderboard(ssnId);
      setLeaderboard(data?.data as any);
      setSessionStatus(data?.sessionStatus);
      setSessionName(data?.sessionName);
      setSessionId(data?.sessionId);
    } catch (err) {
      if (err instanceof Error) {
        setError(`Failed to load leaderboard: ${err.message}`);
      } else {
        setError('An unexpected error occurred while loading the leaderboard');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLatestSessionId();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sid]);

  const handleZoomChange = (_: Event, newValue: number | number[]) => {
    setZoom(newValue as number);
  };

  const handleFullscreenToggle = () => {
    if (!document.fullscreenElement && leaderboardRef.current) {
      leaderboardRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else if (document.fullscreenElement) {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={fetchLatestSessionId}>
              Retry
            </Button>
          }
        >
          {error}
        </Alert>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        p: 3,
        minHeight: '100vh',
        bgcolor: 'background.default',
        position: 'relative',
      }}
    >
      <ZoomControls
        zoom={zoom}
        isFullscreen={isFullscreen}
        onZoomChange={handleZoomChange}
        onFullscreenToggle={handleFullscreenToggle}
      />

      <Paper
        ref={leaderboardRef}
        elevation={24}
        sx={{
          p: 3,
          borderRadius: 2,
          background: alpha(theme.palette.background.paper, 0.9),
          transform: `scale(${zoom / 100})`,
          transformOrigin: 'top center',
          transition: 'transform 0.2s ease',
          margin: '0 auto',
          width: `${10000 / zoom}%`,
          maxWidth: zoom > 100 ? 'none' : '100%',
          mt: 4,
          position: 'relative',
          '&:fullscreen': {
            padding: 6,
            display: 'flex',
            flexDirection: 'column',
            bgcolor: 'background.default',
          },
        }}
      >
        <Typography
          variant="h2"
          align="center"
          sx={{
            mb: 0,
            fontWeight: 'bold',
            color: theme.palette.primary.main,
            fontSize: {
              xs: '2rem',
              sm: '2.5rem',
              md: '3rem',
              lg: '3.5rem',
            },
          }}
        >
          {sessionStatus === 'active' ? 'Live Leaderboard' : 'Leaderboard'}
        </Typography>

        <SessionInfo name={sessionName} id={sessionId} />

        <LeaderboardTable sessionStatus={sessionStatus} entries={leaderboard} />
      </Paper>
    </Box>
  );
};

export default DisplayLeaderboard;
