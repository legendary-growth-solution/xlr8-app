import { LoadingButton } from '@mui/lab';
import {
  Box,
  Button,
  Card,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography
} from '@mui/material';
import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import { billingApi } from 'src/services/api/billing.api';
import { Plan } from 'src/types/billing';

interface PlanFormData {
  title: string;
  timeInMinutes: number;
  amount: number;
}

const defaultPlanData: PlanFormData = {
  title: '',
  timeInMinutes: 15,
  amount: 0,
};

export default function TimeManagementPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [formData, setFormData] = useState<PlanFormData>(defaultPlanData);
  const dialog = useBoolean();
  const [error, setError] = useState<string | null>(null);

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
    });
    dialog.onTrue();
  };

  const handleAdd = () => {
    setSelectedPlan(null);
    setFormData(defaultPlanData);
    dialog.onTrue();
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.timeInMinutes) {
      setError('Name and Time are required fields');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const planData = {
        title: formData.title,
        timeInMinutes: formData.timeInMinutes,
        amount: formData.amount || 0,
      };
      
      if (selectedPlan) {
        await billingApi.updatePlan(selectedPlan?.plan_id || '', planData);
      } else {
        await billingApi.createPlan(planData);
      }
      
      await fetchPlans();
      dialog.onFalse();
    } catch (err) {
      console.error('Error saving plan:', err);
      setError(selectedPlan ? 'Failed to update plan' : 'Failed to create plan');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (planId: string) => {
    if (!window.confirm('Are you sure you want to delete this plan?')) return;
    
    try {
      setLoading(true);
      setError(null);
      await billingApi.deletePlan(planId);
      await fetchPlans();
    } catch (err) {
      console.error('Error deleting plan:', err);
      setError('Failed to delete plan');
    } finally {
      setLoading(false);
    }
  };

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
          <Button
            variant="contained"
            startIcon={<Iconify icon="eva:plus-fill" />}
            onClick={handleAdd}
          >
            New Plan
          </Button>
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
                  <TableCell align="center">Time (mins)</TableCell>
                  <TableCell align="center">Cost (₹)</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {plans?.map((plan) => (
                  <TableRow key={plan.plan_id}>
                    <TableCell align="center">{plan.title}</TableCell>
                    <TableCell align="center">{plan.timeInMinutes}</TableCell>
                    <TableCell align="center">₹ {plan.amount}</TableCell>
                    <TableCell align="center">
                      <IconButton onClick={() => handleEdit(plan)}>
                        <Iconify icon="eva:edit-fill" />
                      </IconButton>
                      <IconButton onClick={() => handleDelete(plan.plan_id)} color="error">
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
          <Stack spacing={3} sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Plan Name"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
            <TextField
              fullWidth
              type="number"
              label="Time (minutes)"
              value={formData.timeInMinutes}
              onChange={(e) => setFormData({ ...formData, timeInMinutes: Number(e.target.value) })}
            />
            <TextField
              fullWidth
              type="number"
              label="Cost (₹)"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={dialog.onFalse}>Cancel</Button>
          <LoadingButton loading={loading} variant="contained" onClick={handleSubmit}>
            {selectedPlan ? 'Update' : 'Create'}
          </LoadingButton>
        </DialogActions>
      </Dialog>
    </>
  );
} 