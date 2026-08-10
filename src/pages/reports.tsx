import { useState, useEffect, useCallback, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';

import {
  Box,
  Card,
  Grid,
  Chip,
  Stack,
  Button,
  TextField,
  Typography,
  Tab,
  Tabs,
  LinearProgress,
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';

import { Iconify } from 'src/components/iconify';
import { showToast } from 'src/components/toast';
import { reportApi, triggerCsvDownload } from 'src/services/api/report.api';

import {
  ReportType,
  USER_FIELDS,
  FINANCE_FIELDS,
  DISCOUNT_FIELDS,
  UTILIZATION_FIELDS,
  LEADERBOARD_FIELDS,
  parseCsv,
} from 'src/components/reports/types';
import { ReportVisuals } from 'src/components/reports/ReportVisuals';
import { ReportTablePreview } from 'src/components/reports/ReportTablePreview';

const COOLDOWN_SECONDS = 10;

export default function ReportsPage() {
  const theme = useTheme();
  const [currentTab, setCurrentTab] = useState<ReportType>('user');

  const [selectedUserFields, setSelectedUserFields] = useState<string[]>(USER_FIELDS.map((f) => f.key));
  const [selectedFinanceFields, setSelectedFinanceFields] = useState<string[]>(FINANCE_FIELDS.map((f) => f.key));
  const [selectedDiscountFields, setSelectedDiscountFields] = useState<string[]>(DISCOUNT_FIELDS.map((f) => f.key));
  const [selectedUtilizationFields, setSelectedUtilizationFields] = useState<string[]>(UTILIZATION_FIELDS.map((f) => f.key));
  const [selectedLeaderboardFields, setSelectedLeaderboardFields] = useState<string[]>(LEADERBOARD_FIELDS.map((f) => f.key));

  const todayStr = new Date().toISOString().split('T')[0];
  const thirtyDaysAgoStr = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const [userFilters, setUserFilters] = useState({
    last_visit_after: '',
    last_visit_before: '',
    min_spent: '',
    max_spent: '',
    min_visits: '',
    coupon: '',
  });

  const [financeFilters, setFinanceFilters] = useState({
    start_date: thirtyDaysAgoStr,
    end_date: todayStr,
    min_grand_total: '',
    max_grand_total: '',
    discount_code: '',
  });

  const [discountFilters, setDiscountFilters] = useState({
    code: '',
  });

  const [utilizationFilters, setUtilizationFilters] = useState({
    start_date: thirtyDaysAgoStr,
    end_date: todayStr,
  });

  const [downloading, setDownloading] = useState(false);
  const [progress, setProgress] = useState({ processed: 0, total: 0, status: '' });
  const [cooldown, setCooldown] = useState(0);

  const [previewData, setPreviewData] = useState<{
    type: string;
    filename: string;
    headers: string[];
    rows: string[][];
    rawCsv: string;
  } | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (cooldown <= 0) return undefined;
    const timer = setInterval(() => {
      setCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const getFieldsForTab = useCallback(
    (tab: ReportType) => {
      switch (tab) {
        case 'user':
          return { fields: USER_FIELDS, selected: selectedUserFields, set: setSelectedUserFields };
        case 'finance':
          return { fields: FINANCE_FIELDS, selected: selectedFinanceFields, set: setSelectedFinanceFields };
        case 'discount':
          return { fields: DISCOUNT_FIELDS, selected: selectedDiscountFields, set: setSelectedDiscountFields };
        case 'utilization':
          return { fields: UTILIZATION_FIELDS, selected: selectedUtilizationFields, set: setSelectedUtilizationFields };
        case 'leaderboard':
          return { fields: LEADERBOARD_FIELDS, selected: selectedLeaderboardFields, set: setSelectedLeaderboardFields };
        default:
          return { fields: USER_FIELDS, selected: selectedUserFields, set: setSelectedUserFields };
      }
    },
    [
      selectedUserFields,
      selectedFinanceFields,
      selectedDiscountFields,
      selectedUtilizationFields,
      selectedLeaderboardFields,
    ]
  );

  const toggleField = (key: string, tab: ReportType) => {
    const { selected, set } = getFieldsForTab(tab);
    set(selected.includes(key) ? selected.filter((k) => k !== key) : [...selected, key]);
  };

  const handleSelectAll = (tab: ReportType) => {
    const { fields, set } = getFieldsForTab(tab);
    set(fields.map((f) => f.key));
  };

  const handleClearAll = (tab: ReportType) => {
    const { set } = getFieldsForTab(tab);
    set([]);
  };

  const handleExport = useCallback(async () => {
    if (cooldown > 0 || downloading) return;

    const { selected } = getFieldsForTab(currentTab);
    if (selected.length === 0) {
      showToast.warning('Please select at least one field to export.');
      return;
    }

    setDownloading(true);
    setProgress({ processed: 0, total: 0, status: 'Connecting to server...' });

    try {
      let csvData = '';
      let filename = `Report_${new Date().toISOString().split('T')[0]}.csv`;

      if (currentTab === 'user') {
        csvData = await reportApi.downloadUserReport(selectedUserFields, userFilters, (p, t, s) => setProgress({ processed: p, total: t, status: s }));
        filename = `User_Report_${todayStr}.csv`;
      } else if (currentTab === 'finance') {
        if (!financeFilters.start_date || !financeFilters.end_date) {
          showToast.warning('Please select start and end dates.');
          setDownloading(false);
          return;
        }
        csvData = await reportApi.downloadFinanceReport(financeFilters.start_date, financeFilters.end_date, selectedFinanceFields, financeFilters, (p, t, s) => setProgress({ processed: p, total: t, status: s }));
        filename = `Finance_Report_${financeFilters.start_date}_to_${financeFilters.end_date}.csv`;
      } else if (currentTab === 'discount') {
        csvData = await reportApi.downloadDiscountReport(selectedDiscountFields, discountFilters, (p, t, s) => setProgress({ processed: p, total: t, status: s }));
        filename = `Discount_ROI_Report_${todayStr}.csv`;
      } else if (currentTab === 'utilization') {
        if (!utilizationFilters.start_date || !utilizationFilters.end_date) {
          showToast.warning('Please select start and end dates.');
          setDownloading(false);
          return;
        }
        csvData = await reportApi.downloadUtilizationReport(utilizationFilters.start_date, utilizationFilters.end_date, selectedUtilizationFields, utilizationFilters, (p, t, s) => setProgress({ processed: p, total: t, status: s }));
        filename = `Track_Utilization_${utilizationFilters.start_date}_to_${utilizationFilters.end_date}.csv`;
      } else if (currentTab === 'leaderboard') {
        csvData = await reportApi.downloadLeaderboardReport(selectedLeaderboardFields, {}, (p, t, s) => setProgress({ processed: p, total: t, status: s }));
        filename = `Racer_Leaderboard_Report_${todayStr}.csv`;
      }

      triggerCsvDownload(csvData, filename);

      const parsed = parseCsv(csvData);
      setPreviewData({
        type: currentTab,
        filename,
        headers: parsed.headers,
        rows: parsed.rows,
        rawCsv: csvData,
      });
      setPage(0);
      setSearchQuery('');

      showToast.success('Report downloaded and graphical analytics loaded!');
      setCooldown(COOLDOWN_SECONDS);
    } catch (err: any) {
      showToast.error(err.message || 'Failed to generate report');
    } finally {
      setDownloading(false);
    }
  }, [
    cooldown,
    downloading,
    currentTab,
    getFieldsForTab,
    selectedUserFields,
    selectedFinanceFields,
    selectedDiscountFields,
    selectedUtilizationFields,
    selectedLeaderboardFields,
    userFilters,
    financeFilters,
    discountFilters,
    utilizationFilters,
    todayStr,
  ]);

  const activeTabConfig = getFieldsForTab(currentTab);

  const filteredPreviewRows = useMemo(() => {
    if (!previewData || !searchQuery.trim()) return previewData?.rows || [];
    const q = searchQuery.toLowerCase();
    return previewData.rows.filter((row) => row.some((cell) => cell.toLowerCase().includes(q)));
  }, [previewData, searchQuery]);

  return (
    <>
      <Helmet>
        <title>Reports & Data Exports - Dashboard</title>
      </Helmet>

      <Box sx={{ p: 3 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 4 }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
              Reports & Data Exports
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Generate custom CSV reports with column opt-out and advanced filtering
            </Typography>
          </Box>
        </Stack>

        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs
            value={currentTab}
            onChange={(_, val) => {
              setCurrentTab(val);
              setPreviewData(null);
            }}
            textColor="primary"
            indicatorColor="primary"
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab
              value="user"
              label="User Reports"
              icon={<Iconify icon="solar:users-group-rounded-bold-duotone" width={20} />}
              iconPosition="start"
              sx={{ fontWeight: 600 }}
            />
            <Tab
              value="finance"
              label="Finance Reports"
              icon={<Iconify icon="solar:bill-list-bold-duotone" width={20} />}
              iconPosition="start"
              sx={{ fontWeight: 600 }}
            />
            <Tab
              value="discount"
              label="Discount & Promo ROI"
              icon={<Iconify icon="solar:ticket-bold-duotone" width={20} />}
              iconPosition="start"
              sx={{ fontWeight: 600 }}
            />
            <Tab
              value="utilization"
              label="Track Utilization"
              icon={<Iconify icon="solar:clock-circle-bold-duotone" width={20} />}
              iconPosition="start"
              sx={{ fontWeight: 600 }}
            />
            <Tab
              value="leaderboard"
              label="Racer Leaderboard"
              icon={<Iconify icon="solar:cup-star-bold-duotone" width={20} />}
              iconPosition="start"
              sx={{ fontWeight: 600 }}
            />
          </Tabs>
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Card sx={{ p: 3, mb: 3 }}>
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                sx={{ mb: 2 }}
              >
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Select Fields to Export
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Click to include or opt-out of specific CSV columns (
                    {activeTabConfig.selected.length} / {activeTabConfig.fields.length} selected)
                  </Typography>
                </Box>
                <Stack direction="row" spacing={1}>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => handleSelectAll(currentTab)}
                  >
                    Select All
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    color="inherit"
                    onClick={() => handleClearAll(currentTab)}
                  >
                    Clear All
                  </Button>
                </Stack>
              </Stack>

              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {activeTabConfig.fields.map((field) => {
                  const isSelected = activeTabConfig.selected.includes(field.key);

                  return (
                    <Chip
                      key={field.key}
                      label={field.label}
                      icon={<Iconify icon={field.icon} width={18} />}
                      onClick={() => toggleField(field.key, currentTab)}
                      color={isSelected ? 'primary' : 'default'}
                      variant={isSelected ? 'filled' : 'outlined'}
                      clickable
                      sx={{
                        px: 1,
                        py: 2.2,
                        borderRadius: 1.5,
                        fontWeight: isSelected ? 600 : 400,
                        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                        borderWidth: isSelected ? 0 : 1,
                        borderColor: alpha(theme.palette.text.primary, 0.2),
                        ...(isSelected && {
                          boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.25)}`,
                        }),
                      }}
                    />
                  );
                })}
              </Box>
            </Card>

            <Card sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Filter Criteria
              </Typography>

              {currentTab === 'user' && (
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      type="date"
                      label="Last Visited After"
                      InputLabelProps={{ shrink: true }}
                      value={userFilters.last_visit_after}
                      onChange={(e) =>
                        setUserFilters({ ...userFilters, last_visit_after: e.target.value })
                      }
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      type="date"
                      label="Last Visited Before"
                      InputLabelProps={{ shrink: true }}
                      value={userFilters.last_visit_before}
                      onChange={(e) =>
                        setUserFilters({ ...userFilters, last_visit_before: e.target.value })
                      }
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      type="number"
                      label="Min Total Spent (₹)"
                      value={userFilters.min_spent}
                      onChange={(e) =>
                        setUserFilters({ ...userFilters, min_spent: e.target.value })
                      }
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      type="number"
                      label="Max Total Spent (₹)"
                      value={userFilters.max_spent}
                      onChange={(e) =>
                        setUserFilters({ ...userFilters, max_spent: e.target.value })
                      }
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      type="number"
                      label="Min Visits"
                      value={userFilters.min_visits}
                      onChange={(e) =>
                        setUserFilters({ ...userFilters, min_visits: e.target.value })
                      }
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Coupon Used Code"
                      placeholder="e.g. SUMMER50"
                      value={userFilters.coupon}
                      onChange={(e) => setUserFilters({ ...userFilters, coupon: e.target.value })}
                    />
                  </Grid>
                </Grid>
              )}

              {currentTab === 'finance' && (
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      type="date"
                      label="Start Date"
                      InputLabelProps={{ shrink: true }}
                      value={financeFilters.start_date}
                      onChange={(e) =>
                        setFinanceFilters({ ...financeFilters, start_date: e.target.value })
                      }
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      type="date"
                      label="End Date"
                      InputLabelProps={{ shrink: true }}
                      value={financeFilters.end_date}
                      onChange={(e) =>
                        setFinanceFilters({ ...financeFilters, end_date: e.target.value })
                      }
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      type="number"
                      label="Min Session Revenue (₹)"
                      value={financeFilters.min_grand_total}
                      onChange={(e) =>
                        setFinanceFilters({ ...financeFilters, min_grand_total: e.target.value })
                      }
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      type="number"
                      label="Max Session Revenue (₹)"
                      value={financeFilters.max_grand_total}
                      onChange={(e) =>
                        setFinanceFilters({ ...financeFilters, max_grand_total: e.target.value })
                      }
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      label="Discount Code"
                      placeholder="e.g. VIP20"
                      value={financeFilters.discount_code}
                      onChange={(e) =>
                        setFinanceFilters({ ...financeFilters, discount_code: e.target.value })
                      }
                    />
                  </Grid>
                </Grid>
              )}

              {currentTab === 'discount' && (
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Search Discount Code"
                      placeholder="e.g. SUMMER50"
                      value={discountFilters.code}
                      onChange={(e) => setDiscountFilters({ code: e.target.value })}
                    />
                  </Grid>
                </Grid>
              )}

              {currentTab === 'utilization' && (
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      type="date"
                      label="Start Date"
                      InputLabelProps={{ shrink: true }}
                      value={utilizationFilters.start_date}
                      onChange={(e) =>
                        setUtilizationFilters({ ...utilizationFilters, start_date: e.target.value })
                      }
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      type="date"
                      label="End Date"
                      InputLabelProps={{ shrink: true }}
                      value={utilizationFilters.end_date}
                      onChange={(e) =>
                        setUtilizationFilters({ ...utilizationFilters, end_date: e.target.value })
                      }
                    />
                  </Grid>
                </Grid>
              )}

              {currentTab === 'leaderboard' && (
                <Typography variant="body2" color="text.secondary">
                  Exports top racers sorted by best lap time recorded across all racing sessions.
                </Typography>
              )}
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                Export Actions
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Generate and download customized CSV files based on your filters.
              </Typography>

              {downloading && (
                <Box sx={{ mb: 3, p: 2, borderRadius: 2, bgcolor: 'background.neutral' }}>
                  <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                    <Iconify
                      icon="solar:spinner-line-duotone"
                      width={22}
                      sx={{ animation: 'spin 1.5s linear infinite' }}
                    />
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                      {progress.status || 'Generating Report...'}
                    </Typography>
                  </Stack>
                  <LinearProgress
                    variant={progress.total > 0 ? 'determinate' : 'indeterminate'}
                    value={
                      progress.total > 0 ? (progress.processed / progress.total) * 100 : undefined
                    }
                    sx={{ height: 8, borderRadius: 4 }}
                  />
                  {progress.total > 0 && (
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                      Processed {progress.processed} of {progress.total} items
                    </Typography>
                  )}
                </Box>
              )}

              <Box sx={{ mt: 'auto' }}>
                <Button
                  fullWidth
                  size="large"
                  variant="contained"
                  disabled={downloading || cooldown > 0}
                  onClick={handleExport}
                  startIcon={<Iconify icon="solar:download-bold-duotone" width={24} />}
                  sx={{
                    py: 1.5,
                    fontSize: '1rem',
                    fontWeight: 700,
                    borderRadius: 2,
                    boxShadow: (t) => t.customShadows?.primary || 'none',
                  }}
                >
                  {cooldown > 0
                    ? `Wait ${cooldown}s`
                    : downloading
                    ? 'Exporting CSV...'
                    : `Download ${
                        currentTab === 'user'
                          ? 'User CSV'
                          : currentTab === 'finance'
                          ? 'Finance CSV'
                          : currentTab === 'discount'
                          ? 'Discount ROI CSV'
                          : currentTab === 'utilization'
                          ? 'Utilization CSV'
                          : 'Leaderboard CSV'
                      }`}
                </Button>
              </Box>
            </Card>
          </Grid>
        </Grid>

        {previewData && previewData.type === currentTab && (
          <Box sx={{ mt: 4 }}>
            <ReportVisuals
              type={previewData.type}
              headers={previewData.headers}
              rows={previewData.rows}
            />

            <ReportTablePreview
              filename={previewData.filename}
              headers={previewData.headers}
              filteredRows={filteredPreviewRows}
              totalCount={previewData.rows.length}
              rawCsv={previewData.rawCsv}
              page={page}
              rowsPerPage={rowsPerPage}
              searchQuery={searchQuery}
              onPageChange={(newPage) => setPage(newPage)}
              onRowsPerPageChange={(newRowsPerPage) => {
                setRowsPerPage(newRowsPerPage);
                setPage(0);
              }}
              onSearchChange={(query) => {
                setSearchQuery(query);
                setPage(0);
              }}
            />
          </Box>
        )}
      </Box>
    </>
  );
}
