import { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
  Stack,
  Chip,
  Divider,
} from '@mui/material';
import { Plan } from 'src/types/session';
import { PlanCartSelection } from './bookingSummaryUtils';

interface PlanCartSelectorProps {
  plans: Plan[];
  peopleCount: number;
  selections: PlanCartSelection[];
  onChange: (selections: PlanCartSelection[]) => void;
  sameForAll: boolean;
  onSameForAllChange: (same: boolean) => void;
}

const CART_TYPES = [
  { value: '1', label: 'Level 1', color: 'success' as const },
  { value: '2', label: 'Level 2', color: 'warning' as const },
  { value: '3', label: 'Level 3', color: 'error' as const },
];

export function PlanCartSelector({
  plans,
  peopleCount,
  selections,
  onChange,
  sameForAll,
  onSameForAllChange,
}: PlanCartSelectorProps) {
  const [masterPlan, setMasterPlan] = useState(plans[0]?.plan_id || '');
  const [masterCartType, setMasterCartType] = useState('1');

  const handleSameForAllChange = (checked: boolean) => {
    onSameForAllChange(checked);
    
    if (checked) {
      const newSelections: PlanCartSelection[] = [{
        planId: masterPlan,
        cartType: masterCartType,
        count: peopleCount,
      }];
      onChange(newSelections);
    } else {
      const newSelections: PlanCartSelection[] = Array.from({ length: peopleCount }, (_, index) => ({
        planId: plans[0]?.plan_id || '',
        cartType: '1',
        count: 1,
      }));
      onChange(newSelections);
    }
  };

  const handleMasterChange = (field: 'plan' | 'cart', value: string) => {
    if (field === 'plan') {
      setMasterPlan(value);
    } else {
      setMasterCartType(value);
    }

    if (sameForAll) {
      const newSelections: PlanCartSelection[] = [{
        planId: field === 'plan' ? value : masterPlan,
        cartType: field === 'cart' ? value : masterCartType,
        count: peopleCount,
      }];
      onChange(newSelections);
    }
  };

  const handleIndividualChange = (index: number, field: 'plan' | 'cart', value: string) => {
    const newSelections = [...selections];
    if (field === 'plan') {
      newSelections[index] = { ...newSelections[index], planId: value };
    } else {
      newSelections[index] = { ...newSelections[index], cartType: value };
    }
    onChange(newSelections);
  };

  const getCartTypeLabel = (value: string) =>
    CART_TYPES.find(type => type.value === value)?.label || 'Level 1';

  const getCartTypeColor = (value: string) =>
    CART_TYPES.find(type => type.value === value)?.color || 'success';

  const getPlanLabel = (planId: string) => {
    const plan = plans.find(p => p.plan_id === planId);
    return plan ? `${plan.title} - ₹${plan.amount} (${plan.timeInMinutes}min)` : '';
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Plan & Cart Selection
        </Typography>

        <FormControlLabel
          control={
            <Checkbox
              checked={sameForAll}
              onChange={(e) => handleSameForAllChange(e.target.checked)}
            />
          }
          label="Same plan and cart type for everyone"
          sx={{ mb: 2 }}
        />

        {sameForAll ? (
          <Stack spacing={2}>
            <FormControl fullWidth>
              <InputLabel>Plan</InputLabel>
              <Select
                value={masterPlan}
                label="Plan"
                onChange={(e) => handleMasterChange('plan', e.target.value)}
              >
                {plans.map((plan) => (
                  <MenuItem key={plan.plan_id} value={plan.plan_id}>
                    {plan.title} - ₹{plan.amount} ({plan.timeInMinutes} min)
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Cart Type</InputLabel>
              <Select
                value={masterCartType}
                label="Cart Type"
                onChange={(e) => handleMasterChange('cart', e.target.value)}
              >
                {CART_TYPES.map((type) => (
                  <MenuItem key={type.value} value={type.value}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Chip 
                        label={type.label} 
                        color={type.color} 
                        size="small" 
                      />
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Box>
              <Typography variant="body2" color="text.secondary">
                All {peopleCount} people will have:
              </Typography>
              <Typography variant="body1">
                {getPlanLabel(masterPlan)} • {getCartTypeLabel(masterCartType)}
              </Typography>
            </Box>
          </Stack>
        ) : (
          <Stack spacing={2}>
            <Typography variant="body2" color="text.secondary">
              Configure individual selections:
            </Typography>
            
            {Array.from({ length: peopleCount }, (_, index) => (
              <Box key={index}>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  Person {index + 1}
                </Typography>
                <Stack direction="row" spacing={2}>
                  <FormControl sx={{ flex: 2 }}>
                    <InputLabel size="small">Plan</InputLabel>
                    <Select
                      size="small"
                      value={selections[index]?.planId || plans[0]?.plan_id || ''}
                      label="Plan"
                      onChange={(e) => handleIndividualChange(index, 'plan', e.target.value)}
                    >
                      {plans.map((plan) => (
                        <MenuItem key={plan.plan_id} value={plan.plan_id}>
                          {plan.title} - ₹{plan.amount}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <FormControl sx={{ flex: 1 }}>
                    <InputLabel size="small">Cart Type</InputLabel>
                    <Select
                      size="small"
                      value={selections[index]?.cartType || '1'}
                      label="Cart Type"
                      onChange={(e) => handleIndividualChange(index, 'cart', e.target.value)}
                    >
                      {CART_TYPES.map((type) => (
                        <MenuItem key={type.value} value={type.value}>
                          <Chip 
                            label={type.label} 
                            color={type.color} 
                            size="small" 
                          />
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Stack>
                {index < peopleCount - 1 && <Divider sx={{ mt: 2 }} />}
              </Box>
            ))}
          </Stack>
        )}
      </CardContent>
    </Card>
  );
}
