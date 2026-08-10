import { useCallback, useMemo } from 'react';
import { Box, Card, Grid, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';

import { Iconify } from 'src/components/iconify';
import { ChartSuiteItem } from './types';
import { DonutChartCard, AxisChartCard } from './ReportChartCards';

export function ReportVisuals({
  type,
  headers,
  rows,
}: {
  type: string;
  headers: string[];
  rows: string[][];
}) {
  const getColIndex = useCallback(
    (keyword: string) => {
      const kw = keyword.toLowerCase();
      return headers.findIndex((h) => h.toLowerCase().includes(kw));
    },
    [headers]
  );

  const kpis = useMemo(() => {
    const totalRecords = rows.length;

    if (type === 'utilization' || type === 'finance') {
      const revIdx = getColIndex('revenue') !== -1 ? getColIndex('revenue') : getColIndex('total');
      const ridersIdx = getColIndex('rider') !== -1 ? getColIndex('rider') : getColIndex('user');

      let totalRevenue = 0;
      let totalRiders = 0;

      rows.forEach((r) => {
        if (revIdx !== -1 && r[revIdx]) totalRevenue += parseFloat(r[revIdx]) || 0;
        if (ridersIdx !== -1 && r[ridersIdx]) totalRiders += parseInt(r[ridersIdx], 10) || 0;
      });

      const avgRev = totalRecords > 0 ? totalRevenue / totalRecords : 0;

      return [
        { label: 'Total Sessions', value: totalRecords.toLocaleString(), color: 'primary' as const, icon: 'solar:document-text-bold-duotone' },
        { label: 'Total Revenue', value: `₹${totalRevenue.toLocaleString('en-IN')}`, color: 'success' as const, icon: 'solar:wallet-bold-duotone' },
        { label: 'Total Riders', value: totalRiders.toLocaleString(), color: 'info' as const, icon: 'solar:users-group-rounded-bold-duotone' },
        { label: 'Avg Session Revenue', value: `₹${Math.round(avgRev).toLocaleString('en-IN')}`, color: 'warning' as const, icon: 'solar:card-bold-duotone' },
      ];
    }

    if (type === 'discount') {
      const redIdx = getColIndex('redemption');
      const revIdx = getColIndex('revenue');
      const discIdx = getColIndex('discount');

      let totalReds = 0;
      let totalRev = 0;
      let totalDisc = 0;

      rows.forEach((r) => {
        if (redIdx !== -1 && r[redIdx]) totalReds += parseInt(r[redIdx], 10) || 0;
        if (revIdx !== -1 && r[revIdx]) totalRev += parseFloat(r[revIdx]) || 0;
        if (discIdx !== -1 && r[discIdx]) totalDisc += parseFloat(r[discIdx]) || 0;
      });

      return [
        { label: 'Active Promos', value: totalRecords.toLocaleString(), color: 'primary' as const, icon: 'solar:ticket-bold-duotone' },
        { label: 'Total Redemptions', value: totalReds.toLocaleString(), color: 'info' as const, icon: 'solar:restart-bold-duotone' },
        { label: 'Promo Gross Revenue', value: `₹${totalRev.toLocaleString('en-IN')}`, color: 'success' as const, icon: 'solar:wallet-bold-duotone' },
        { label: 'Total Discounts Given', value: `₹${totalDisc.toLocaleString('en-IN')}`, color: 'warning' as const, icon: 'solar:tag-price-bold-duotone' },
      ];
    }

    if (type === 'leaderboard') {
      const bestIdx = getColIndex('best');
      const lapIdx = getColIndex('lap');
      const spentIdx = getColIndex('spent');

      let fastestMs = Infinity;
      let totalLaps = 0;
      let totalSpent = 0;

      rows.forEach((r) => {
        if (bestIdx !== -1 && r[bestIdx]) {
          const val = parseFloat(r[bestIdx]);
          if (val > 0 && val < fastestMs) fastestMs = val;
        }
        if (lapIdx !== -1 && r[lapIdx]) totalLaps += parseInt(r[lapIdx], 10) || 0;
        if (spentIdx !== -1 && r[spentIdx]) totalSpent += parseFloat(r[spentIdx]) || 0;
      });

      const fastStr = fastestMs !== Infinity ? `${(fastestMs / 1000).toFixed(3)}s` : 'N/A';

      return [
        { label: 'Ranked Drivers', value: totalRecords.toLocaleString(), color: 'primary' as const, icon: 'solar:users-group-rounded-bold-duotone' },
        { label: 'All-Time Fastest Lap', value: fastStr, color: 'warning' as const, icon: 'solar:stopwatch-bold-duotone' },
        { label: 'Total Laps Completed', value: totalLaps.toLocaleString(), color: 'success' as const, icon: 'solar:flag-bold-duotone' },
        { label: 'Combined Driver Spend', value: `₹${totalSpent.toLocaleString('en-IN')}`, color: 'info' as const, icon: 'solar:wallet-bold-duotone' },
      ];
    }

    const spentIdx = getColIndex('spent');
    const visitsIdx = getColIndex('visit');

    let totalSpent = 0;
    let totalVisits = 0;

    rows.forEach((r) => {
      if (spentIdx !== -1 && r[spentIdx]) totalSpent += parseFloat(r[spentIdx]) || 0;
      if (visitsIdx !== -1 && r[visitsIdx]) totalVisits += parseInt(r[visitsIdx], 10) || 0;
    });

    const avgSpend = totalRecords > 0 ? totalSpent / totalRecords : 0;

    return [
      { label: 'Exported Users', value: totalRecords.toLocaleString(), color: 'primary' as const, icon: 'solar:users-group-rounded-bold-duotone' },
      { label: 'Combined Lifetime Spend', value: `₹${totalSpent.toLocaleString('en-IN')}`, color: 'success' as const, icon: 'solar:wallet-bold-duotone' },
      { label: 'Total Track Visits', value: totalVisits.toLocaleString(), color: 'info' as const, icon: 'solar:restart-bold-duotone' },
      { label: 'Avg Spend / User', value: `₹${Math.round(avgSpend).toLocaleString('en-IN')}`, color: 'warning' as const, icon: 'solar:card-bold-duotone' },
    ];
  }, [type, rows, getColIndex]);

  const chartSuite: ChartSuiteItem[] = useMemo(() => {
    if (type === 'utilization' || type === 'finance') {
      const dateIdx = getColIndex('date');
      const revIdx = getColIndex('revenue') !== -1 ? getColIndex('revenue') : getColIndex('total');
      const ridersIdx = getColIndex('rider') !== -1 ? getColIndex('rider') : getColIndex('user');
      const durationIdx = getColIndex('duration');
      const cartIdx = getColIndex('cart');
      const discIdx = getColIndex('discount');

      const labels: string[] = [];
      const revVals: number[] = [];
      const riderVals: number[] = [];
      const durationVals: number[] = [];
      const cartVals: number[] = [];
      const discVals: number[] = [];
      let cumulativeRev = 0;
      const cumulativeRevVals: number[] = [];

      rows.slice(0, 15).forEach((r) => {
        const dateStr = dateIdx !== -1 && r[dateIdx] ? r[dateIdx] : `Pt ${labels.length + 1}`;
        const rev = revIdx !== -1 && r[revIdx] ? parseFloat(r[revIdx]) || 0 : 0;
        const riders = ridersIdx !== -1 && r[ridersIdx] ? parseInt(r[ridersIdx], 10) || 0 : 0;
        const dur = durationIdx !== -1 && r[durationIdx] ? parseFloat(r[durationIdx]) || 0 : 0;
        const carts = cartIdx !== -1 && r[cartIdx] ? parseInt(r[cartIdx], 10) || 0 : 0;
        const disc = discIdx !== -1 && r[discIdx] ? parseFloat(r[discIdx]) || 0 : 0;

        cumulativeRev += rev;
        labels.push(dateStr);
        revVals.push(rev);
        riderVals.push(riders);
        durationVals.push(dur);
        cartVals.push(carts);
        discVals.push(disc);
        cumulativeRevVals.push(cumulativeRev);
      });

      return [
        {
          title: 'Daily Revenue (₹) & Rider Volume Trend',
          subheader: 'Revenue (bar left axis) vs Rider volume (line right axis)',
          type: 'line' as const,
          series: [
            { name: 'Revenue (₹)', type: 'column', data: revVals },
            { name: 'Riders Count', type: 'line', data: riderVals },
          ],
          categories: labels,
          isDualAxis: true,
          gridSpan: 8,
        },
        {
          title: 'Top Peak Revenue Days Share',
          subheader: 'Highest earning dates proportion',
          type: 'donut' as const,
          series: revVals.slice(0, 5),
          labels: labels.slice(0, 5),
          gridSpan: 4,
        },
        {
          title: 'Cumulative Revenue Trajectory (₹)',
          subheader: 'Total aggregated growth over period',
          type: 'area' as const,
          series: [{ name: 'Cumulative Spend (₹)', data: cumulativeRevVals }],
          categories: labels,
          gridSpan: 6,
        },
        {
          title: 'Average Track Session Duration (Min)',
          subheader: 'Session duration per day',
          type: 'bar' as const,
          series: [{ name: 'Avg Duration (min)', data: durationVals }],
          categories: labels,
          gridSpan: 6,
        },
        {
          title: 'Cart Fleet Utilization (Carts Deployed)',
          subheader: 'Unique carts assigned per session',
          type: 'bar' as const,
          series: [{ name: 'Carts Active', data: cartVals }],
          categories: labels,
          gridSpan: 6,
        },
        {
          title: 'Discount Giveaway vs Gross Revenue (₹)',
          subheader: 'Discounts given vs total revenue earned',
          type: 'bar' as const,
          series: [
            { name: 'Gross Revenue (₹)', data: revVals },
            { name: 'Discount Amount (₹)', data: discVals },
          ],
          categories: labels,
          gridSpan: 6,
        },
      ];
    }

    if (type === 'discount') {
      const codeIdx = getColIndex('code');
      const revIdx = getColIndex('revenue');
      const redIdx = getColIndex('redemption');
      const discIdx = getColIndex('discount');

      const labels: string[] = [];
      const revVals: number[] = [];
      const redVals: number[] = [];
      const discVals: number[] = [];
      const roiVals: number[] = [];

      rows.slice(0, 10).forEach((r) => {
        const code = codeIdx !== -1 && r[codeIdx] ? r[codeIdx] : `Code ${labels.length + 1}`;
        const rev = revIdx !== -1 && r[revIdx] ? parseFloat(r[revIdx]) || 0 : 0;
        const red = redIdx !== -1 && r[redIdx] ? parseInt(r[redIdx], 10) || 0 : 0;
        const disc = discIdx !== -1 && r[discIdx] ? parseFloat(r[discIdx]) || 0 : 0;
        const roi = disc > 0 ? parseFloat((rev / disc).toFixed(2)) : parseFloat(rev.toFixed(2));

        labels.push(code);
        revVals.push(rev);
        redVals.push(red);
        discVals.push(disc);
        roiVals.push(roi);
      });

      return [
        {
          title: 'Gross Sales (₹) & Redemptions by Code',
          subheader: 'Gross Revenue (bar left axis) vs Total Redemptions (line right axis)',
          type: 'line' as const,
          series: [
            { name: 'Gross Revenue (₹)', type: 'column', data: revVals },
            { name: 'Redemptions', type: 'line', data: redVals },
          ],
          categories: labels,
          isDualAxis: true,
          gridSpan: 8,
        },
        {
          title: 'Redemptions Share by Promo Code',
          subheader: 'Proportion of total redemptions',
          type: 'donut' as const,
          series: redVals.slice(0, 5),
          labels: labels.slice(0, 5),
          gridSpan: 4,
        },
        {
          title: 'Total Discount Amount Granted (₹)',
          subheader: 'Total money discounted per code',
          type: 'bar' as const,
          series: [{ name: 'Discount Given (₹)', data: discVals }],
          categories: labels,
          gridSpan: 6,
        },
        {
          title: 'Promo Sales Lift Efficiency Index (ROI)',
          subheader: 'Gross Revenue earned per ₹1 Discount given',
          type: 'line' as const,
          series: [{ name: 'Revenue / ₹1 Discount', data: roiVals }],
          categories: labels,
          gridSpan: 6,
        },
        {
          title: 'Top Promo Revenue Generators',
          subheader: 'Ranked sales contribution per promo campaign',
          type: 'bar' as const,
          series: [{ name: 'Gross Revenue (₹)', data: revVals }],
          categories: labels,
          gridSpan: 6,
        },
        {
          title: 'Redemption Velocity Ranking',
          subheader: 'Campaign volume throughput',
          type: 'area' as const,
          series: [{ name: 'Redemptions', data: redVals }],
          categories: labels,
          gridSpan: 6,
        },
      ];
    }

    if (type === 'leaderboard') {
      const nameIdx = getColIndex('name');
      const bestIdx = getColIndex('best');
      const lapIdx = getColIndex('lap');
      const spentIdx = getColIndex('spent');
      const visitsIdx = getColIndex('visit');

      const sortedRacers = [...rows].slice(0, 10);

      const names: string[] = [];
      const lapTimesSec: number[] = [];
      const totalLaps: number[] = [];
      const totalSpend: number[] = [];
      const visitCount: number[] = [];

      sortedRacers.forEach((r) => {
        const name = nameIdx !== -1 && r[nameIdx] ? r[nameIdx] : `Racer ${names.length + 1}`;
        const ms = bestIdx !== -1 && r[bestIdx] ? parseFloat(r[bestIdx]) || 0 : 0;
        const laps = lapIdx !== -1 && r[lapIdx] ? parseInt(r[lapIdx], 10) || 0 : 0;
        const spent = spentIdx !== -1 && r[spentIdx] ? parseFloat(r[spentIdx]) || 0 : 0;
        const visits = visitsIdx !== -1 && r[visitsIdx] ? parseInt(r[visitsIdx], 10) || 0 : 0;

        names.push(name);
        lapTimesSec.push(ms > 0 ? parseFloat((ms / 1000).toFixed(2)) : 0);
        totalLaps.push(laps);
        totalSpend.push(spent);
        visitCount.push(visits);
      });

      let sub40 = 0;
      let sub45 = 0;
      let sub50 = 0;
      let sub60 = 0;
      rows.forEach((r) => {
        const ms = bestIdx !== -1 && r[bestIdx] ? parseFloat(r[bestIdx]) || 0 : 0;
        const sec = ms / 1000;
        if (sec > 0 && sec < 40) sub40 += 1;
        else if (sec >= 40 && sec < 45) sub45 += 1;
        else if (sec >= 45 && sec < 50) sub50 += 1;
        else if (sec >= 50) sub60 += 1;
      });

      return [
        {
          title: 'Top 10 Racers Best Lap Performance (Sec)',
          subheader: 'Best lap time in seconds (Lower is faster)',
          type: 'bar' as const,
          series: [{ name: 'Best Lap Time (s)', data: lapTimesSec }],
          categories: names,
          isHorizontal: true,
          gridSpan: 8,
        },
        {
          title: 'Speed Bracket Tiering Breakdown',
          subheader: 'Racer speed distribution across lap times',
          type: 'donut' as const,
          series: [sub40, sub45, sub50, sub60],
          labels: ['< 40s (Pro)', '40s - 45s (Advanced)', '45s - 50s (Intermediate)', '> 50s (Casual)'],
          gridSpan: 4,
        },
        {
          title: 'Total Track Laps Completed per Driver',
          subheader: 'Laps driven by top racers',
          type: 'bar' as const,
          series: [{ name: 'Laps Driven', data: totalLaps }],
          categories: names,
          gridSpan: 6,
        },
        {
          title: 'Driver Spending (₹) vs Total Laps',
          subheader: 'Money spent (bar left axis) vs Laps driven (line right axis)',
          type: 'line' as const,
          series: [
            { name: 'Total Spend (₹)', type: 'column', data: totalSpend },
            { name: 'Laps Driven', type: 'line', data: totalLaps },
          ],
          categories: names,
          isDualAxis: true,
          gridSpan: 6,
        },
        {
          title: 'Track Visit Frequency per Driver',
          subheader: 'Number of sessions attended',
          type: 'area' as const,
          series: [{ name: 'Visits Count', data: visitCount }],
          categories: names,
          gridSpan: 6,
        },
        {
          title: 'Top Drivers Lifetime Revenue Contribution (₹)',
          subheader: 'Revenue earned from top leaderboard racers',
          type: 'bar' as const,
          series: [{ name: 'Total Spend (₹)', data: totalSpend }],
          categories: names,
          gridSpan: 6,
        },
      ];
    }

    const nameIdx = getColIndex('name');
    const spentIdx = getColIndex('spent');
    const visitsIdx = getColIndex('visit');
    const ageIdx = getColIndex('age');
    const couponIdx = getColIndex('coupon');

    const topUsers = [...rows]
      .sort((a, b) => {
        const valA = spentIdx !== -1 && a[spentIdx] ? parseFloat(a[spentIdx]) || 0 : 0;
        const valB = spentIdx !== -1 && b[spentIdx] ? parseFloat(b[spentIdx]) || 0 : 0;
        return valB - valA;
      })
      .slice(0, 10);

    const names: string[] = [];
    const spentVals: number[] = [];
    const visitVals: number[] = [];
    const couponVals: number[] = [];

    topUsers.forEach((r) => {
      const name = nameIdx !== -1 && r[nameIdx] ? r[nameIdx] : `User ${names.length + 1}`;
      const spent = spentIdx !== -1 && r[spentIdx] ? parseFloat(r[spentIdx]) || 0 : 0;
      const visits = visitsIdx !== -1 && r[visitsIdx] ? parseInt(r[visitsIdx], 10) || 0 : 0;
      const coupons = couponIdx !== -1 && r[couponIdx] ? parseInt(r[couponIdx], 10) || 0 : 0;

      names.push(name);
      spentVals.push(spent);
      visitVals.push(visits);
      couponVals.push(coupons);
    });

    let vip = 0;
    let high = 0;
    let mid = 0;
    let regular = 0;
    rows.forEach((r) => {
      const val = spentIdx !== -1 && r[spentIdx] ? parseFloat(r[spentIdx]) || 0 : 0;
      if (val >= 5000) vip += 1;
      else if (val >= 2000) high += 1;
      else if (val >= 500) mid += 1;
      else regular += 1;
    });

    let ageUnder18 = 0;
    let age18to25 = 0;
    let age25to35 = 0;
    let age35plus = 0;
    rows.forEach((r) => {
      const a = ageIdx !== -1 && r[ageIdx] ? parseInt(r[ageIdx], 10) || 0 : 0;
      if (a > 0 && a < 18) ageUnder18 += 1;
      else if (a >= 18 && a <= 25) age18to25 += 1;
      else if (a > 25 && a <= 35) age25to35 += 1;
      else if (a > 35) age35plus += 1;
    });

    return [
      {
        title: 'Top 10 High-Value VIP Racers',
        subheader: 'Money Spent (bar left axis) vs Total Visits (line right axis)',
        type: 'line' as const,
        series: [
          { name: 'Total Spent (₹)', type: 'column', data: spentVals },
          { name: 'Total Visits', type: 'line', data: visitVals },
        ],
        categories: names,
        isDualAxis: true,
        gridSpan: 8,
      },
      {
        title: 'User Spending Tiers Distribution',
        subheader: 'VIP (>₹5k) vs High vs Mid vs Regular',
        type: 'donut' as const,
        series: [vip, high, mid, regular],
        labels: ['VIP (>₹5k)', 'High (₹2k-₹5k)', 'Mid (₹500-₹2k)', 'Regular (<₹500)'],
        gridSpan: 4,
      },
      {
        title: 'Racer Age Demographics Distribution',
        subheader: 'User count grouped by age brackets',
        type: 'bar' as const,
        series: [{ name: 'User Count', data: [ageUnder18, age18to25, age25to35, age35plus] }],
        categories: ['Under 18', '18 - 25 Yrs', '25 - 35 Yrs', '35+ Yrs'],
        gridSpan: 6,
      },
      {
        title: 'Top Coupon Code Adopters',
        subheader: 'Users with highest discount code redemptions',
        type: 'bar' as const,
        series: [{ name: 'Coupons Used', data: couponVals }],
        categories: names,
        gridSpan: 6,
      },
      {
        title: 'Customer Loyalty & Visit Trajectory',
        subheader: 'Track visit frequency among top users',
        type: 'area' as const,
        series: [{ name: 'Total Visits', data: visitVals }],
        categories: names,
        gridSpan: 6,
      },
      {
        title: 'VIP Money Spent Comparison (₹)',
        subheader: 'Lifetime spend per top user',
        type: 'bar' as const,
        series: [{ name: 'Lifetime Spend (₹)', data: spentVals }],
        categories: names,
        gridSpan: 6,
      },
    ];
  }, [type, rows, getColIndex]);

  return (
    <Box sx={{ mb: 4 }}>
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {kpis.map((kpi, idx) => (
          <Grid key={idx} item xs={12} sm={6} md={3}>
            <Card sx={{ p: 2.5, display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: 2,
                  bgcolor: (t) => alpha(t.palette[kpi.color].main, 0.15),
                  color: `${kpi.color}.main`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Iconify icon={kpi.icon} width={28} />
              </Box>
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="caption" color="text.secondary" fontWeight={600} noWrap display="block">
                  {kpi.label}
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 700 }} noWrap>
                  {kpi.value}
                </Typography>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        {chartSuite.map((item, idx) =>
          item.type === 'donut' ? (
            <DonutChartCard key={idx} item={item} />
          ) : (
            <AxisChartCard key={idx} item={item} />
          )
        )}
      </Grid>
    </Box>
  );
}
