import { useState, useRef, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  Box,
  Typography,
  Button,
  LinearProgress,
  Stack,
  Chip,
  Tab,
  Tabs,
  TextField,
  Divider,
  IconButton,
  alpha,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Iconify } from 'src/components/iconify';
import { showToast } from 'src/components/toast';
import { reportApi, triggerCsvDownload } from 'src/services/api/report.api';

interface Props {
  open: boolean;
  onClose: () => void;
}

interface ProgressState {
  active: boolean;
  processed: number;
  total: number;
  status: string;
}

const INITIAL_PROGRESS: ProgressState = { active: false, processed: 0, total: 0, status: '' };

function todayStr() {
  return new Date().toISOString().split('T')[0];
}
function thirtyDaysAgoStr() {
  const d = new Date();
  d.setDate(d.getDate() - 30);
  return d.toISOString().split('T')[0];
}

function ProgressCard({ progress, label }: { progress: ProgressState; label: string }) {
  const pct = progress.total > 0 ? Math.round((progress.processed / progress.total) * 100) : null;

  return (
    <Box
      sx={{
        mt: 2,
        p: 2,
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'divider',
        bgcolor: (t) => alpha(t.palette.primary.main, 0.04),
      }}
    >
      <Stack direction="row" alignItems="center" spacing={1.5} mb={1}>
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          {[0, 1, 2].map((i) => (
            <Box
              key={i}
              sx={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                bgcolor: 'primary.main',
                animation: 'pulse 1.4s ease-in-out infinite',
                animationDelay: `${i * 0.2}s`,
                '@keyframes pulse': {
                  '0%, 80%, 100%': { opacity: 0.3, transform: 'scale(0.7)' },
                  '40%': { opacity: 1, transform: 'scale(1)' },
                },
              }}
            />
          ))}
        </Box>
        <Typography variant="body2" color="text.secondary" fontWeight={500}>
          {progress.status || `Generating ${label}...`}
        </Typography>
        {pct !== null && (
          <Typography variant="body2" color="primary" fontWeight={700} ml="auto">
            {pct}%
          </Typography>
        )}
      </Stack>
      <LinearProgress
        variant={pct !== null ? 'determinate' : 'indeterminate'}
        value={pct ?? undefined}
        sx={{
          height: 6,
          borderRadius: 3,
          bgcolor: (t) => alpha(t.palette.primary.main, 0.12),
          '& .MuiLinearProgress-bar': { borderRadius: 3 },
        }}
      />
      {progress.total > 0 && (
        <Typography variant="caption" color="text.disabled" mt={0.5} display="block">
          {progress.processed} / {progress.total}
        </Typography>
      )}
    </Box>
  );
}

function FieldChip({ label, icon }: { label: string; icon: string }) {
  return (
    <Chip
      size="small"
      icon={<Iconify icon={icon} width={14} />}
      label={label}
      variant="outlined"
      sx={{ fontSize: 11, height: 24, '& .MuiChip-icon': { ml: '6px' } }}
    />
  );
}

