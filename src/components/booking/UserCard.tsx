import {
  Grid,
  Chip,
  Card,
  Stack,
  Button,
  TextField,
  Typography,
  CardContent,
} from '@mui/material';

import { Iconify } from 'src/components/iconify';

interface BookingUser {
  user_id: string;
  name: string;
  email: string;
  phone: string;
  plan_id: string;
  cart_type_requested?: string;
  is_new?: boolean;
  time_in_minutes?: number;
}

interface UserCardProps {
  user: BookingUser;
  index: number;
  getPlanLabel: (planId: string) => string;
  onManageUser: (index: number) => void;
  onClearUser: (index: number) => void;
  onUpdateUser: (index: number, field: keyof BookingUser, value: string) => void;
}

const CART_TYPE_LABELS = {
  '1': 'Level 1',
  '2': 'Level 2',
  '3': 'Level 3',
};

export function UserCard({
  user,
  index,
  getPlanLabel,
  onManageUser,
  onClearUser,
  onUpdateUser,
}: UserCardProps) {
  return (
    <Card variant="outlined">
      <CardContent sx={{ py: 1.5, px: 2 }}>
        <Stack spacing={1.5}>
          <Stack direction={{ xs: 'column', sm: 'row' }} alignItems={{ xs: 'flex-start', sm: 'center' }} justifyContent="space-between" spacing={1}>
            <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap">
              <Iconify icon="eva:person-fill" width={14} />
              <Typography variant="body2" fontWeight="500">
                Racer {index + 1}
              </Typography>
              <Chip
                label={getPlanLabel(user.plan_id)}
                size="small"
                color="primary"
                variant="outlined"
                sx={{ fontSize: '0.7rem', height: 20 }}
              />
              <Chip
                label={CART_TYPE_LABELS[user.cart_type_requested as keyof typeof CART_TYPE_LABELS]}
                size="small"
                color="secondary"
                sx={{ fontSize: '0.7rem', height: 20 }}
              />
            </Stack>
            
            <Stack direction="row" spacing={0.5} sx={{ alignSelf: { xs: 'stretch', sm: 'auto' } }}>
              <Button
                size="small"
                variant="outlined"
                startIcon={<Iconify icon={user.name ? "eva:swap-fill" : "eva:search-fill"} width={14} />}
                onClick={() => onManageUser(index)}
                sx={{ 
                  fontSize: '0.75rem', 
                  py: 0.5, 
                  px: 1,
                  flex: { xs: 1, sm: 'none' }
                }}
              >
                {user.name ? 'Switch' : 'Search and Add'}
              </Button>
              {!user.is_new && (
                <Button
                  size="small"
                  variant="outlined"
                  color="error"
                  startIcon={<Iconify icon="eva:trash-2-outline" width={14} />}
                  onClick={() => onClearUser(index)}
                  sx={{ 
                    fontSize: '0.75rem', 
                    py: 0.5, 
                    px: 1,
                    flex: { xs: 1, sm: 'none' }
                  }}
                >
                  Clear
                </Button>
              )}
            </Stack>
          </Stack>
          
          <Grid container spacing={1.5} alignItems="center">
            <Grid item xs={12} sm={9}>
              <Stack spacing={0.25} sx={{ height: 40, justifyContent: 'center' }}>
                <Typography variant="body2" fontWeight="500">
                  {user.name || 'No user selected'}
                </Typography>
                {user.name && (
                  <Typography variant="body2" color="text.secondary">
                    {user.phone || 'Phone not added'}
                  </Typography>
                )}
              </Stack>
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                label="Custom time (min)"
                value={user.time_in_minutes ?? ''}
                onChange={(e) => onUpdateUser(index, 'time_in_minutes', e.target.value)}
                type="number"
                inputProps={{ min: 0 }}
                size="small"
              />
            </Grid>
          </Grid>
        </Stack>
      </CardContent>
    </Card>
  );
}
