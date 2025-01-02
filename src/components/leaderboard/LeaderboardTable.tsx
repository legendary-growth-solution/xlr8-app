/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
import { useState, useEffect } from 'react';
import { Box, Typography, Chip } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import { fTime } from 'src/utils/format-time';
import { LiveLeaderboardEntry } from 'src/types/leaderboard';
import { RankCircle } from './RankCircle';

const differenceInSeconds = (endTime: Date, startTime: Date) =>
  Math.floor((endTime.getTime() - startTime.getTime()) / 1000);

type LeaderboardTableProps = {
  entries: LiveLeaderboardEntry[];
  sessionStatus: string | null;
  onUserClick?: (userId: string, groupId: string) => void;
};

const getRankColor = (rank: number, theme: any, primary: boolean = false) => {
  switch (rank) {
    case 1:
      return primary ? theme.palette.warning.main : alpha(theme.palette.warning.main, 0.1);
    case 2:
      return primary ? '#C0C0C0' : alpha('#C0C0C0', 0.1);
    case 3:
      return primary ? '#CD7F32' : alpha('#CD7F32', 0.1);
    default:
      return primary ? theme.palette.text.primary : alpha(theme.palette.text.primary, 0.1);
  }
};

export const LeaderboardTable = ({
  entries,
  sessionStatus,
  onUserClick,
}: LeaderboardTableProps) => {
  const theme = useTheme();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const getTimeRemaining = (entry: LiveLeaderboardEntry) => {
    if (sessionStatus !== 'active') {
      return '00:00';
    }

    if (!entry.endTime) {
      return `${entry.timeInMinutes % 60 < 10 ? '0' : ''}${entry.timeInMinutes % 60}:${Math.floor(entry.timeInMinutes / 60) < 10 ? '0' : ''}${Math.floor(entry.timeInMinutes / 60)}`;
    }

    const timeRemainInS = differenceInSeconds(new Date(entry.endTime), currentTime);
    const secondsToMMSS = (seconds: number) => {
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = seconds % 60;
      return `${minutes < 10 ? '0' : ''}${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
    };
    return secondsToMMSS(Math.max(0, timeRemainInS)) ?? '00:00';
  };

  if (entries.length === 0) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <Typography variant="h5" color="text.secondary">
          No active racers found
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 8px' }}>
        <thead>
          <tr>
            {[
              'Rank',
              'Name',
              sessionStatus === 'active' ? 'Cart' : null,
              'Group',
              'Laps',
              'Best Lap',
              'Best Lap Time',
            ]
              .filter(Boolean)
              .map((header) => (
                <th
                  key={header}
                  style={{
                    padding: '16px',
                    fontSize: '1.25rem',
                    fontWeight: 'bold',
                    color: theme.palette.text.primary,
                    textAlign: header === 'Name' ? 'left' : 'center',
                  }}
                >
                  {header}
                </th>
              ))}
          </tr>
        </thead>
        <tbody>
          {entries.map((entry) => (
            <tr
              key={entry.rank}
              style={{
                backgroundColor: getRankColor(entry.rank, theme),
              }}
            >
              <td style={{ padding: '20px', textAlign: 'center' }}>
                <RankCircle rank={entry.rank} />
              </td>
              <td
                style={{
                  padding: '20px',
                  fontSize: '1.5rem',
                  fontWeight: entry.rank <= 3 ? 'bold' : 'normal',
                }}
                onClick={() => onUserClick?.(entry.userId || '', entry.groupId || '')}
              >
                {entry.name}
              </td>
              {sessionStatus === 'active' && (
                <td style={{ padding: '20px', fontSize: '1.5rem', textAlign: 'center' }}>
                  {entry.cartName}
                </td>
              )}
              <td style={{ padding: '20px', fontSize: '1.5rem', textAlign: 'center' }}>
                {entry.groupName}
              </td>
              <td style={{ padding: '20px', fontSize: '1.5rem', textAlign: 'center' }}>
                {entry.totalLaps}
              </td>
              <td style={{ padding: '20px', fontSize: '1.5rem', textAlign: 'center' }}>
                {entry.bestLap}
              </td>
              <td
                style={{
                  padding: '20px',
                  fontSize: '1.5rem',
                  textAlign: 'center',
                  color: entry.bestLapTime
                    ? theme.palette.success.main
                    : theme.palette.text.secondary,
                }}
              >
                {entry.bestLapTime ? entry.bestLapTime : '-'}
              </td>
              {/* <td
                style={{
                  padding: '20px',
                  fontSize: '1.5rem',
                  textAlign: 'center',
                  color: entry.endTime ? theme.palette.info.main : theme.palette.text.secondary,
                }}
              >
                {getTimeRemaining(entry)}
              </td>
              <td style={{ padding: '20px', fontSize: '1.5rem', textAlign: 'center' }}>
                <Chip
                  label={entry.raceStatus.replace('_', ' ')}
                  style={{
                    backgroundColor: {
                      not_started: theme.palette.grey[500],
                      in_progress: theme.palette.info.main,
                      completed: theme.palette.success.main,
                      cancelled: theme.palette.error.main,
                    }[entry.raceStatus],
                    padding: '10px !important',
                    color: theme.palette.common.white,
                  }}
                />
              </td> */}
            </tr>
          ))}
        </tbody>
      </table>
    </Box>
  );
};
