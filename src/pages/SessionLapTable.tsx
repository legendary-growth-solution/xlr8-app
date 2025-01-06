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
  Chip,
} from "@mui/material";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { alpha, useTheme } from '@mui/material/styles';
import { RankCircle } from 'src/components/leaderboard/RankCircle';

interface Lap {
  id: string;
  lap_time: number;
  lap_number: number;
  timestamp: string;
  last_ts: string;
  user_id: string;
  user_name: string;
}

interface GroupedLap {
  lap_number: number;
  users: {
    user_name: string;
    lap_time: number;
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

  useEffect(() => {
    if (sessionId) {
      axios
        .get<Lap[]>(`http://127.0.0.1:5000/api/sessions/lap-data/${sessionId}`)
        .then((response: any) => {
          const laps = response.data.laps;
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
                lap_time: lap.lap_time,
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
    <Box sx={{ width: '100%', overflowX: 'auto' }}>
      {loading ? (
        <CircularProgress />
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Lap Number</TableCell>
                <TableCell>Racers</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {groupedLapData.map((lap) => (
                <TableRow key={lap.lap_number}>
                  <TableCell>{lap.lap_number}</TableCell>
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
                            <Chip
                              label={user?.user_name}
                              variant="outlined"
                              sx={{
                                flex: 1,
                                justifyContent: 'flex-start',
                              }}
                            />
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
      )}
    </Box>
  );
};

export default SessionLapTable;
