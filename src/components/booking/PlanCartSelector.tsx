import { useState, useEffect } from 'react';
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
  const [masterCartType, setMasterCartType] = useState('2');
  const [masterPlan, setMasterPlan] = useState('');
  const [selectedDayType, setSelectedDayType] = useState<'all' | 'weekday' | 'weekend'>('all');

  const getDayType = (plan: Plan) => {
    if (plan.plan_type) return plan.plan_type;
    const name = (plan.title || '').toLowerCase();
    if (name.includes('weekday')) return 'weekday';
    if (name.includes('weekend')) return 'weekend';
    return 'weekend';
  };

  const getFilteredPlans = (cartLevel: string) => 
    plans.filter(p => {
      const matchLevel = (p.level || 1) === Number(cartLevel);
      const matchDay = selectedDayType === 'all' || getDayType(p) === selectedDayType;
      return matchLevel && matchDay;
    });

  const filteredMasterPlans = getFilteredPlans(masterCartType);

  useEffect(() => {
    if (plans.length > 0 && !masterPlan) {
      const level2Plans = plans.filter(p => (p.level || 1) === 2);
      if (level2Plans.length > 0) {
        setMasterPlan(level2Plans[0].plan_id);
      }
    }
  }, [plans, masterPlan]);

  const handleSameForAllChange = (checked: boolean) => {
    onSameForAllChange(checked);
    
    if (checked) {
      const currentPlan = masterPlan || (filteredMasterPlans.length > 0 ? filteredMasterPlans[0].plan_id : '');
      if (!masterPlan && currentPlan) {
        setMasterPlan(currentPlan);
      }
      const newSelections: PlanCartSelection[] = [{
        planId: currentPlan,
        cartType: masterCartType,
        count: peopleCount,
      }];
      onChange(newSelections);
    } else {
      const level2Plans = getFilteredPlans('2');
      const defaultPlan = level2Plans.length > 0 ? level2Plans[0].plan_id : '';
      const newSelections: PlanCartSelection[] = Array.from({ length: peopleCount }, (_, index) => ({
        planId: defaultPlan,
        cartType: '2',
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
      const newFilteredPlans = getFilteredPlans(value);
      const newPlan = newFilteredPlans.length > 0 ? newFilteredPlans[0].plan_id : '';
      setMasterPlan(newPlan);
      
      if (sameForAll) {
        const newSelections: PlanCartSelection[] = [{
          planId: newPlan,
          cartType: value,
          count: peopleCount,
        }];
        onChange(newSelections);
        return;
      }
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
      const filteredPlans = getFilteredPlans(value);
      const newPlan = filteredPlans.length > 0 ? filteredPlans[0].plan_id : '';
      newSelections[index] = { ...newSelections[index], cartType: value, planId: newPlan };
    }
    onChange(newSelections);
  };

  const getCartTypeLabel = (value: string) =>
    CART_TYPES.find(type => type.value === value)?.label || 'Level 1';

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

        <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel size="small">Plan Type Filter</InputLabel>
            <Select
              size="small"
              value={selectedDayType}
              label="Plan Type Filter"
              onChange={(e) => setSelectedDayType(e.target.value as any)}
            >
              <MenuItem value="all">All Plans</MenuItem>
              <MenuItem value="weekday">Weekday Plans</MenuItem>
              <MenuItem value="weekend">Weekend Plans</MenuItem>
            </Select>
          </FormControl>
        </Stack>

        {sameForAll ? (
          <Stack spacing={2}>
            <FormControl fullWidth>
              <InputLabel>Cart Type</InputLabel>
              <Select
                value={masterCartType}
                label="Cart Type"
                onChange={(e) => handleMasterChange('cart', e.target.value)}
              >
                {CART_TYPES.map((type) => {
                  const hasPlans = getFilteredPlans(type.value).length > 0;
                  return (
                    <MenuItem key={type.value} value={type.value} disabled={!hasPlans}>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Chip 
                          label={type.label} 
                          color={type.color} 
                          size="small" 
                        />
                        {!hasPlans && (
                          <Typography variant="caption" color="text.disabled" sx={{ ml: 1 }}>
                            (No plans)
                          </Typography>
                        )}
                      </Box>
                    </MenuItem>
                  );
                })}
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Plan</InputLabel>
              <Select
                value={masterPlan}
                label="Plan"
                onChange={(e) => handleMasterChange('plan', e.target.value)}
              >
                {filteredMasterPlans.map((plan) => (
                  <MenuItem key={plan.plan_id} value={plan.plan_id}>
                    {plan.title} - ₹{plan.amount} ({plan.timeInMinutes} min)
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
            
            {Array.from({ length: peopleCount }, (_, index) => {
              const currentCartType = selections[index]?.cartType || '2';
              const filteredPlansForPerson = getFilteredPlans(currentCartType);
              
              return (
                <Box key={index}>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>
                    Person {index + 1}
                  </Typography>
                  <Stack direction="row" spacing={2}>
                    <FormControl sx={{ flex: 1 }}>
                      <InputLabel size="small">Cart Type</InputLabel>
                      <Select
                        size="small"
                        value={currentCartType}
                        label="Cart Type"
                        onChange={(e) => handleIndividualChange(index, 'cart', e.target.value)}
                      >
                        {CART_TYPES.map((type) => {
                          const hasPlans = getFilteredPlans(type.value).length > 0;
                          return (
                            <MenuItem key={type.value} value={type.value} disabled={!hasPlans}>
                              <Chip 
                                label={type.label} 
                                color={type.color} 
                                size="small" 
                              />
                              {!hasPlans && (
                                <Typography variant="caption" color="text.disabled" sx={{ ml: 0.5, fontSize: '0.65rem' }}>
                                  (No plans)
                                </Typography>
                              )}
                            </MenuItem>
                          );
                        })}
                      </Select>
                    </FormControl>

                    <FormControl sx={{ flex: 2 }}>
                      <InputLabel size="small">Plan</InputLabel>
                      <Select
                        size="small"
                        value={selections[index]?.planId || (filteredPlansForPerson[0]?.plan_id || '')}
                        label="Plan"
                        onChange={(e) => handleIndividualChange(index, 'plan', e.target.value)}
                      >
                        {filteredPlansForPerson.map((plan) => (
                          <MenuItem key={plan.plan_id} value={plan.plan_id}>
                            {plan.title} - ₹{plan.amount}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Stack>
                  {index < peopleCount - 1 && <Divider sx={{ mt: 2 }} />}
                </Box>
              );
            })}
          </Stack>
        )}
      </CardContent>
    </Card>
  );
}
