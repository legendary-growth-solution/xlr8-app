/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
import { Box, Typography } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import { Leaderboard } from 'src/types/session';
import { RankCircle } from './RankCircle';

type LeaderboardTableProps = {
  entries: Leaderboard[];
  // onUserClick?: (userId: string, groupId: string) => void;
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
  // onUserClick,
}: LeaderboardTableProps) => {
  const theme = useTheme();

  if (entries?.length === 0) {
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
          {entries?.map((entry) => (
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
                // onClick={() => onUserClick?.(entry.user_id || '', entry.groupId || '')}
              >
                {entry.user_name}
              </td>
              <td style={{ padding: '20px', fontSize: '1.5rem', textAlign: 'center' }}>
                {entry.best_lap_number}
              </td>
              <td
                style={{
                  padding: '20px',
                  fontSize: '1.5rem',
                  textAlign: 'center',
                  color: entry.best_lap_time
                    ? theme.palette.success.main
                    : theme.palette.text.secondary,
                }}
              >
                {entry.best_lap_time ? (`${entry.best_lap_time}s`) : '-'}
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
