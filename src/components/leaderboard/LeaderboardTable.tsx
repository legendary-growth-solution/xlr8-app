/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
import { Box, Typography } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import { Leaderboard } from 'src/types/session';
import { formatLapTime } from 'src/utils/timeFormatter';
import { RankCircle } from './RankCircle';
import { LeaderboardSkeleton } from '../skeleton';

type LeaderboardTableProps = {
  entries: Leaderboard[];
  loading?: boolean;
  isInactiveSession?: boolean;
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
  loading = false,
  isInactiveSession = false,
  // onUserClick,
}: LeaderboardTableProps) => {
  const theme = useTheme();

  if (loading) {
    return <LeaderboardSkeleton />;
  }

  if (entries?.length === 0) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <Typography variant="h5" color={isInactiveSession ? 'text.disabled' : 'text.secondary'}>
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
            {['Rank', 'Name', 'Group', 'Cart', 'Total Laps', 'Best Lap', 'Best Lap Time']
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
                  color: theme.palette.text.primary,
                  cursor: entry.user_id ? 'pointer' : 'default',
                }}
                // onClick={() => onUserClick?.(entry.user_id || '', entry.groupId || '')}
                onClick={() => {
                  if (entry.user_id) {
                    window.location.href = `/users/${entry.user_id}/stats`;
                  }
                }}
              >
                {entry.user_name}
              </td>
              <td
                style={{
                  padding: '20px',
                  fontSize: '1.5rem',
                  fontWeight: entry.rank <= 3 ? 'bold' : 'normal',
                  color: theme.palette.text.primary,
                  textAlign: 'center',
                  whiteSpace: 'nowrap',
                }}
              >
                {entry.group_name}
              </td>
              <td
                style={{
                  padding: '20px',
                  fontSize: '1.5rem',
                  fontWeight: entry.rank <= 3 ? 'bold' : 'normal',
                }}
                // onClick={() => onUserClick?.(entry.user_id || '', entry.groupId || '')}
              >
                {`L${entry.cart_type}`}
              </td>
              <td
                style={{
                  padding: '20px',
                  fontSize: '1.5rem',
                  textAlign: 'center',
                  fontWeight: entry.rank <= 3 ? 'bold' : 'normal',
                }}
                // onClick={() => onUserClick?.(entry.user_id || '', entry.groupId || '')}
              >
                {entry.total_laps}
              </td>
              <td
                style={{
                  padding: '20px',
                  fontSize: '1.5rem',
                  textAlign: 'center',
                  color: theme.palette.text.primary,
                }}
              >
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
                {entry.best_lap_time ? formatLapTime(Number(entry.best_lap_time)) : '-'}
              </td>
              <td
                style={{
                  padding: '20px',
                  fontSize: '1.5rem',
                  textAlign: 'center',
                  color: theme.palette.text.primary,
                }}
              >
                {entry?.cart_variant ? `Level ${entry?.cart_variant}` : ''}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Box>
  );
};
