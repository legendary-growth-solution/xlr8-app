/* eslint-disable @typescript-eslint/no-shadow */
import { Box, Skeleton } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';

interface LeaderboardSkeletonProps {
  rowCount?: number;
}

export const LeaderboardSkeleton = ({ 
  rowCount = 5,
}: LeaderboardSkeletonProps) => {
  const theme = useTheme();

  return (
    <Box sx={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 8px' }}>
        <thead>
          <tr>
            {[
              'Rank',
              'Name',
              'Group',
              'Cart',
              'Total Laps',
              'Best Lap',
              'Best Lap Time',
              'Average Lap Time',
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
          {[...Array(rowCount)].map((_, index) => (
            <tr
              key={index}
              style={{
                backgroundColor: alpha(theme.palette.text.primary, 0.05),
              }}
            >
              {[...Array(8)].map((_, cellIndex) => (
                <td key={cellIndex} style={{ padding: '20px', textAlign: cellIndex === 0 ? 'center' : 'center' }}>
                  <Skeleton 
                    variant={cellIndex === 0 ? "circular" : "text"} 
                    width={cellIndex === 0 ? 40 : undefined} 
                    height={cellIndex === 0 ? 40 : undefined} 
                    sx={{ 
                      fontSize: '1.5rem', 
                      width: cellIndex === 1 ? '80%' : undefined, 
                    }} 
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </Box>
  );
}; 