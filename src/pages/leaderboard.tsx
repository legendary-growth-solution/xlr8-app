import { useRef, useState } from 'react';
import { Box, Button, Paper, Typography, TextField, Grid, alpha, useTheme } from '@mui/material';
import { LeaderboardTable } from 'src/components/leaderboard/LeaderboardTable';
import { LeaderboardHeader } from 'src/components/leaderboard/header-lb';
import { LeaderboardFooter } from 'src/components/leaderboard/footer-lb';
import { Leaderboard } from 'src/types/session';
import LiveLeaderboard from './live-leaderboard';

const defaultEntry = {
  rank: 1,
  group_name: '',
  total_laps: 0,
  best_lap_number: 0,
  best_lap_time: '',
  user_name: '',
  cart_name: '',
  is_disqualified: false,
  disqualification_reason: '',
  penalty_seconds: 0,
};

export default function LeaderboardPage() {
  const theme = useTheme();
  const [entries, setEntries] = useState<Leaderboard[]>([]);
  const [form, setForm] = useState<any>({ ...defaultEntry });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [zoom, setZoom] = useState(100);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const leaderboardRef = useRef<HTMLDivElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setForm((prev: any) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleAddEntry = (e: React.FormEvent) => {
    e.preventDefault();
    setEntries((prev) => [
      ...prev,
      { ...form, rank: prev.length + 1, total_laps: Number(form.total_laps), best_lap_number: Number(form.best_lap_number), penalty_seconds: Number(form.penalty_seconds) }
    ]);
    setForm({ ...defaultEntry, rank: entries.length + 2 });
  };

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', p: 3 }}>
      <Paper elevation={24} sx={{ p: 3, borderRadius: 2, maxWidth: 900, mx: 'auto', mt: 4 }}>
        <Typography variant="h2" align="center" sx={{ mb: 3, fontWeight: 'bold' }}>
          Create Leaderboard
        </Typography>
        <form onSubmit={handleAddEntry}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField label="Name" name="user_name" value={form.user_name} onChange={handleChange} fullWidth required />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="Group" name="group_name" value={form.group_name} onChange={handleChange} fullWidth />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="Cart" name="cart_name" value={form.cart_name} onChange={handleChange} fullWidth />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="Total Laps" name="total_laps" type="number" value={form.total_laps} onChange={handleChange} fullWidth />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="Best Lap" name="best_lap_number" type="number" value={form.best_lap_number} onChange={handleChange} fullWidth />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="Best Lap Time (ms)" name="best_lap_time" value={form.best_lap_time} onChange={handleChange} fullWidth />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="Penalty Seconds" name="penalty_seconds" type="number" value={form.penalty_seconds} onChange={handleChange} fullWidth />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="Disqualification Reason" name="disqualification_reason" value={form.disqualification_reason} onChange={handleChange} fullWidth />
            </Grid>
            {/* Add more fields as needed */}
            <Grid item xs={12}>
              <Button type="submit" variant="contained" color="primary" fullWidth>
                Add Entry
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
      <LiveLeaderboard entries={entries}  />
    </Box>
  );
}