export function ReportDownloadDialog({ open, onClose }: Props) {
  const theme = useTheme();
  const [tab, setTab] = useState(0);

  const [userProgress, setUserProgress] = useState<ProgressState>(INITIAL_PROGRESS);
  const [userCooldown, setUserCooldown] = useState(0);

  const [financeProgress, setFinanceProgress] = useState<ProgressState>(INITIAL_PROGRESS);
  const [financeCooldown, setFinanceCooldown] = useState(0);
  const [startDate, setStartDate] = useState(thirtyDaysAgoStr());
  const [endDate, setEndDate] = useState(todayStr());

  const startCooldown = (type: 'user' | 'finance', seconds: number = 10) => {
    if (type === 'user') {
      setUserCooldown(seconds);
      const timer = setInterval(() => {
        setUserCooldown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      setFinanceCooldown(seconds);
      const timer = setInterval(() => {
        setFinanceCooldown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
  };

  const handleDownloadUserReport = useCallback(async () => {
    if (userProgress.active || userCooldown > 0) return;
    setUserProgress({ active: true, processed: 0, total: 0, status: 'Starting...' });

    try {
      const csvData = await reportApi.downloadUserReport(
        (processed: number, total: number, status: string) => {
          setUserProgress({ active: true, processed, total, status });
        }
      );

      const filename = `user_report_${todayStr()}.csv`;
      triggerCsvDownload(csvData, filename);
      showToast.success(`User report downloaded! (${filename})`);
      startCooldown('user', 10);
    } catch (err: any) {
      showToast.error(err?.message || 'User report failed. Please try again.');
    } finally {
      setUserProgress(INITIAL_PROGRESS);
    }
  }, [userProgress.active, userCooldown]);

  const handleDownloadFinanceReport = useCallback(async () => {
    if (financeProgress.active || financeCooldown > 0) return;
    if (!startDate || !endDate) {
      showToast.error('Please select a valid date range.');
      return;
    }
    if (startDate > endDate) {
      showToast.error('Start date must be before end date.');
      return;
    }

    setFinanceProgress({ active: true, processed: 0, total: 0, status: 'Starting...' });

    try {
      const csvData = await reportApi.downloadFinanceReport(
        startDate,
        endDate,
        (processed: number, total: number, status: string) => {
          setFinanceProgress({ active: true, processed, total, status });
        }
      );

      const filename = `finance_report_${startDate}_to_${endDate}.csv`;
      triggerCsvDownload(csvData, filename);
      showToast.success(`Finance report downloaded! (${filename})`);
      startCooldown('finance', 10);
    } catch (err: any) {
      showToast.error(err?.message || 'Finance report failed. Please try again.');
    } finally {
      setFinanceProgress(INITIAL_PROGRESS);
    }
  }, [financeProgress.active, financeCooldown, startDate, endDate]);

  const handleClose = () => {
    if (userProgress.active || financeProgress.active) return;
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          overflow: 'hidden',
          boxShadow: (t) => t.customShadows?.z24 ?? '0 24px 48px rgba(0,0,0,0.2)',
        },
      }}
    >
      <Box
        sx={{
          background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 60%, ${alpha(theme.palette.secondary.main, 0.8)} 100%)`,
          px: 3,
          pt: 3,
          pb: 2,
          position: 'relative',
        }}
      >
        <IconButton
          size="small"
          onClick={handleClose}
          disabled={userProgress.active || financeProgress.active}
          sx={{ position: 'absolute', top: 12, right: 12, color: 'white', opacity: 0.8 }}
        >
          <Iconify icon="eva:close-fill" />
        </IconButton>

        <Stack direction="row" spacing={1.5} alignItems="center" mb={1}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: 2,
              bgcolor: alpha('#fff', 0.15),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Iconify icon="eva:download-outline" width={22} sx={{ color: 'white' }} />
          </Box>
          <Box>
            <Typography variant="h6" color="white" fontWeight={700} lineHeight={1.2}>
              Download Reports
            </Typography>
            <Typography variant="caption" sx={{ color: alpha('#fff', 0.7) }}>
              Export your data as CSV
            </Typography>
          </Box>
        </Stack>

        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          TabIndicatorProps={{ style: { backgroundColor: 'white', height: 3, borderRadius: 2 } }}
          sx={{
            mt: 1,
            minHeight: 36,
            '& .MuiTab-root': {
              color: alpha('#fff', 0.6),
              fontWeight: 600,
              fontSize: 13,
              minHeight: 36,
              px: 2,
              '&.Mui-selected': { color: 'white' },
            },
          }}
        >
          <Tab
            label="User Report"
            icon={<Iconify icon="eva:people-outline" width={16} />}
            iconPosition="start"
          />
          <Tab
            label="Finance Report"
            icon={<Iconify icon="eva:credit-card-outline" width={16} />}
            iconPosition="start"
          />
        </Tabs>
      </Box>

      <DialogContent sx={{ p: 3 }}>
        {tab === 0 && (
          <Box>
            <Typography variant="subtitle2" color="text.secondary" mb={1.5}>
              Exports all registered users with stats
            </Typography>

            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mb: 3 }}>
              <FieldChip label="Name" icon="eva:person-outline" />
              <FieldChip label="Phone" icon="eva:phone-outline" />
              <FieldChip label="Age" icon="eva:calendar-outline" />
              <FieldChip label="Email" icon="eva:email-outline" />
              <FieldChip label="Total Visits" icon="eva:repeat-outline" />
              <FieldChip label="Last Visited" icon="eva:clock-outline" />
              <FieldChip label="Total Spent (INR)" icon="eva:credit-card-outline" />
              <FieldChip label="Total Discount Availed (INR)" icon="eva:percent-outline" />
              <FieldChip label="Coupons Used" icon="eva:pricetags-outline" />
              <FieldChip label="First Visit Date" icon="eva:star-outline" />
              <FieldChip label="Best Lap Time" icon="eva:flash-outline" />
              <FieldChip label="Total Laps" icon="eva:activity-outline" />
            </Box>

            {userProgress.active && (
              <ProgressCard progress={userProgress} label="User Report" />
            )}

            <Button
              fullWidth
              variant="contained"
              size="large"
              disabled={userProgress.active || userCooldown > 0}
              onClick={handleDownloadUserReport}
              startIcon={
                userProgress.active ? undefined : <Iconify icon="eva:download-fill" />
              }
              sx={{
                mt: userProgress.active ? 2 : 0,
                borderRadius: 2,
                py: 1.5,
                fontWeight: 700,
                fontSize: 15,
                background: (userProgress.active || userCooldown > 0)
                  ? undefined
                  : `linear-gradient(135deg, ${theme.palette.primary.dark}, ${theme.palette.primary.main})`,
                boxShadow: (userProgress.active || userCooldown > 0) ? 'none' : undefined,
              }}
            >
              {userProgress.active
                ? 'Generating...'
                : userCooldown > 0
                ? `Wait ${userCooldown}s`
                : 'Download User Report'}
            </Button>
          </Box>
        )}

        {tab === 1 && (
          <Box>
            <Typography variant="subtitle2" color="text.secondary" mb={2}>
              Session-level finance data for any date range
            </Typography>

            <Stack direction="row" spacing={2} mb={2}>
              <TextField
                fullWidth
                type="date"
                label="Start Date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                disabled={financeProgress.active}
                InputLabelProps={{ shrink: true }}
                inputProps={{ max: endDate }}
                size="small"
              />
              <TextField
                fullWidth
                type="date"
                label="End Date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                disabled={financeProgress.active}
                InputLabelProps={{ shrink: true }}
                inputProps={{ min: startDate, max: todayStr() }}
                size="small"
              />
            </Stack>

            <Divider sx={{ mb: 2 }} />

            <Typography variant="caption" color="text.disabled" mb={1.5} display="block">
              Exported columns:
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mb: 2.5 }}>
              <FieldChip label="Date" icon="eva:calendar-outline" />
              <FieldChip label="Time" icon="eva:clock-outline" />
              <FieldChip label="Session Name" icon="eva:layers-outline" />
              <FieldChip label="Session ID" icon="eva:hash-outline" />
              <FieldChip label="Cart Numbers" icon="eva:car-outline" />
              <FieldChip label="Duration (min)" icon="eva:timer-outline" />
              <FieldChip label="Plan(s)" icon="eva:pricetags-outline" />
              <FieldChip label="Discount Code" icon="eva:percent-outline" />
              <FieldChip label="Discount Amount" icon="eva:minus-circle-outline" />
              <FieldChip label="Grand Total" icon="eva:checkmark-circle-outline" />
              <FieldChip label="Total Riders" icon="eva:people-outline" />
              <FieldChip label="New (First-Visit) Riders" icon="eva:star-outline" />
            </Box>

            {financeProgress.active && (
              <ProgressCard progress={financeProgress} label="Finance Report" />
            )}

            <Button
              fullWidth
              variant="contained"
              size="large"
              color="success"
              disabled={financeProgress.active || financeCooldown > 0}
              onClick={handleDownloadFinanceReport}
              startIcon={
                financeProgress.active ? undefined : <Iconify icon="eva:download-fill" />
              }
              sx={{
                mt: financeProgress.active ? 2 : 0,
                borderRadius: 2,
                py: 1.5,
                fontWeight: 700,
                fontSize: 15,
                background: (financeProgress.active || financeCooldown > 0)
                  ? undefined
                  : `linear-gradient(135deg, ${theme.palette.success.dark}, ${theme.palette.success.main})`,
                boxShadow: (financeProgress.active || financeCooldown > 0) ? 'none' : undefined,
              }}
            >
              {financeProgress.active
                ? 'Generating...'
                : financeCooldown > 0
                ? `Wait ${financeCooldown}s`
                : 'Download Finance Report'}
            </Button>

            <Typography variant="caption" color="text.disabled" mt={1.5} display="block" textAlign="center">
              Tip: for large date ranges ({'>'} 90 days), generation may take a few minutes.
            </Typography>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
}
