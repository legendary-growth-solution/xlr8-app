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
} from "@mui/material";
import axios from "axios";
import React, { useEffect, useState } from "react";

// Define types for lap data
interface Lap {
  id: string;
  lap_time: number;
  lap_number: number;
  timestamp: string;
  last_ts: string;
  user_id: string;
}

interface EditableTableProps {
  sessionId: string;
}

const SessionLapTable: React.FC<EditableTableProps> = ({ sessionId }) => {
  const [lapData, setLapData] = useState<Lap[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Fetch lap data on component mount or sessionId change
  useEffect(() => {
    if (sessionId) {
      axios
        .get<Lap[]>(`http://127.0.0.1:5000/api/sessions/lap-data/${sessionId}`)
        .then((response: any) => {
          setLapData(response.data.laps);
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
                <TableCell>Lap Time (seconds)</TableCell>
                <TableCell>User ID</TableCell>
                <TableCell>Timestamp</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {lapData.map((lap) => (
                <TableRow key={lap.id}>
                  <TableCell>{lap.lap_number}</TableCell>
                  <TableCell>{lap.lap_time}</TableCell>
                  <TableCell>{lap.user_id}</TableCell>
                  <TableCell>{new Date(lap.timestamp).toLocaleString()}</TableCell>
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
