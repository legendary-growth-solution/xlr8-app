import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Tooltip,
  Typography,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { alpha, useTheme } from '@mui/material/styles';
import { RankCircle } from 'src/components/leaderboard/RankCircle';
import { SessionLapTableSkeleton } from 'src/components/skeleton';
import { api } from "src/api/api";
import LapChip, { SessionBestChip, PersonalSessionBestChip } from 'src/components/lap-chip/LapChip';

interface Lap {
  id: string;
  lap_time: number;
  lap_number: number;
  timestamp: string;
  last_ts: string;
  user_id: string;
  user_name: string;
  duration?: number;
}

interface GroupedLap {
  lap_number: number;
  users: {
    user_name: string;
    user_id: string;
    lap_time: number;
    isSessionBest?: boolean;
    isUserBest?: boolean;
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
  const [sessionBestTime, setSessionBestTime] = useState<number | null>(null);
  const theme = useTheme();

  useEffect(() => {
    if (sessionId) {
      api.session
        .getSessionLaps(sessionId)
        .then((response: any) => {
          const {laps} = response;
          
          // Find the best lap time in the entire session
          let bestTime = Number.MAX_VALUE;
          laps.forEach((lap: Lap) => {
            if (lap.duration && lap.duration < bestTime) {
              bestTime = lap.duration;
            }
          });
          
          setSessionBestTime(bestTime !== Number.MAX_VALUE ? bestTime : null);
          
          // Find best lap times for each user
          const userBestLaps: Record<string, number> = {};
          laps.forEach((lap: Lap) => {
            if (lap.duration) {
              if (!userBestLaps[lap.user_id] || lap.duration < userBestLaps[lap.user_id]) {
                userBestLaps[lap.user_id] = lap.duration;
              }
            }
          });
          
          const grouped = Object.values(
            laps.reduce((acc: any, lap: Lap) => {
              if (!acc[lap.lap_number]) {
                acc[lap.lap_number] = {
                  lap_number: lap.lap_number,
                  users: [],
                };
              }
              acc[lap.lap_number].users.push({
                user_name: lap.user_name,
                user_id: lap.user_id,
                lap_time: lap.duration,
                isSessionBest: lap.duration === bestTime,
                isUserBest: lap.duration === userBestLaps[lap.user_id],
              });
              return acc;
            }, {})
          ).map((lap: any) => ({
            ...lap,
            users: lap.users.sort((a: any, b: any) => a.lap_time - b.lap_time)
          }));
          setGroupedLapData(grouped as GroupedLap[]);
          setLoading(false);
        })
        .catch((error) => {
          console.error("Error fetching lap data:", error);
          setLoading(false);
        });
    }
  }, [sessionId]);

  return (
    <Box sx={{ width: '100%', overflowX: 'auto', display: 'flex', flexDirection: 'column' }}>
      {loading ? (
        <SessionLapTableSkeleton />
      ) : (
        <>
          <TableContainer 
            component={Paper}
            sx={{ 
              maxHeight: 'calc(100vh - 200px)',
            }}
          >
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>Lap Number</TableCell>
                  <TableCell>Racers</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {groupedLapData.map((lap) => (
                  <TableRow key={lap.lap_number}>
                    <TableCell sx={{ fontSize: '32px' }}>{lap.lap_number}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        {lap.users.map((user, index) => (
                          <Box
                            key={index}
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
                              <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                                <Chip
                                  label={
                                    <Box sx={{ 
                                      display: 'flex', 
                                      alignItems: 'center',
                                      justifyContent: 'space-between',
                                      width: '100%'
                                    }}>
                                      <div>{user?.user_name}</div>
                                      <Box sx={{ display: 'flex', ml: 0.5 }}>
                                        {user.isSessionBest && <SessionBestChip />}
                                        {user.isUserBest && !user.isSessionBest && <PersonalSessionBestChip />}
                                      </Box>
                                    </Box>
                                  }
                                  variant="outlined"
                                  sx={{
                                    flex: 1,
                                    justifyContent: 'flex-start',
                                  }}
                                />
                              </Box>
                              <Chip
                                label={`${user?.lap_time?.toFixed(2)}s`}
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
          
          <Box 
            component={Paper} 
            sx={{ 
              mt: 2, 
              p: 2, 
              display: 'flex',
              flexDirection: 'column',
              gap: 1
            }}
          >
            <Typography variant="subtitle2" fontWeight="bold">
              Abbreviations:
            </Typography>
            <Box sx={{ display: 'flex', gap: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <SessionBestChip />
                <Typography variant="body2">Session Best</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <PersonalSessionBestChip />
                <Typography variant="body2">Personal Session Best</Typography>
              </Box>
            </Box>
          </Box>
        </>
      )}
    </Box>
  );
};

export default SessionLapTable;
