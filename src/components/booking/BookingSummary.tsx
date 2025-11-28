import type { Plan } from 'src/types/session';

import {
  Box,
  Card,
  Chip,
  Stack,
  Table,
  Divider,
  TableRow,
  TableBody,
  TableCell,
  TableHead,
  Typography,
  CardContent,
  TableContainer,
} from '@mui/material';

import { calculateBookingTotal } from './bookingSummaryUtils';

import type { DiscountInfo, PlanCartSelection } from './bookingSummaryUtils';

interface BookingSummaryProps {
  peopleCount: number;
  selections: PlanCartSelection[];
  plans: Plan[];
  sameForAll: boolean;
  discount?: DiscountInfo | null;
}

const CART_TYPE_LABELS = {
  '1': 'Level 1',
  '2': 'Level 2', 
  '3': 'Level 3',
};

const CART_TYPE_COLORS = {
  '1': 'success' as const,
  '2': 'warning' as const,
  '3': 'error' as const,
};

export function BookingSummary({ peopleCount, selections, plans, sameForAll, discount }: BookingSummaryProps) {

  const getGroupedSelections = () => {
    if (sameForAll) {
      return selections;
    }
    
    const grouped: { [key: string]: PlanCartSelection } = {};
    
    selections.forEach(selection => {
      const key = `${selection.planId}-${selection.cartType}`;
      if (grouped[key]) {
        grouped[key].count += selection.count;
      } else {
        grouped[key] = { ...selection };
      }
    });
    
    return Object.values(grouped);
  };

  const groupedSelections = getGroupedSelections();
  const { subtotal, discountAmount, total } = calculateBookingTotal({ peopleCount, selections, plans, sameForAll, discount: discount || undefined });

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Booking Summary
        </Typography>

        <Stack spacing={2}>
          <Box>
            <Typography variant="body2" color="text.secondary">
              Total People
            </Typography>
            <Typography variant="h5" color="primary">
              {peopleCount}
            </Typography>
          </Box>

          <Divider />

          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Plan & Cart Breakdown
            </Typography>
            
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Plan</TableCell>
                    <TableCell>Cart Type</TableCell>
                    <TableCell align="center">Count</TableCell>
                    <TableCell align="right">Amount</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {groupedSelections.map((selection, index) => {
                    const plan = plans.find(p => p.plan_id === selection.planId);
                    const itemTotal = (plan?.amount || 0) * selection.count;
                    
                    return (
                      <TableRow key={index}>
                        <TableCell>
                          <Box>
                            <Typography variant="body2" fontWeight="medium">
                              {plan?.title}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              ₹{plan?.amount} • {plan?.timeInMinutes}min
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={CART_TYPE_LABELS[selection.cartType as keyof typeof CART_TYPE_LABELS]}
                            color={CART_TYPE_COLORS[selection.cartType as keyof typeof CART_TYPE_COLORS]}
                            size="small"
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Typography variant="body2" fontWeight="medium">
                            {selection.count}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" fontWeight="medium">
                            ₹{itemTotal}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>

          <Divider />

          <Box>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="h6">
                Total Amount
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                {discount && discountAmount > 0 && (
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      textDecoration: 'line-through',
                      color: 'text.disabled',
                      fontWeight: 'normal'
                    }}
                  >
                    ₹{subtotal}
                  </Typography>
                )}
                <Typography variant="h4" color="primary" fontWeight="bold">
                  ₹{total}
                </Typography>
                {discount && discountAmount > 0 && (
                  <Chip 
                    label={`${discount.code}`}
                    color="success" 
                    size="small"
                    sx={{ height: 24 }}
                  />
                )}
              </Box>
            </Stack>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}
