import type { CardProps } from '@mui/material/Card';
import type { ChartOptions } from 'src/components/chart';

import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import { useTheme } from '@mui/material/styles';

import { Chart, useChart } from 'src/components/chart';
import { StatsGraphSkeleton } from 'src/components/skeleton/StatsGraphSkeleton';

type StatsDataPoint = {
  date: string;
  amount: number;
  rides: number;
};

type Props = CardProps & {
  title?: string;
  subheader?: string;
  data: StatsDataPoint[];
  loading?: boolean;
};

export function StatsGraph({ title, subheader, data, loading, ...other }: Props) {
  const theme = useTheme();

  const chartColors = [
    theme.palette.primary.main,
    theme.palette.success.main,
  ];

  const categories = data.map((item) => {
    const date = new Date(item.date);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  });

  const ridesData = data.map((item) => item.rides);
  const amountData = data.map((item) => item.amount);

  const baseOptions = useChart({
    colors: chartColors,
    stroke: {
      width: 3,
      curve: 'smooth',
    },
    xaxis: {
      categories,
    },
    legend: {
      show: true,
      position: 'top',
      offsetY: -5,
      offsetX: 0,
      horizontalAlign: 'left',
      itemMargin: {
        horizontal: 16,
        vertical: 8,
      },
    },
    tooltip: {
      shared: true,
      intersect: false,
      y: {
        formatter: (value: number, { seriesIndex }: { seriesIndex: number }) => {
          if (seriesIndex === 0) {
            return `${value} rides`;
          }
          return `₹${value.toLocaleString('en-IN')}`;
        },
      },
    },
    chart: {
      type: 'line',
      toolbar: {
        show: true,
        offsetX: 0,
        offsetY: -5,
        tools: {
          download: true,
          selection: false,
          zoom: false,
          zoomin: false,
          zoomout: false,
          pan: false,
          reset: false,
        },
      },
    },
  });

  const chartOptions = {
    ...baseOptions,
    yaxis: [
      {
        title: {
          text: 'Rides',
        },
        labels: {
          formatter: (value: number) => Math.round(value).toString(),
        },
      },
      {
        opposite: true,
        title: {
          text: 'Collection (₹)',
        },
        labels: {
          formatter: (value: number) => {
            if (value >= 1000) {
              return `₹${(value / 1000).toFixed(1)}k`;
            }
            return `₹${Math.round(value)}`;
          },
        },
      },
    ],
  };

  const series = [
    {
      name: 'Rides',
      data: ridesData,
    },
    {
      name: 'Collection',
      data: amountData,
      yAxisIndex: 1,
    },
  ];

  if (loading) {
    return <StatsGraphSkeleton />;
  }

  if (!data || data.length === 0) {
    return (
      <Card {...other}>
        <CardHeader title={title || 'Statistics'} subheader={subheader} />
        <div style={{ padding: '40px', textAlign: 'center', color: theme.palette.text.secondary }}>
          No data available
        </div>
      </Card>
    );
  }

  return (
    <Card {...other}>
      <CardHeader title={title || 'Statistics'} subheader={subheader} />
      <Chart
        type="line"
        series={series}
        options={chartOptions}
        height={364}
        sx={{ py: 2.5, pl: 1, pr: 2.5, pt: 4 }}
      />
    </Card>
  );
}

