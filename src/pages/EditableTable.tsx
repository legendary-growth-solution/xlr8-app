import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import {
  Box,
  Button,
  CircularProgress,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
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
  is_manual : boolean;
}

interface EditableTableProps {
  sessionId: string;
  userId: string;
  groupId: string;
}

const EditableTable: React.FC<EditableTableProps> = ({ sessionId, userId, groupId }) => {
  const [lapData, setLapData] = useState<Lap[]>([]);
  const [editRowId, setEditRowId] = useState<string | null>(null);
  const [editedRow, setEditedRow] = useState<Partial<Lap>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [newLap, setNewLap] = useState<Partial<Lap>>({
    lap_time: 0,
    lap_number: 0,
    timestamp: new Date().toISOString(),
    last_ts: "",
    is_manual: false,
  });

  // delete_lap
  // update_lap
  useEffect(() => {
    // Fetch lap data from the API
    if(groupId && userId){
    axios
      .get<Lap[]>(`http://127.0.0.1:5000/api/sessions/${groupId}/${userId}`)
      .then((response : any) => {
        setLapData(response.data.laps);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching lap data:", error);
        setLoading(false);
      });
    }
  }, [groupId, userId]);

  const handleEdit = (id: string, row: Lap) => {
    setEditRowId(id);
    setEditedRow(row);
  };

  const handleSave = async () => {
    if (editRowId) {
      await axios
        .put("http://127.0.0.1:5000/api/sessions/update-lap", { id: editRowId, updates: editedRow })
        .then(() => {
          setLapData((prevData) =>
            prevData.map((row) =>
              row.id === editRowId ? { ...row, ...editedRow } : row
            )
          );
        })
        .catch((error) => console.error("Error updating lap:", error));
    }
    setEditRowId(null);
    setEditedRow({});
  };

  const handleDelete = async (id: string) => {
    await axios
      .delete(`http://127.0.0.1:5000/api/sessions/delete-lap/${id}`)
      .then(() =>
        setLapData((prevData) => prevData.filter((row) => row.id !== id))
      )
      .catch((error) => console.error("Error deleting lap:", error));
  };

  const handleAdd = async () => {
    const newLapData = {
      ...newLap,
      group_id: groupId,
      user_id: userId,
    };

    await axios
      .post("http://127.0.0.1:5000/api/sessions/add-lap", newLapData)
      .then((response) => {
        setLapData((prevData) => [...prevData, response.data]);
        setNewLap({
          lap_time: 0,
          lap_number: 0,
          timestamp: "",
          // timestamp: new Date().toISOString(),
          last_ts: "",
          is_manual: true,
        });
      })
      .catch((error) => console.error("Error adding lap:", error));
  };

  const handleChange = (field: keyof Lap, value: string | number) => {
    setEditedRow((prevRow) => ({
      ...prevRow,
      [field]: value,
    }));
  };

  const handleNewLapChange = (field: keyof Lap, value: string | number) => {
    setNewLap((prevLap) => ({
      ...prevLap,
      [field]: value,
    }));
  };

  return (
    <Box>
      
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Lap Time</TableCell>
              <TableCell>Lap Number</TableCell>
              {/* <TableCell>Timestamp</TableCell> */}
              {/* <TableCell>Last TS</TableCell> */}
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>

          {loading && (
                            <Box
                              sx={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '100%',
                                height: '100%',
                                backgroundColor: 'rgba(255, 255, 255, 0.6)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                borderRadius: 1, // match card corners if desired
                                zIndex: 9999, // ensure it’s on top
                              }}
                            >
                              <CircularProgress />
                            </Box>
                          )}
          <TableBody>
            {lapData && lapData?.map((row) => (
              <TableRow key={row.id}>
                <TableCell>
                  {editRowId === row.id ? (
                    <TextField
                      type="number"
                      value={editedRow.lap_time ?? row.lap_time}
                      onChange={(e) =>
                        handleChange("lap_time", parseFloat(e.target.value))
                      }
                    />
                  ) : (
                    row.lap_time
                  )}
                </TableCell>
                <TableCell>
                  {editRowId === row.id ? (
                    <TextField
                      type="number"
                      value={editedRow.lap_number ?? row.lap_number}
                      onChange={(e) =>
                        handleChange("lap_number", parseInt(e.target.value, 10))
                      }
                    />
                  ) : (
                    row.lap_number
                  )}
                </TableCell>
                {/* <TableCell>{row.timestamp}</TableCell> */}
                {/* <TableCell>{row.last_ts}</TableCell> */}
                <TableCell>
                  {editRowId === row.id ? (
                    <Button onClick={handleSave} variant="contained">
                      Save
                    </Button>
                  ) : (
                    <Button
                      onClick={() => handleEdit(row.id, row)}
                      variant="contained"
                    >
                      Edit
                    </Button>
                  )}
                  <IconButton
                    onClick={() => handleDelete(row.id)}
                    color="error"
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {/* Add New Record Row */}
            <TableRow>
              <TableCell>
                <TextField
                  type="number"
                  value={newLap.lap_time}
                  onChange={(e) =>
                    handleNewLapChange("lap_time", parseFloat(e.target.value))
                  }
                  placeholder="Lap Time"
                />
              </TableCell>
              <TableCell>
                <TextField
                  type="number"
                  value={newLap.lap_number}
                  onChange={(e) =>
                    handleNewLapChange("lap_number", parseInt(e.target.value, 10))
                  }
                  placeholder="Lap Number"
                />
              </TableCell>
              {/* <TableCell>
                <TextField
                  type="datetime-local"
                  value={newLap.timestamp}
                  onChange={(e) => handleNewLapChange("timestamp", e.target.value)}
                />
              </TableCell> */}
              {/* <TableCell>
                <TextField
                  value={newLap.last_ts}
                  onChange={(e) => handleNewLapChange("last_ts", e.target.value)}
                  placeholder="Last TS"
                />
              </TableCell> */}
              <TableCell>
                <IconButton onClick={handleAdd} color="primary">
                  <AddIcon />
                </IconButton>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default EditableTable;
