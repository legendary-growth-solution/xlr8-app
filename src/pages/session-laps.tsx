import { Box, Button, Stack, Typography, ToggleButton, ToggleButtonGroup } from '@mui/material';
import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate, useParams } from 'react-router-dom';
import { Iconify } from 'src/components/iconify';
import SessionLapTable from './SessionLapTable';
import SessionLapGraph from './SessionLapGraph';

interface RouteParams {
  groupId: string;
}

const App: React.FC = () => {
  const { id } = useParams<any>();
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<'table' | 'graph'>('table');

  const handleViewChange = (event: React.MouseEvent<HTMLElement>, newView: 'table' | 'graph') => {
    if (newView !== null) {
      setViewMode(newView);
    }
  };

  return (
    <div>
      <Helmet>
        <title>Session Lap Records</title>
      </Helmet>

      <Box sx={{ p: 3 }}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          alignItems="center"
          justifyContent="space-between"
          spacing={2}
          mb={5}
        >
          <Stack direction="column" spacing={2}>
            <Typography variant="h4">Lap Records for Session</Typography>
          </Stack>
          <Stack direction="row" spacing={2} alignItems="center">
            <ToggleButtonGroup
              value={viewMode}
              exclusive
              onChange={handleViewChange}
              aria-label="view mode"
              size="small"
            >
              <ToggleButton value="table" aria-label="table view">
                <Iconify icon="mdi:table" sx={{ mr: 0.5 }} /> Table
              </ToggleButton>
              <ToggleButton value="graph" aria-label="graph view">
                <Iconify icon="mdi:chart-line" sx={{ mr: 0.5 }} /> Graph
              </ToggleButton>
            </ToggleButtonGroup>
            <Button
              variant="outlined"
              startIcon={<Iconify icon="eva:arrow-back-fill" />}
              onClick={() => navigate(-1)}
            >
              Back
            </Button>
          </Stack>
        </Stack>

        {viewMode === 'table' ? (
          <SessionLapTable sessionId={id || ''} />
        ) : (
          <SessionLapGraph sessionId={id || ''} />
        )}
      </Box>
    </div>
  );
};

export default App;
