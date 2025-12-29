import type { Plan } from 'src/types/billing';

import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';

import { LoadingButton } from '@mui/lab';
import {
  Box,
  Card,
  Stack,
  Table,
  Button,
  Dialog,
  Switch,
  TableRow,
  TableBody,
  TableCell,
  TableHead,
  TextField,
  IconButton,
  Typography,
  DialogTitle,
  DialogActions,
  DialogContent,
  TableContainer,
  CircularProgress
} from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { billingApi } from 'src/services/api/billing.api';

import { Iconify } from 'src/components/iconify';
import { ConfirmDialog } from 'src/components/dialog/confirm-dialog';

interface PlanFormData {
  title: string;
  timeInMinutes: number;
  amount: number;
  level: number;
  plan_type?: 'weekday' | 'weekend' | '';
}

const defaultPlanData: PlanFormData = {
  title: '',
  timeInMinutes: 15,
  amount: 0,
  level: 1,
  plan_type: '',
};

export default function TimeManagementPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [formData, setFormData] = useState<PlanFormData>(defaultPlanData);
  const dialog = useBoolean();
  const deleteDialog = useBoolean();
  const [planToDelete, setPlanToDelete] = useState<Plan | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dialogError, setDialogError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [filterType, setFilterType] = useState<'all' | 'weekday' | 'weekend'>('all');

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      setError(null);
      const response : any = await billingApi.getPlans();
      console.log(response);
      setPlans(response?.data?.plans);
    } catch (err) {
      console.error('Error fetching plans:', err);
      setError('Failed to load plans. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (plan: Plan) => {
    setSelectedPlan(plan);
    setFormData({
      title: plan.title,
      timeInMinutes: plan.timeInMinutes,
      amount: plan.amount,
      level: plan.level || 1,
      plan_type: plan.plan_type || '',
    });
    setDialogError(null);
    dialog.onTrue();
  };

  const handleAdd = () => {
    setSelectedPlan(null);
    setFormData(defaultPlanData);
    setDialogError(null);
    dialog.onTrue();
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.timeInMinutes) {
      setDialogError('Name and Time are required fields');
      return;
    }

    try {
      setSubmitting(true);
      setDialogError(null);
      
      const planData = {
        title: formData.title,
        timeInMinutes: formData.timeInMinutes,
        amount: formData.amount || 0,
        level: formData.level || 1,
        plan_type: formData.plan_type || null,
      };
      
      if (selectedPlan) {
        await billingApi.updatePlan(selectedPlan?.plan_id || '', planData);
      } else {
        await billingApi.createPlan(planData);
      }
      
      await fetchPlans();
      dialog.onFalse();
    } catch (err: any) {
      console.error('Error saving plan:', err);
      const errorMessage = err?.response?.data?.error || (selectedPlan ? 'Failed to update plan' : 'Failed to create plan');
      setDialogError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteClick = (plan: Plan) => {
    setPlanToDelete(plan);
    deleteDialog.onTrue();
  };

  const handleConfirmDelete = async () => {
    if (!planToDelete) return;
    
    try {
      setDeleting(true);
      setError(null);
      await billingApi.deletePlan(planToDelete.plan_id);
      await fetchPlans();
      deleteDialog.onFalse();
      setPlanToDelete(null);
    } catch (err) {
      console.error('Error deleting plan:', err);
      setError('Failed to delete plan');
    } finally {
      setDeleting(false);
    }
  };

  const handleToggleStatus = async (planId: string, currentDisabled: boolean) => {
    const optimisticPlans = plans.map(plan => 
      plan.plan_id === planId 
        ? { ...plan, is_disabled: !currentDisabled }
        : plan
    );
    setPlans(optimisticPlans);

    try {
      await billingApi.updatePlan(planId, { is_disabled: !currentDisabled });
    } catch (err) {
      console.error('Error toggling plan status:', err);
      setError('Failed to toggle plan status');
      await fetchPlans();
    }
  };

  const filteredPlans = plans.filter((plan) => {
    if (filterType === 'all') return true;
    
    let pType = plan.plan_type;
    if (!pType) {
      const name = (plan.title || '').toLowerCase();
      if (name.includes('weekday')) pType = 'weekday';
      else if (name.includes('weekend')) pType = 'weekend';
      else pType = 'weekend';
    }
    return pType === filterType;
  });

  return (
    <>
      <Helmet>
        <title>Time Plans</title>
      </Helmet>

      <Box sx={{ p: 3 }}>
        {error && (
          <Typography color="error" sx={{ mb: 2 }}>
            {error}
          </Typography>
        )}
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={3}>
          <Typography variant="h4">Time Plans</Typography>
          <Stack direction="row" spacing={2}>
            <TextField
              select
              size="small"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              SelectProps={{ native: true }}
              sx={{ minWidth: 120 }}
            >
              <option value="all">All Types</option>
              <option value="weekday">Weekday</option>
              <option value="weekend">Weekend</option>
            </TextField>
            <Button
              variant="contained"
              startIcon={<Iconify icon="eva:plus-fill" />}
              onClick={handleAdd}
            >
              New Plan
            </Button>
          </Stack>
        </Stack>

        <Card>
            
          {loading &&<Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                  <CircularProgress />
                </Box>
          }
          {!loading && <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell align="center">Name</TableCell>
                  <TableCell align="center">Level</TableCell>
                  <TableCell align="center">Time (mins)</TableCell>
                   <TableCell align="center">Cost (₹)</TableCell>
                  <TableCell align="center">Type</TableCell>
                  <TableCell align="center">Enabled</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
               <TableBody>
                {filteredPlans?.map((plan) => (
                  <TableRow key={plan.plan_id}>
                    <TableCell align="center">{plan.title}</TableCell>
                    <TableCell align="center">{plan.level}</TableCell>
                    <TableCell align="center">{plan.timeInMinutes}</TableCell>
                     <TableCell align="center">₹ {plan.amount}</TableCell>
                    <TableCell align="center">
                      <Typography 
                        variant="caption" 
                        sx={{ 
                          textTransform: 'capitalize',
                          px: 1,
                          py: 0.5,
                          borderRadius: 1,
                          bgcolor: (theme) => plan.plan_type === 'weekday' ? theme.palette.info.lighter : theme.palette.warning.lighter,
                          color: (theme) => plan.plan_type === 'weekday' ? theme.palette.info.darker : theme.palette.warning.darker,
                        }}
                      >
                        {plan.plan_type || 'Auto'}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Switch
                        checked={!(plan.is_disabled ?? false)}
                        onChange={() => handleToggleStatus(plan.plan_id, plan.is_disabled ?? false)}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <IconButton onClick={() => handleEdit(plan)}>
                        <Iconify icon="eva:edit-fill" />
                      </IconButton>
                      <IconButton onClick={() => handleDeleteClick(plan)} color="error">
                        <Iconify icon="eva:trash-2-outline" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>}
        </Card>
      </Box>

      <Dialog open={dialog.value} onClose={dialog.onFalse} fullWidth maxWidth="sm">
        <DialogTitle>{selectedPlan ? 'Edit Plan' : 'New Plan'}</DialogTitle>
        <DialogContent>
          {dialogError && (
            <Typography color="error" sx={{ mb: 2, mt: 1 }}>
              {dialogError}
            </Typography>
          )}
          <Stack spacing={3} sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Plan Name"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              error={dialogError?.includes('Name') || dialogError?.includes('title')}
            />
            <TextField
              fullWidth
              type="number"
              label="Level (1/2/3)"
              value={formData.level}
              onChange={(e) => setFormData({ ...formData, level: Number(e.target.value) })}
            />
            <TextField
              fullWidth
              type="number"
              label="Time (minutes)"
              value={formData.timeInMinutes}
              onChange={(e) => setFormData({ ...formData, timeInMinutes: Number(e.target.value) })}
              error={dialogError?.includes('Time') || dialogError?.includes('timeInMinutes')}
            />
             <TextField
              fullWidth
              type="number"
              label="Cost (₹)"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
            />
            <TextField
              fullWidth
              select
              label="Plan Type"
              value={formData.plan_type}
              onChange={(e) => setFormData({ ...formData, plan_type: e.target.value as any })}
              SelectProps={{ native: true }}
              InputLabelProps={{ shrink: true }}
            >
              <option value="">Auto (Name-based)</option>
              <option value="weekday">Weekday</option>
              <option value="weekend">Weekend</option>
            </TextField>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={dialog.onFalse} disabled={submitting}>Cancel</Button>
          <LoadingButton loading={submitting} variant="contained" onClick={handleSubmit}>
            {selectedPlan ? 'Update' : 'Create'}
          </LoadingButton>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={deleteDialog.value}
        title="Delete Plan"
        content={
          <>
            Are you sure you want to delete the plan <strong>{planToDelete?.title}</strong>?
            This action cannot be undone.
          </>
        }
        confirmText="Delete"
        confirmColor="error"
        loading={deleting}
        onClose={deleteDialog.onFalse}
        onConfirm={handleConfirmDelete}
      />
    </>
  );
} 