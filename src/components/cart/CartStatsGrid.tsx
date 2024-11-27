import { Grid } from '@mui/material';
import { Cart } from 'src/types/cart';
import StatsCard from '../common/StatsCard';

interface CartStatsGridProps {
  carts: Cart[];
}

export default function CartStatsGrid({ carts }: CartStatsGridProps) {
  const stats = [
    {
      title: 'Total Carts',
      value: carts.length,
    },
    {
      title: 'Available',
      value: carts.filter(cart => cart.status === 'available').length,
      color: 'success.main'
    },
    {
      title: 'In Use',
      value: carts.filter(cart => cart.status === 'in-use').length,
      color: 'primary.main'
    },
    {
      title: 'Maintenance',
      value: carts.filter(cart => cart.status === 'maintenance').length,
      color: 'warning.main'
    }
  ];

  return (
    <Grid container spacing={3} mb={3}>
      {stats.map((stat, index) => (
        <Grid item xs={12} md={3} key={index}>
          <StatsCard {...stat} />
        </Grid>
      ))}
    </Grid>
  );
} 