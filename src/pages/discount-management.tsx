import { Box, Button, Card, Stack, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import { DiscountDialog } from 'src/sections/discount/discount-dialog';
import { DiscountTable } from 'src/sections/discount/discount-table';
import { billingApi } from 'src/services/api/billing.api';
import { defaultDiscountData, DiscountCode, DiscountFormData } from 'src/types/billing';

export default function DiscountManagementPage() {
  const [discounts, setDiscounts] = useState<any>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDiscount, setSelectedDiscount] = useState<DiscountCode | null>(null);
  const [formData, setFormData] = useState<DiscountFormData>(defaultDiscountData);
  const dialog = useBoolean();
  const [error, setError] = useState<string | null>(null);

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

  useEffect(() => {
    fetchDiscounts();
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