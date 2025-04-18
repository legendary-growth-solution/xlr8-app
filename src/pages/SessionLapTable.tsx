import {
  Box,
  CircularProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Chip,
} from "@mui/material";
import React, { useCallback, useEffect, useState } from "react";
import { alpha, useTheme } from '@mui/material/styles';
import { RankCircle } from 'src/components/leaderboard/RankCircle';
import { api } from "src/api/api";
import { formatLapTime } from "src/utils/timeFormatter";

interface Lap {
  duration: number;
  user_name: string;
  lap_number: number;
  lap_id: string;
}

interface GroupedLap {
  lap_number: number;
  users: {
    user_name: string;
    duration: number;
  }[];
}

interface EditableTableProps {
  sessionId: string;
}

const getRankColor = (rank: number, theme: any) => {
  switch (rank) {
    case 1:
      return alpha(theme.palette.warning.main, 0.1);
    case 2:
      return alpha('#C0C0C0', 0.1);
    case 3:
      return alpha('#CD7F32', 0.1);
    default:
      return 'transparent';
  }
};

const SessionLapTable: React.FC<EditableTableProps> = ({ sessionId }) => {
  const [groupedLapData, setGroupedLapData] = useState<GroupedLap[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const theme = useTheme();

  const getSessionLapData = useCallback(() => {
    setLoading(true);
    api.session.getSessionLaps(sessionId)
      .then((response: any) => {
        const laps = response.laps;
        // Group laps by lap_number and sort users by duration
        const groupedByLapNumber = laps.reduce((acc: { [key: number]: GroupedLap }, lap: Lap) => {
          if (!acc[lap.lap_number]) {
            acc[lap.lap_number] = {
              lap_number: lap.lap_number,
              users: [],
            };
          }
          acc[lap.lap_number].users.push({
            user_name: lap.user_name,
            duration: lap.duration,
          });
          return acc;
        }, {});

        // Sort users within each lap by duration
        (Object.values(groupedByLapNumber) as GroupedLap[]).forEach((group: GroupedLap) => {
          group.users.sort((a, b) => a.duration - b.duration);
        });

        // Convert to array and sort by lap number
        const sortedGroups = (Object.values(groupedByLapNumber) as GroupedLap[])
          .sort((a, b) => a.lap_number - b.lap_number);
        setGroupedLapData(sortedGroups);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching lap data:", error);
        setLoading(false);
      });
  }, [sessionId]);

  useEffect(() => {
    getSessionLapData();
  }, [getSessionLapData]);

  return (
    <Box sx={{ width: '100%', overflowX: 'auto' }}>
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Lap</TableCell>
                <TableCell>Racers</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {groupedLapData.map((lap) => (
                <TableRow key={lap.lap_number}>
                  <TableCell>
                    <Typography variant="h6">
                      {lap.lap_number + 1}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      {lap.users.map((user, index) => (
                        <Box
                          key={`${lap.lap_number}-${index}`}
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 2,
                            backgroundColor: getRankColor(index + 1, theme),
                            p: 1,
                            borderRadius: 1,
                            width: '100%'
                          }}
                        >
                          <RankCircle rank={index + 1} />
                          <Box sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                            flex: 1,
                            justifyContent: 'space-between'
                          }}>
                            <Chip
                              label={user.user_name}
                              variant="outlined"
                              sx={{
                                flex: 1,
                                justifyContent: 'flex-start',
                              }}
                            />
                            <Chip
                              // label={`${user?.lap_time?.toFixed(2)}s`}
                              label={formatLapTime(user?.duration)}
                              color={index === 0 ? "warning" : "default"}
                              sx={{
                                minWidth: '100px',
                                justifyContent: 'center',
                                opacity: 0.7,
                              }}
                            />
                          </Box>
                        </Box>
                      ))}
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default SessionLapTable;
