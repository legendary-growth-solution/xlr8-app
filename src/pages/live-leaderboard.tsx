import { Alert, Box, CircularProgress, Paper, Stack, Typography } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import { useCallback, useEffect, useRef, useState } from 'react';
import { LeaderboardTable } from 'src/components/leaderboard/LeaderboardTable';
import { ZoomControls } from 'src/components/leaderboard/ZoomControls';
import { LeaderboardFooter } from 'src/components/leaderboard/footer-lb';
import { LeaderboardHeader } from 'src/components/leaderboard/header-lb';
import { Leaderboard } from 'src/types/session';
import { useLeaderboardWebSocket } from 'src/hooks/useLeaderboardWebSocket';

interface Props {
  session_id?: string;
  isSessionActive?: boolean;
  entries?: Array<any>;
}

const LiveLeaderboard = ({ session_id, isSessionActive, entries }: Props) => {
  const theme = useTheme();
  const [leaderboard, setLeaderboard] = useState<Leaderboard[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [zoom, setZoom] = useState(100);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const leaderboardRef = useRef<HTMLDivElement>(null);

  const handleLeaderboardUpdate = useCallback((updatedLeaderboard: Leaderboard[]) => {
    setLeaderboard(updatedLeaderboard);
          setLoading(false);
  }, []);

  const handleWebSocketError = useCallback((errorMessage: string) => {
    setError(errorMessage);
  }, []);

  const { isConnected, isProcessing } = useLeaderboardWebSocket({
    sessionId: session_id || '',
    onLeaderboardUpdate: handleLeaderboardUpdate,
    onError: handleWebSocketError,
    enabled: !isSessionActive && !!session_id && !entries,
  });

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

  useEffect(() => {
    if (entries) {
      setLeaderboard(entries);
      setLoading(false);
    }
  }, [entries]);

  if (error) {
    return (
      <Box p={3}>
        <Alert severity="error">
          {error}
        </Alert>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        bgcolor: 'background.default',
        position: 'relative',
      }}
    >
      {!isSessionActive && !entries && (
        <Box sx={{ position: 'absolute', top: 16, right: 16, zIndex: 10 }}>
          <Stack direction="row" spacing={1} alignItems="center">
            {isProcessing && (
              <Stack direction="row" spacing={1} alignItems="center" sx={{ 
                bgcolor: alpha(theme.palette.warning.main, 0.1),
                px: 2,
                py: 1,
                borderRadius: 2,
                border: `1px solid ${alpha(theme.palette.warning.main, 0.3)}`,
              }}>
                <CircularProgress size={16} color="warning" />
                <Typography variant="body2" color="warning.main">
                  Generating Leaderboard...
                </Typography>
              </Stack>
            )}
            {isConnected && !isProcessing && (
              <Box sx={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                bgcolor: theme.palette.success.main,
                animation: 'pulse 2s infinite',
                '@keyframes pulse': {
                  '0%, 100%': { opacity: 1 },
                  '50%': { opacity: 0.5 },
                },
              }} />
            )}
          </Stack>
        </Box>
      )}

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
        <LeaderboardHeader />

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
          Leaderboard
        </Typography>

        {isProcessing && leaderboard.length === 0 ? (
          <Box sx={{ py: 8, textAlign: 'center' }}>
            <CircularProgress size={48} />
            <Typography variant="h6" sx={{ mt: 3, color: 'text.secondary' }}>
              Processing leaderboard data...
            </Typography>
            <Typography variant="body2" sx={{ mt: 1, color: 'text.disabled' }}>
              This may take a few moments
            </Typography>
          </Box>
        ) : (
        <LeaderboardTable
          entries={entries ?? leaderboard}
          loading={loading}
          isInactiveSession={!isSessionActive}
        />
        )}

        <LeaderboardFooter />
      </Paper>
    </Box>
  );
};

export default LiveLeaderboard;
