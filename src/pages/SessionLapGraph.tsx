import React, { useEffect, useState } from 'react';
import { Box, Paper } from '@mui/material';
import { Chart } from 'src/components/chart';
import { api } from 'src/api/api';
import { SessionLapGraphSkeleton } from 'src/components/skeleton';
import { formatTime } from 'src/sections/user/utils';

interface Lap {
  id: string;
  lap_time: number;
  lap_number: number;
  timestamp: string;
  last_ts: string;
  user_id: string;
  user_name: string;
  duration?: number;
}

interface SessionLapGraphProps {
  sessionId: string;
}

const SessionLapGraph: React.FC<SessionLapGraphProps> = ({ sessionId }) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [chartData, setChartData] = useState<any[]>([]);
  const [lapNumbers, setLapNumbers] = useState<number[]>([]);

  useEffect(() => {
    if (sessionId) {
      api.session
        .getSessionLaps(sessionId)
        .then((response: any) => {
          const { laps } = response;

          const userLaps: Record<string, any> = {};

          const allLapNumbers = [...new Set(laps.map((lap: Lap) => lap.lap_number))].sort(
            (a, b) => (a as number) - (b as number)
          );
          setLapNumbers(allLapNumbers as number[]);

          laps.forEach((lap: Lap) => {
            if (!userLaps[lap.user_id]) {
              userLaps[lap.user_id] = {
                name: lap.user_name,
                data: Array(allLapNumbers.length).fill(null),
              };
            }

            const lapIndex = allLapNumbers.indexOf(lap.lap_number);
            if (lapIndex !== -1 && lap.duration) {
              userLaps[lap.user_id].data[lapIndex] = formatTime(lap.duration / 1000);
            }
          });

          const series = Object.values(userLaps);
          setChartData(series);
          setLoading(false);
        })
        .catch((error) => {
          console.error('Error fetching lap data for graph:', error);
          setLoading(false);
        });
    }
  }, [sessionId]);

  const chartOptions = {
    chart: {
      type: 'line' as const,
      zoom: {
        enabled: true,
      },
      toolbar: {
        show: true,
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      width: 3,
      curve: 'smooth' as any,
    },
    title: {
      text: 'Lap Times Comparison',
      align: 'left' as any,
    },
    grid: {
      row: {
        colors: ['#f3f3f3', 'transparent'],
        opacity: 0.5,
      },
    },
    xaxis: {
      categories: lapNumbers,
      title: {
        text: 'Lap Number',
      },
    },
    yaxis: {
      title: {
        text: 'Time (seconds)',
      },
      min(min: number) {
        return min * 0.95;
      },
    },
    tooltip: {
      y: {
        formatter(value: string | number) {
          return typeof value === 'number' ? `${value.toFixed(3)} seconds` : value;
        },
      },
    },
    legend: {
      position: 'top' as const,
    },
  };

  return (
    <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column' }}>
      {loading ? (
        <SessionLapGraphSkeleton />
      ) : (
        <Paper sx={{ p: 2, height: 'calc(100vh - 200px)' }}>
          <Chart type="line" series={chartData} options={chartOptions} height="100%" />
        </Paper>
      )}
    </Box>
  );
};

export default SessionLapGraph;
