import { useState, useCallback, useEffect } from 'react';
import { Card, Box, Stack, Typography, Button, Chip } from '@mui/material';
import { Group } from 'src/types/session';
import { Iconify } from 'src/components/iconify';
import { billingApi } from 'src/services/api/billing.api';
import { showToast } from '../toast';
import { BillingDialog } from './billing-dialog';

interface EndedSessionGroupCardProps {
  group: Group;
  sessionId: string;
}

interface BillingData {
  gstNumber?: string;
  remarks?: string;
  discountCode?: string;
  discountAmount: number;
  totalAmount: number;
  subtotal?: number;
}

export function EndedSessionGroupCard({
  group,
  sessionId,
}: EndedSessionGroupCardProps) {
  const [openBilling, setOpenBilling] = useState(false);
  const [billingData, setBillingData] = useState<BillingData>({
    discountAmount: 0,
    totalAmount: 0,
  });
  const [isGeneratingBill, setIsGeneratingBill] = useState(false);
  const [billGenError, setBillGenError] = useState<string | null>(null);
  const [loadingBilling, setLoadingBilling] = useState(false);
  const [hasBillingData, setHasBillingData] = useState(false);

  const fetchBillingData = useCallback(async () => {
    try {
      setLoadingBilling(true);
      const response = await billingApi.getBillingData(sessionId, group.group_id);
      if (response?.data) {
        const data = response.data as any;
        if (!data.billing_data) {
          setHasBillingData(false);
        } else {
          setBillingData(data);
          setHasBillingData(true);
        }
      } else {
        setHasBillingData(false);
      }
      setLoadingBilling(false);
    } catch (error) {
      console.error('Error fetching billing data:', error);
      setLoadingBilling(false);
    }
  }, [sessionId, group.group_id]);

  const handleGenerateBill = async () => {
    try {
      setBillingData((prev) => ({
        ...prev,
        totalAmount: 0,
      }));
      setOpenBilling(true);
    } catch (error) {
      console.error('Error generating bill:', error);
    }
  };

  const handleDownloadBill = async () => {
    try {
      setIsGeneratingBill(true);
      setBillGenError(null);

      const usersWithDurations = group.users.map((user) => ({
        user_id: user.user_id,
        time_in_minutes: user.time_in_minutes || user.time_allotted,
      }));

      const response = await billingApi.generateInvoice(sessionId, group.group_id, {
        billingData: {
          gstNumber: billingData.gstNumber,
          remarks: billingData.remarks,
          discountCode: billingData.discountCode,
        },
        users: usersWithDurations,
      });

      if (response.data) {
        setBillGenError(null);
        showToast.success('Bill generated successfully');
        setOpenBilling(false);
        fetchBillingData();
      }
    } catch (error: any) {
      if (error.response?.status === 400) {
        setBillGenError(
          error.response.data.error || 'Error generating bill. Check coupon/details & try again.'
        );
      } else {
        setBillGenError('An error occurred while generating the bill');
      }
    } finally {
      setIsGeneratingBill(false);
    }
  };

  const handleBillingDataChange = (data: Partial<BillingData>) => {
    setBillingData((prev) => ({
      ...prev,
      ...data,
    }));
  };

  const handleCloseBilling = () => {
    setOpenBilling(false);
    setBillGenError(null);
    fetchBillingData();
  };

  useEffect(() => {
    if (sessionId && group.group_id) {
      fetchBillingData();
    }
  }, [sessionId, group.group_id, fetchBillingData]);

  return (
    <>
      <Card sx={{ p: 3, height: '100%' }}>
        <Stack spacing={2} height="100%">
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Typography variant="h6">{group.name}</Typography>
            <Chip
              size="small"
              label={`${group.users.length} ${group.users.length === 1 ? 'User' : 'Users'}`}
              color="primary"
              variant="outlined"
            />
          </Stack>

          <Stack spacing={1} flex={1}>
            {group.users.length > 0 ? (
              group.users.slice(0, 3).map((user) => (
                <Stack
                  key={user.user_id}
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                  sx={{
                    p: 1.5,
                    borderRadius: 1,
                    bgcolor: 'background.neutral',
                  }}
                >
                  <Typography variant="body2">{user.user_name}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {user.time_in_minutes || user.time_allotted} mins
                  </Typography>
                </Stack>
              ))
            ) : (
              <Typography variant="body2" color="text.secondary" textAlign="center">
                No users in this group
              </Typography>
            )}
            {group.users.length > 3 && (
              <Typography variant="caption" color="text.secondary" textAlign="center">
                +{group.users.length - 3} more
              </Typography>
            )}
          </Stack>

          <Button
            fullWidth
            variant={hasBillingData ? 'outlined' : 'contained'}
            startIcon={<Iconify icon="eva:file-text-fill" />}
            onClick={handleGenerateBill}
            sx={{ mt: 'auto' }}
          >
            {hasBillingData ? 'View Bill' : 'Generate Bill'}
          </Button>
        </Stack>
      </Card>

      <BillingDialog
        open={openBilling}
        onClose={handleCloseBilling}
        groupName={group.name}
        groupId={group.group_id}
        billingData={billingData}
        onBillingDataChange={handleBillingDataChange}
        onDownload={handleDownloadBill}
        isGenerating={isGeneratingBill}
        billGenError={billGenError}
        loading={loadingBilling}
        hasBillingData={hasBillingData}
        fetchBillingData={fetchBillingData}
        localGroupUsers={group.users}
        sessionId={sessionId}
      />
    </>
  );
}

