import { useEffect, useState, useRef, useCallback } from 'react';
import { Alert, Box, Paper, Typography, CircularProgress, Button } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import { ZoomControls } from 'src/components/leaderboard/ZoomControls';
import { LeaderboardTable } from 'src/components/leaderboard/LeaderboardTable';
import { LeaderboardHeader } from 'src/components/leaderboard/header-lb';
import { LeaderboardFooter } from 'src/components/leaderboard/footer-lb';
import { api } from 'src/api/api';
import { Leaderboard } from 'src/types/session';

// const SessionInfo = ({ name, id }: { name: string | null; id: string | null }) => (
//   <Box sx={{ mb: 4, textAlign: 'center', position: 'relative' }}>
//     <Typography
//       variant="h4"
//       sx={{
//         fontWeight: 'bold',
//         color: 'text.primary',
//         mb: { xs: 1, sm: 0 }
//       }}
//     >
//       {name || 'Unnamed Session'}
//     </Typography>
//     {id && (
//       <Typography
//         variant="caption"
//         sx={{
//           color: 'text.secondary',
//           bgcolor: 'background.paper',
//           px: 1,
//           py: 0.5,
//           borderRadius: 1,
//           border: '1px solid',
//           borderColor: 'divider',
//           position: { xs: 'relative' },
//           display: 'inline-block',
//           top: { sm:'8px', xs: 'auto' },
//         }}
//       >
//         #{id.toUpperCase()}
//       </Typography>
//     )}
//   </Box>
// );

interface Props {
  session_id: string;
}

const LiveLeaderboard = ({session_id}: Props) => {
  const theme = useTheme();
  const [leaderboard, setLeaderboard] = useState<Leaderboard[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [zoom, setZoom] = useState(100);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const leaderboardRef = useRef<HTMLDivElement>(null);

  const fetchLeaderboard = useCallback(() => {
    try {
      setLoading(true)
      api.session.getSessionLeaderboard(session_id)
      .then((res)=>setLeaderboard(res?.leaderboard?.map((item: Leaderboard, index: number)=>{
        return {
          ...item, rank: index+1
        }
      })))
      .catch((err)=>{
        setError(err?.response?.message);
      })
    } catch (err) {
      if (err instanceof Error) {
        setError(`Failed to load leaderboard: ${err.message}`);
      } else {
        setError('An unexpected error occurred while loading the leaderboard');
      }
    } finally {
      setLoading(false);
    }
  },[session_id]);

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
    fetchLeaderboard();
  }, [fetchLeaderboard]);

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
            <Button color="inherit" size="small" onClick={fetchLeaderboard}>
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

        {/* <SessionInfo name={sessionName} id={sessionId} /> */}

        <LeaderboardTable entries={leaderboard} />

        <LeaderboardFooter />
      </Paper>
    </Box>
  );
};

export default LiveLeaderboard;
