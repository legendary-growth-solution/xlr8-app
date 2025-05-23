/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
import { Box, Typography, Tooltip } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import { Leaderboard } from 'src/types/session';
import { formatLapTime } from 'src/utils/timeFormatter';
import { RankCircle } from './RankCircle';
import { LeaderboardSkeleton } from '../skeleton';
import { Iconify } from '../iconify';

type LeaderboardTableProps = {
  entries: Leaderboard[];
  loading?: boolean;
  isInactiveSession?: boolean;
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
          {entries?.map((entry) => {
            const isDisqualified = entry.is_disqualified;
            const hasPenalty = !isDisqualified && entry.penalty_seconds !== undefined && entry.penalty_seconds > 0;
            
            return (
              <tr
                key={entry.rank}
                style={{
                  backgroundColor: isDisqualified 
                    ? alpha(theme.palette.error.main, 0.05)
                    : getRankColor(entry.rank, theme),
                  opacity: isDisqualified ? 0.85 : 1,
                  position: 'relative',
                }}
              >
                <td style={{ padding: '20px', textAlign: 'center' }}>
                  <RankCircle rank={entry.rank} />
                </td>
                <td
                  style={{
                    padding: '20px',
                    fontSize: '1.5rem',
                    fontWeight: !isDisqualified && entry.rank <= 3 ? 'bold' : 'normal',
                    color: isDisqualified 
                      ? theme.palette.error.main 
                      : theme.palette.text.primary,
                    cursor: entry.user_id ? 'pointer' : 'default',
                    textDecoration: isDisqualified ? 'line-through' : 'none',
                  }}
                  onClick={() => {
                    if (entry.user_id) {
                      window.location.href = `/users/${entry.user_id}/stats`;
                    }
                  }}
                >
                  {entry.user_name}
                  {isDisqualified && (
                    <Tooltip title={entry.disqualification_reason || "No reason provided"}>
                      <Box component="span" sx={{ display: 'inline-flex', ml: 1, color: 'error.main' }}>
                        <Iconify icon="mdi:flag" width={24} />
                      </Box>
                    </Tooltip>
                  )}
                </td>
                <td
                  style={{
                    padding: '20px',
                    fontSize: '1.5rem',
                    fontWeight: !isDisqualified && entry.rank <= 3 ? 'bold' : 'normal',
                    color: theme.palette.text.primary,
                    textAlign: 'center',
                    whiteSpace: 'nowrap',
                    opacity: isDisqualified ? 0.6 : 1,
                  }}
                >
                  {entry.group_name}
                </td>
                <td
                  style={{
                    padding: '20px',
                    fontSize: '1.5rem',
                    fontWeight: !isDisqualified && entry.rank <= 3 ? 'bold' : 'normal',
                    opacity: isDisqualified ? 0.6 : 1,
                    textAlign: 'center',
                  }}
                >
                  {`${entry.cart_name}`}
                </td>
                <td
                  style={{
                    padding: '20px',
                    fontSize: '1.5rem',
                    textAlign: 'center',
                    fontWeight: !isDisqualified && entry.rank <= 3 ? 'bold' : 'normal',
                    opacity: isDisqualified ? 0.6 : 1,
                  }}
                >
                  {isDisqualified ? "–" : entry.total_laps}
                </td>
                <td
                  style={{
                    padding: '20px',
                    fontSize: '1.5rem',
                    textAlign: 'center',
                    color: theme.palette.text.primary,
                    opacity: isDisqualified ? 0.6 : 1,
                  }}
                >
                  {isDisqualified ? "–" : entry.best_lap_number}
                </td>
                <td
                  style={{
                    padding: '20px',
                    fontSize: '1.5rem',
                    textAlign: 'center',
                    color: isDisqualified 
                      ? theme.palette.error.main
                      : entry.best_lap_time
                        ? hasPenalty
                          ? theme.palette.warning.main
                          : theme.palette.success.main
                        : theme.palette.text.secondary,
                    opacity: isDisqualified ? 0.6 : 1,
                  }}
                >
                  {isDisqualified ? (
                    "NA"
                  ) : hasPenalty && entry.original_best_lap_time ? (
                    <Tooltip title={`Original lap time: ${formatLapTime(Number(entry.original_best_lap_time))}`}>
                      <span>
                        {formatLapTime(Number(entry.best_lap_time))}
                        <Typography 
                          component="span" 
                          sx={{ 
                            fontSize: '1rem', 
                            ml: 1, 
                            color: 'warning.main',
                            fontWeight: 'bold'
                          }}
                        >
                          (+{entry.penalty_seconds}s)
                        </Typography>
                      </span>
                    </Tooltip>
                  ) : entry.best_lap_time ? (
                    formatLapTime(Number(entry.best_lap_time))
                  ) : (
                    '-'
                  )}
                </td>
                {/* <td
                  style={{
                    padding: '20px',
                    fontSize: '1.5rem',
                    textAlign: 'center',
                    color: isDisqualified
                      ? theme.palette.error.main
                      : hasPenalty
                        ? theme.palette.warning.main
                        : theme.palette.success.main,
                  }}
                >
                  {isDisqualified ? (
                    "DQ"
                  ) : hasPenalty ? (
                    "PENALTY"
                  ) : (
                    "OK"
                  )}
                </td> */}
              </tr>
            );
          })}
        </tbody>
      </table>
    </Box>
  );
};
