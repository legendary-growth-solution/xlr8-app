import type { Cart } from 'src/types/cart';
import type { CardProps } from '@mui/material/Card';

import { useMemo, useState, useEffect } from 'react';

import Card from '@mui/material/Card';
import { useTheme } from '@mui/material/styles';
import CardHeader from '@mui/material/CardHeader';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';

import { cartApi } from 'src/services/api/cart.api';

import { Chart, useChart } from 'src/components/chart';
import { StatsGraphSkeleton } from 'src/components/skeleton/StatsGraphSkeleton';

type DailyData = {
  cart_stats_by_date?: Record<string, {
    cart_by_id_count?: Record<string, number>;
    cart_by_type_count?: Record<string, number>;
  }>;
  cart_id_to_rfid?: Record<string, string>;
};

type Props = CardProps & {
  title?: string;
  subheader?: string;
  data: Record<string, number>;
  dailyData?: DailyData;
  loading?: boolean;
  type: 'byId' | 'byType';
};

export function CartStatsGraph({ title, subheader, data, dailyData, loading, type, ...other }: Props) {
  const theme = useTheme();
  const [viewMode, setViewMode] = useState<'total' | 'daily'>('total');
  const [additionalCarts, setAdditionalCarts] = useState<Cart[]>([]);

  const isUUID = (str: string): boolean => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(str);
  };

  const apiCartIdToRfidMap = useMemo(() => {
    const map = new Map<string, string>();
    const mapping = dailyData?.cart_id_to_rfid || {};
    Object.entries(mapping).forEach(([cartId, rfid]) => {
      map.set(cartId, rfid);
      if (rfid) {
        map.set(rfid, rfid);
      }
    });
    return map;
  }, [dailyData]);

  useEffect(() => {
    if (type === 'byId') {
      const allCartIds = new Set<string>();
      
      Object.keys(data || {}).forEach((cartId) => {
        if (isUUID(cartId) && !apiCartIdToRfidMap.has(cartId)) {
          allCartIds.add(cartId);
        }
      });

      const dailyStats = dailyData?.cart_stats_by_date || {};
      Object.values(dailyStats).forEach((dayData) => {
        const cartByIdCount = dayData.cart_by_id_count || {};
        Object.keys(cartByIdCount).forEach((cartId) => {
          if (isUUID(cartId) && !apiCartIdToRfidMap.has(cartId)) {
            allCartIds.add(cartId);
          }
        });
      });

      if (allCartIds.size > 0) {
        Promise.all(Array.from(allCartIds).map((cartId) => 
          cartApi.getById(cartId).catch(() => null)
        ))
          .then((results) => {
            setAdditionalCarts(results.filter((cart): cart is Cart => cart !== null));
          })
          .catch((error) => {
            console.error('Failed to fetch additional carts:', error);
          });
      }
    }
  }, [type, data, dailyData, apiCartIdToRfidMap]);

  const cartIdToRfidMap = useMemo(() => {
    const map = new Map(apiCartIdToRfidMap);
    additionalCarts.forEach((cart) => {
      const cartId = cart.cart_id || cart.id || '';
      const rfid = cart.rfid_number || cart.rfidTag || '';
      if (cartId && rfid) {
        map.set(cartId, rfid);
      }
      if (rfid) {
        map.set(rfid, rfid);
      }
    });
    return map;
  }, [apiCartIdToRfidMap, additionalCarts]);

  const getRfidFromId = (id: string): string => {
    if (isUUID(id)) {
      return cartIdToRfidMap.get(id) || id;
    }
    return id;
  };

  const formatCartRfid = (id: string) => {
    const rfid = getRfidFromId(id);
    return `Cart ${rfid}`;
  };

  const entries = Object.entries(data || {})
    .map(([key, value]) => ({ key, value: Number(value) || 0 }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 10);

  const categories = entries.map((item) => 
    type === 'byId' ? formatCartRfid(item.key) : `Type ${item.key}`
  );
  const values = entries.map((item) => item.value);

  const getDailyChartData = () => {
    const dailyStats = dailyData?.cart_stats_by_date || {};
    if (!dailyStats || Object.keys(dailyStats).length === 0) return { dates: [], series: [] };

    const dates = Object.keys(dailyStats).sort();
    const topEntries = entries.slice(0, 5);

    if (topEntries.length === 0) return { dates: [], series: [] };

    const series = topEntries.map((entry) => {
      const dataKey = type === 'byId' ? 'cart_by_id_count' : 'cart_by_type_count';
      const dataPoints = dates.map((date) => {
        const dayData = dailyStats[date];
        if (!dayData) return 0;
        const stats = dayData[dataKey] || {};
        return Number(stats[entry.key] || 0);
      });

      return {
        name: type === 'byId' ? formatCartRfid(entry.key) : `Type ${entry.key}`,
        data: dataPoints,
      };
    });

    const formattedDates = dates.map((date) => {
      const dateStr = date.includes('T') ? date.split('T')[0] : date;
      const d = new Date(`${dateStr}T00:00:00`);
      if (Number.isNaN(d.getTime())) {
        return dateStr;
      }
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    });

    return { dates: formattedDates, series };
  };

  const barChartOptions = useChart({
    colors: [theme.palette.info.main],
    stroke: {
      width: 2,
      colors: ['transparent'],
    },
    xaxis: {
      categories,
      labels: {
        maxHeight: 80,
        rotate: -20,
        rotateAlways: true,
        style: {
          fontSize: '11px',
        },
        formatter: (value: string) => {
          const maxLength = 12;
          if (value.length > maxLength) {
            return `${value.substring(0, maxLength)}...`;
          }
          return value;
        },
        trim: true,
        hideOverlappingLabels: true,
      },
    },
    yaxis: {
      title: {
        text: 'Rides',
      },
      labels: {
        formatter: (value: number) => Math.round(value).toString(),
      },
    },
    legend: {
      show: false,
    },
    tooltip: {
      y: {
        formatter: (value: number) => `${value} rides`,
      },
      x: {
        formatter: (val: number, opts?: any) => {
          const index = opts?.dataPointIndex ?? val;
          if (type === 'byId' && entries[index]) {
            return formatCartRfid(entries[index].key);
          }
          return categories[index] || String(val);
        },
      },
    },
    chart: {
      type: 'bar',
      toolbar: {
        show: true,
      },
    },
    plotOptions: {
      bar: {
        borderRadius: 4,
        columnWidth: '60%',
      },
    },
    dataLabels: {
      enabled: true,
      formatter: (val: number) => Math.round(val).toString(),
    },
  });

  const dailyChartData = getDailyChartData();
  const chartColors = [
    theme.palette.primary.main,
    theme.palette.info.main,
    theme.palette.success.main,
    theme.palette.warning.main,
    theme.palette.error.main,
  ];

  const stackedBarChartOptions = useChart({
    colors: chartColors,
    xaxis: {
      categories: dailyChartData.dates,
    },
    yaxis: {
      title: {
        text: 'Rides',
      },
      labels: {
        formatter: (value: number) => Math.round(value).toString(),
      },
    },
    legend: {
      show: true,
      position: 'top',
      offsetY: -5,
      horizontalAlign: 'left',
    },
    tooltip: {
      shared: true,
      intersect: false,
      y: {
        formatter: (value: number) => `${value} rides`,
      },
    },
    chart: {
      type: 'bar',
      stacked: true,
      toolbar: {
        show: true,
      },
    },
    plotOptions: {
      bar: {
        horizontal: false,
        borderRadius: 4,
        columnWidth: '60%',
        dataLabels: {
          total: {
            enabled: true,
            style: {
              fontSize: '13px',
              fontWeight: 600,
            },
          },
        },
      },
    },
    dataLabels: {
      enabled: false,
    },
  });

  const barSeries = [
    {
      name: 'Rides',
      data: values,
    },
  ];

  if (loading) {
    return <StatsGraphSkeleton />;
  }

  const handleViewModeChange = (_event: React.MouseEvent<HTMLElement>, newMode: 'total' | 'daily' | null) => {
    if (newMode !== null) {
      setViewMode(newMode);
    }
  };

  const displaySubheader = subheader ? `${subheader} (Last 7 days)` : 'Last 7 days';

  if (entries.length === 0) {
    return (
      <Card {...other}>
        <CardHeader 
          title={title || 'Cart Statistics'} 
          subheader={displaySubheader}
          action={
            <ToggleButtonGroup
              value={viewMode}
              exclusive
              onChange={handleViewModeChange}
              size="small"
            >
              <ToggleButton value="total">Total</ToggleButton>
              <ToggleButton value="daily" disabled={!dailyData?.cart_stats_by_date || Object.keys(dailyData.cart_stats_by_date).length === 0}>
                Daily
              </ToggleButton>
            </ToggleButtonGroup>
          }
        />
        <div style={{ padding: '40px', textAlign: 'center', color: theme.palette.text.secondary }}>
          No data available
        </div>
      </Card>
    );
  }

  return (
    <Card {...other}>
      <CardHeader 
        title={title || 'Cart Statistics'} 
        subheader={displaySubheader}
        action={
          <ToggleButtonGroup
            value={viewMode}
            exclusive
            onChange={handleViewModeChange}
            size="small"
          >
            <ToggleButton value="total">Total</ToggleButton>
            <ToggleButton value="daily" disabled={!dailyData?.cart_stats_by_date || Object.keys(dailyData.cart_stats_by_date).length === 0}>
              Daily
            </ToggleButton>
          </ToggleButtonGroup>
        }
      />
      {viewMode === 'total' ? (
        <Chart
          type="bar"
          series={barSeries}
          options={barChartOptions}
          height={364}
          sx={{ py: 2.5, pl: 1, pr: 2.5 }}
        />
      ) : dailyChartData.series.length === 0 || dailyChartData.dates.length === 0 ? (
        <div style={{ padding: '40px', textAlign: 'center', color: theme.palette.text.secondary }}>
          No daily data available
        </div>
      ) : (
        <Chart
          type="bar"
          series={dailyChartData.series}
          options={stackedBarChartOptions}
          height={364}
          sx={{ py: 2.5, pl: 1, pr: 2.5, pt: 4 }}
        />
      )}
    </Card>
  );
}

