import { Box, Card, Grid, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';

import { Chart, useChart } from 'src/components/chart';
import { ChartSuiteItem } from './types';

export function DonutChartCard({ item }: { item: ChartSuiteItem }) {
  const theme = useTheme();

  const donutOpts = useChart({
    colors: [
      theme.palette.primary.main,
      theme.palette.success.main,
      theme.palette.warning.main,
      theme.palette.info.main,
      theme.palette.error.main,
    ],
    labels: item.labels || [],
    legend: { position: 'bottom' },
    plotOptions: {
      pie: { donut: { size: '70%' } },
    },
  });

  return (
    <Grid item xs={12} md={item.gridSpan || 4}>
      <Card sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            {item.title}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {item.subheader}
          </Typography>
        </Box>
        <Box sx={{ my: 'auto', py: 1 }}>
          <Chart
            type="donut"
            series={item.series as number[]}
            options={donutOpts}
            height={290}
          />
        </Box>
      </Card>
    </Grid>
  );
}

export function AxisChartCard({ item }: { item: ChartSuiteItem }) {
  const theme = useTheme();

  const opts = useChart({
    colors: [theme.palette.primary.main, theme.palette.success.main, theme.palette.warning.main],
    stroke: { width: item.isDualAxis ? [0, 3] : 2, curve: 'smooth' },
    xaxis: { categories: item.categories || [] },
    plotOptions: {
      bar: {
        horizontal: !!item.isHorizontal,
        borderRadius: 4,
        columnWidth: '55%',
      },
    },
    yaxis: item.isDualAxis
      ? [
          {
            title: { text: 'Revenue / Money (₹)' },
            labels: {
              formatter: (val: number) =>
                val >= 1000 ? `₹${(val / 1000).toFixed(1)}k` : `₹${Math.round(val)}`,
            },
          },
          {
            opposite: true,
            title: { text: 'Count / Volume' },
            labels: {
              formatter: (val: number) => `${Math.round(val)}`,
            },
          },
        ]
      : [
          {
            title: { text: item.isHorizontal ? 'Lap Time (sec)' : 'Value' },
            labels: {
              formatter: (val: number) => (item.isHorizontal ? `${val}s` : `${val}`),
            },
          },
        ],
    tooltip: {
      shared: true,
      intersect: false,
      y: {
        formatter: (val: number, { seriesIndex }: { seriesIndex: number }) => {
          if (item.isDualAxis) {
            return seriesIndex === 0 ? `₹${val.toLocaleString('en-IN')}` : `${val} count`;
          }
          return item.isHorizontal ? `${val} seconds` : `${val}`;
        },
      },
    },
  });

  return (
    <Grid item xs={12} md={item.gridSpan || 6}>
      <Card sx={{ p: 3, height: '100%' }}>
        <Box sx={{ mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            {item.title}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {item.subheader}
          </Typography>
        </Box>
        <Chart
          type={item.type}
          series={item.series as any}
          options={opts}
          height={300}
        />
      </Card>
    </Grid>
  );
}
