import { Box, Button, Stack, Typography } from "@mui/material";
import React from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate, useParams } from "react-router-dom";
import { Iconify } from "src/components/iconify";
import SessionLapTable from "./SessionLapTable";

interface RouteParams {
  groupId: string;
}

const App: React.FC = () => {
  const { id } = useParams<any>();
  const navigate = useNavigate();

  return (
    <div>
      <Helmet>
        <title>Session Lap Records</title>
      </Helmet>

      <Box sx={{ p: 3 }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} alignItems="center" justifyContent="space-between" spacing={2} mb={5}>
          <Stack direction="column" spacing={2}>
            <Typography variant="h4">Lap Records for Session</Typography>
          </Stack>
          <Stack direction="row" spacing={2}>
            <Button
              variant="outlined"
              startIcon={<Iconify icon="eva:arrow-back-fill" />}
              onClick={() => navigate(-1)}
            >
              Back
            </Button>
          </Stack>
        </Stack>
      <SessionLapTable sessionId={id || ''}/>
      </Box>
    </div>
  );
};

export default App;
