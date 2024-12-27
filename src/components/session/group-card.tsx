import { useState } from 'react';
import { Card, Box, Stack, Typography, Button, Skeleton } from '@mui/material';
import { Group } from 'src/types/session';
import { Iconify } from 'src/components/iconify';
import { billingApi } from 'src/services/api/billing.api';
import { useGUCData } from 'src/contexts/DataContext';
import { BillingDialog } from './billing-dialog';
import { GroupUserList } from './group-user-list';
import { GroupUserListSkeleton } from '../skeleton/GroupUserListSkeleton';

interface GroupCardProps {
  group: Group;
  onManageUsers: (group: Group) => void;
  isActive: boolean;
  onAssignCart: (
    groupId: string,
    userId: string,
    cartId: string,
    groupUserId: string
  ) => Promise<void>;
}

interface BillingData {
  gstNumber?: string;
  remarks?: string;
  discountCode?: string;
  discountAmount: number;
  totalAmount: number;
}

export function GroupCard({ group, onManageUsers, isActive, onAssignCart }: GroupCardProps) {
  const { getGroupUsers, activeGroupUsers, availableCarts, loading: gucDataLoading } = useGUCData();
  const groupUsers = getGroupUsers(group.id);
  const [isExpanded, setIsExpanded] = useState(false);
  const [openBilling, setOpenBilling] = useState(false);
  const [billingData, setBillingData] = useState<BillingData>({
    discountAmount: 0,
    totalAmount: 0,
  });
  const [isGeneratingBill, setIsGeneratingBill] = useState(false);
  const [billGenError, setBillGenError] = useState<string | null>(null);
  const [loadingBilling, setLoadingBilling] = useState(false);
  const [hasBillingData, setHasBillingData] = useState(false);

  const getBillingData = async () => {
    try {
      setLoadingBilling(true);
      const response = await billingApi.getBillingData(group.id);
      if (response.data && Object.keys(response.data).length > 0) {
        setBillingData(response.data as any);
        setHasBillingData(true);
      } else {
        setHasBillingData(false);
      }
      setLoadingBilling(false);
    } catch (error) {
      console.error('Error fetching billing data:', error);
    }
  };

  const getUserDuration = (userId: string) => {
    const activeUser = activeGroupUsers.find(
      (gu) => gu.user_id === userId && gu.group_id === group.id
    );
    if (activeUser) {
      return activeUser?.time_in_minutes || activeUser?.allowed_duration || 0;
    }
    const groupUser = groupUsers.find((gu) => gu.user_id === userId);
    return groupUser?.time_in_minutes || groupUser?.allowed_duration || 0;
  };

  const handleAssignCart = async (userId: string, cartId: string, groupUserId: string) => {
    await onAssignCart(group.id, userId, cartId, groupUserId);
  };

  const mainUsers = groupUsers.length > 3 ? groupUsers.slice(0, 2) : groupUsers;
  const remainingUsers = groupUsers.length > 3 ? groupUsers.slice(2) : [];

  const getActiveUserData = (userId: string) =>
    activeGroupUsers.find((gu) => gu.user_id === userId && gu.group_id === group.id);

  const handleGenerateBill = async () => {
    try {
      const totalAmount = groupUsers.reduce((sum, user) => {
        const duration = getUserDuration(user.user_id);
        return sum + 70000 * (duration / 60);
      }, 0);

      setBillingData((prev) => ({
        ...prev,
        totalAmount,
      }));
      setOpenBilling(true);
    } catch (error) {
      console.error('Error generating bill:', error);
    }
  };

  const handleDiscountCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBillGenError(null);
    setBillingData((prev) => ({ ...prev, discountCode: e.target.value }));
  };

  const handleDownloadBill = async () => {
    try {
      setIsGeneratingBill(true);
      setBillGenError(null);

      const usersWithDurations = groupUsers.map((user) => ({
        user_id: user.user_id,
        time_in_minutes: getUserDuration(user.user_id),
      }));

      const response = await billingApi.generateInvoice(group.id, {
        billingData: {
          gstNumber: billingData.gstNumber,
          remarks: billingData.remarks,
          discountCode: billingData.discountCode,
        },
        users: usersWithDurations,
      });

      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `invoice-${group.name}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
      setOpenBilling(false);
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

  return (
    <Box sx={{ position: 'relative', height: '100%' }}>
      {isExpanded && (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            bgcolor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 998,
            cursor: 'pointer',
          }}
          onClick={() => setIsExpanded(false)}
        />
      )}
      <Card
        sx={{
          height: '380px',
          transition: 'none',
          ...(isExpanded && {
            position: 'absolute',
            zIndex: 999,
            left: 0,
            right: 0,
            height: 'auto',
            minHeight: '100%',
            boxShadow: 24,
            overflow: 'visible',
            mb: 3,
          }),
        }}
      >
        <Box
          sx={{
            p: 3,
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
          }}
        >
          <Stack spacing={3} sx={{ flexGrow: 1 }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Typography variant="h6">{group.name}</Typography>
              <Typography
                variant="caption"
                sx={{
                  px: 1.5,
                  py: 0.5,
                  borderRadius: 1,
                  bgcolor: 'primary.lighter',
                  color: 'primary.dark',
                  fontWeight: 'bold',
                }}
              >
                {gucDataLoading ? <Skeleton variant="text" width="40px" height={24} /> : `${groupUsers.length} Racer${groupUsers.length > 1 ? 's' : ''}`}
              </Typography>
            </Stack>

            {gucDataLoading ? (
              <GroupUserListSkeleton />
            ) : (
              <GroupUserList
                mainUsers={mainUsers}
                remainingUsers={remainingUsers}
                group={group}
                availableCarts={availableCarts}
                onAssignCart={handleAssignCart}
                getActiveUserData={getActiveUserData}
                isExpanded={isExpanded}
                onExpand={setIsExpanded}
              />
            )}
          </Stack>

          <Stack
            direction={{ xs: 'column', sm: 'row', lg: 'column' }}
            spacing={2}
            sx={{ mt: mainUsers.length > 0 && !isExpanded ? 0 : 3 }}
          >
            <Button
              variant="contained"
              color="primary"
              startIcon={<Iconify icon="solar:users-group-rounded-bold" />}
              onClick={() => onManageUsers(group)}
              disabled={!isActive || gucDataLoading}
            >
              Manage Group Users
            </Button>

            <Button
              variant="contained"
              color="secondary"
              startIcon={<Iconify icon="solar:bill-list-bold" />}
              onClick={handleGenerateBill}
              disabled={groupUsers.length === 0}
              // disabled
            >
              Generate Bill
            </Button>
          </Stack>
        </Box>
      </Card>

      <BillingDialog
        open={openBilling}
        onClose={() => setOpenBilling(false)}
        groupName={group.name}
        billingData={billingData}
        onBillingDataChange={(data) => setBillingData((prev) => ({ ...prev, ...data }))}
        onDownload={handleDownloadBill}
        isGenerating={isGeneratingBill}
        billGenError={billGenError}
        loading={loadingBilling}
        hasBillingData={hasBillingData}
        fetchBillingData={getBillingData}
      />
    </Box>
  );
}
