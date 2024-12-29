import { Box, Button, Stack, Typography } from "@mui/material";
import React from "react";
import { Helmet } from "react-helmet-async";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Iconify } from "src/components/iconify";
import EditableTable from "./EditableTable";

// Define the URL parameters' type
interface RouteParams {
  groupId: string;
  userId: string;
}

const App: React.FC = () => {
  const { id, user } = useParams<any>();
  const location = useLocation();
  const { name } = location.state || {};
  const navigate = useNavigate();

  return (
    <div>
      <Helmet>
        <title>User Lap Records</title>
      </Helmet>

      <Box sx={{ p: 3 }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} alignItems="center" justifyContent="space-between" spacing={2} mb={5}>
          <Stack direction="column" spacing={2}>
            <Typography variant="h4">Lap Records for {name}</Typography>
          </Stack>
          <Stack direction="row" spacing={2}>
            <Button
              variant="outlined"
              startIcon={<Iconify icon="eva:arrow-back-fill" />}
              onClick={() => navigate('/sessions')}
            >
              Back
            </Button>
          </Stack>
        </Stack>
        <EditableTable sessionId={id || ''} userId={user || ''} />
      </Box>
    </div>
  );
};

export default App;
