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
              'Best Lap',
              'Best Lap Time',
              'Total Laps',
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
              <td style={{ padding: '20px', textAlign: 'center' }}>
                <Skeleton 
                  variant="circular" 
                  width={40} 
                  height={40} 
                />
              </td>
              <td style={{ padding: '20px' }}>
                <Skeleton 
                  variant="text" 
                  sx={{ 
                    fontSize: '1.5rem', 
                    width: '80%', 
                  }} 
                />
              </td>
              <td style={{ padding: '20px', textAlign: 'center' }}>
                <Skeleton 
                  variant="text" 
                  sx={{ 
                    fontSize: '1.5rem', 
                }} 
                />
              </td>
              <td style={{ padding: '20px', textAlign: 'center' }}>
                <Skeleton 
                  variant="text" 
                  sx={{ 
                    fontSize: '1.5rem', 
                  }} 
                />
              </td>
              <td style={{ padding: '20px', textAlign: 'center' }}>
                <Skeleton 
                  variant="text" 
                  sx={{ 
                    fontSize: '1.5rem', 
                  }} 
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Box>
  );
}; 