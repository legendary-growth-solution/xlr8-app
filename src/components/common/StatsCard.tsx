import { Card, Typography } from '@mui/material';

interface StatsCardProps {
  title: string;
  value: string | number;
  color?: string;
}

export default function StatsCard({ title, value, color }: StatsCardProps) {
  return (
    <Card sx={{ p: 3 }}>
      <Typography variant="subtitle2" sx={{ mb: 2 }}>{title}</Typography>
      <Typography variant="h3" color={color}>{value}</Typography>
    </Card>
  );
} 