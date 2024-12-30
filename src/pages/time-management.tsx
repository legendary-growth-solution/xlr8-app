import { LoadingButton } from '@mui/lab';
import {
  Box,
  Button,
  Card,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import { billingApi } from 'src/services/api/billing.api';
import { Plan } from 'src/types/billing';

interface PlanFormData {
  name: string;
  defaultTime: number;
  cost: number;
  isVisible: boolean;
  description: string;
}

const defaultPlanData: PlanFormData = {
  name: '',
  defaultTime: 15,
  cost: 0,
  isVisible: true,
  description: '',
};

export default function TimeManagementPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(false);
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
      setPlans(
        response?.data?.map((plan: any) => ({
          ...plan,
          defaultTime: plan.default_time,
          isVisible: plan.is_visible,
        }))
      );
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
      name: plan.name,
      defaultTime: plan.defaultTime,
      cost: plan.cost,
      isVisible: plan.isVisible,
      description: plan.description || '',
    });
    dialog.onTrue();
  };

  const handleAdd = () => {
    setSelectedPlan(null);
    setFormData(defaultPlanData);
    dialog.onTrue();
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.defaultTime) {
      setError('Name and Time are required fields');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const planData = {
        name: formData.name,
        defaultTime: formData.defaultTime,
        cost: formData.cost || 0,
        isVisible: formData.isVisible,
        description: formData.description || ''
      };
      
      if (selectedPlan) {
        await billingApi.updatePlan(selectedPlan?.id || '', planData);
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
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell align="center">Time (mins)</TableCell>
                  <TableCell align="right">Cost (₹)</TableCell>
                  <TableCell align="center">Visible</TableCell>
                  <TableCell align="right">Description</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {plans.map((plan) => (
                  <TableRow key={plan.id}>
                    <TableCell>{plan.name}</TableCell>
                    <TableCell align="center">{plan.defaultTime}</TableCell>
                    <TableCell align="right">₹{plan.cost}</TableCell>
                    <TableCell align="center">
                      <Switch checked={plan.isVisible} disabled />
                    </TableCell>
                    <TableCell align="right">{plan.description}</TableCell>
                    <TableCell align="right">
                      <IconButton onClick={() => handleEdit(plan)}>
                        <Iconify icon="eva:edit-fill" />
                      </IconButton>
                      <IconButton onClick={() => handleDelete(plan.id)} color="error">
                        <Iconify icon="eva:trash-2-outline" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      </Box>

      <Dialog open={dialog.value} onClose={dialog.onFalse} fullWidth maxWidth="sm">
        <DialogTitle>{selectedPlan ? 'Edit Plan' : 'New Plan'}</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Plan Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
            <TextField
              fullWidth
              type="number"
              label="Time (minutes)"
              value={formData.defaultTime}
              onChange={(e) => setFormData({ ...formData, defaultTime: Number(e.target.value) })}
            />
            <TextField
              fullWidth
              type="number"
              label="Cost (₹)"
              value={formData.cost}
              onChange={(e) => setFormData({ ...formData, cost: Number(e.target.value) })}
            />
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
            <Stack direction="row" alignItems="center" spacing={1}>
              <Switch
                checked={formData.isVisible}
                onChange={(e) => setFormData({ ...formData, isVisible: e.target.checked })}
              />
              <Typography>Visible to users</Typography>
            </Stack>
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