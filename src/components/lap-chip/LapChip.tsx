import { Chip, Tooltip } from "@mui/material";
import React from "react";

interface LapChipProps {
  label: string;
  tooltip: string;
  color: "success" | "primary" | "error" | "info" | "warning" | "default" | "secondary";
}

const LapChip: React.FC<LapChipProps> = ({ label, tooltip, color }) => (
  <Tooltip title={tooltip}>
    <Chip
      label={label}
      color={color}
      size="small"
      sx={{
        fontWeight: 'bold',
        marginLeft: 0.5,
        fontSize: '10px',
        maxHeight : 20,

        '& .MuiChip-label': {
          padding: '0px 8px',
        },
      }}
    />
  </Tooltip>
);

export default LapChip;

export const SessionBestChip: React.FC = () => (
  <LapChip 
    label="SB" 
    tooltip="Session Best - Fastest lap time in the entire session" 
    color="success"
  />
);

export const PersonalSessionBestChip: React.FC = () => (
  <LapChip 
    label="PSB" 
    tooltip="Personal Session Best - User's fastest lap time in this session" 
    color="primary"
  />
); 