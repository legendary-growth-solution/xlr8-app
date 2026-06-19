import { Box, Button, Card, Stack, Typography, Switch, FormControlLabel, TextField, Grid, InputAdornment, Tooltip, IconButton } from '@mui/material';
import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import { DiscountDialog } from 'src/sections/discount/discount-dialog';
import { DiscountTable } from 'src/sections/discount/discount-table';
import { billingApi } from 'src/services/api/billing.api';
import { defaultDiscountData, DiscountCode, DiscountFormData, BookingRules } from 'src/types/billing';

export default function DiscountManagementPage() {
  const [discounts, setDiscounts] = useState<any>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDiscount, setSelectedDiscount] = useState<DiscountCode | null>(null);
  const [formData, setFormData] = useState<DiscountFormData>(defaultDiscountData);
  const dialog = useBoolean();
  const [error, setError] = useState<string | null>(null);
  const [bookingRules, setBookingRules] = useState<BookingRules | null>(null);
  const [savingRules, setSavingRules] = useState(false);

  const fetchDiscounts = async () => {
    try {
      setError(null);
      const response = await billingApi.getDiscountCodes();
      setDiscounts(response?.data?.discounts);
    } catch (err) {
      console.error('Error fetching discount codes:', err);
      setError('Failed to load discount codes');
      setDiscounts([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchBookingRules = async () => {
    try {
      const response = await billingApi.getBookingRules();
      if (response && response.data) {
        setBookingRules(response.data);
      }
    } catch (err) {
      console.error('Error fetching booking rules:', err);
    }
  };

  useEffect(() => {
    fetchDiscounts();
    fetchBookingRules();
  }, []);

  const handleEdit = (discount: DiscountCode) => {
    setSelectedDiscount(discount);
    setFormData({
      code: discount.code,
      description: discount.description,
      type: discount.type,
      value: discount.value,
      status: discount.status,
    });
    dialog.onTrue();
  };

  const handleSaveRules = async () => {
    if (!bookingRules) return;
    try {
      setSavingRules(true);
      setError(null);
      await billingApi.updateBookingRules(bookingRules);
      await fetchBookingRules();
    } catch (err) {
      console.error('Error saving booking rules:', err);
      setError('Failed to update booking rules');
    } finally {
      setSavingRules(false);
    }
  };

  const handleAdd = () => {
    setSelectedDiscount(null);
    setFormData(defaultDiscountData);
    dialog.onTrue();
  };

  const handleSubmit = async () => {
    if (!formData.code || !formData.value) {
      setError('Code and Value are required fields');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      if (selectedDiscount) {
        await billingApi.updateDiscountCode(selectedDiscount.discount_id, formData);
      } else {
        await billingApi.createDiscountCode(formData);
      }
      
      await fetchDiscounts();
      dialog.onFalse();
    } catch (err) {
      console.error('Error saving discount code:', err);
      setError(selectedDiscount ? 'Failed to update discount code' : 'Failed to create discount code');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (discountId: string) => {
    if (!window.confirm('Are you sure you want to delete this discount code?')) return;
    
    try {
      setLoading(true);
      setError(null);
      await billingApi.deleteDiscountCode(discountId);
      await fetchDiscounts();
    } catch (err) {
      console.error('Error deleting discount code:', err);
      setError('Failed to delete discount code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Discount Codes</title>
      </Helmet>

      <Box sx={{ p: 3 }}>
        {error && (
          <Typography color="error" sx={{ mb: 2 }}>
            {error}
          </Typography>
        )}

        <Card sx={{ p: 3, mb: 4, display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: { xs: 'flex-start', md: 'center' }, justifyContent: 'space-between', gap: 3 }}>
          <Box>
            <Stack direction="row" alignItems="center" spacing={0.5}>
              <Typography variant="h6">
                Default Booking Discount
              </Typography>
              <Tooltip title="This will be applied for all the users on the app by default">
                <IconButton size="small" sx={{ color: 'text.secondary' }}>
                  <Iconify icon="eva:info-outline" width={16} height={16} />
                </IconButton>
              </Tooltip>
            </Stack>
            <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
              Automatically apply a percentage discount on all bookings before checkout.
            </Typography>
          </Box>
          {bookingRules && (
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center" sx={{ width: { xs: 1, md: 'auto' } }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={bookingRules.default_discount_enabled}
                    onChange={(e) =>
                      setBookingRules({
                        ...bookingRules,
                        default_discount_enabled: e.target.checked,
                      })
                    }
                    color="primary"
                  />
                }
                label="Enabled"
                sx={{ mr: 1 }}
              />
              <TextField
                size="small"
                label="Discount"
                type="number"
                disabled={!bookingRules.default_discount_enabled}
                value={bookingRules.default_discount_percent}
                onChange={(e) =>
                  setBookingRules({
                    ...bookingRules,
                    default_discount_percent: parseFloat(e.target.value) || 0,
                  })
                }
                InputProps={{
                  endAdornment: <InputAdornment position="end">%</InputAdornment>,
                }}
                sx={{ width: 120 }}
              />
              <Button
                variant="contained"
                color="primary"
                onClick={handleSaveRules}
                disabled={savingRules}
                startIcon={savingRules ? undefined : <Iconify icon="eva:save-fill" />}
                sx={{ height: 40, minWidth: 120 }}
              >
                {savingRules ? 'Saving...' : 'Save Rules'}
              </Button>
            </Stack>
          )}
        </Card>

        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={3}>
          <Typography variant="h4">Discount Codes</Typography>
          <Button
            variant="contained"
            startIcon={<Iconify icon="eva:plus-fill" />}
            onClick={handleAdd}
          >
            New Discount Code
          </Button>
        </Stack>

        <Card>
          <DiscountTable
            discounts={discounts}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onAdd={handleAdd}
            loading={loading}
          />
        </Card>
      </Box>

      <DiscountDialog
        open={dialog.value}
        onClose={dialog.onFalse}
        onSubmit={handleSubmit}
        loading={loading}
        formData={formData}
        setFormData={setFormData}
        isEdit={!!selectedDiscount}
      />
    </>
  );
} 