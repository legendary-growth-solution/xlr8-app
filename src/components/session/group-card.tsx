import { useState, useEffect, useCallback } from 'react';
import { Card, Box, Stack, Typography, Button, Skeleton } from '@mui/material';
import { Group } from 'src/types/session';
import { Iconify } from 'src/components/iconify';
import { billingApi } from 'src/services/api/billing.api';
import { useGUCData } from 'src/contexts/DataContext';
import { alpha } from '@mui/material/styles';
import { sessionApi } from 'src/services/api/session.api';
import { BillingDialog } from './billing-dialog';
import { GroupUserList } from './group-user-list';
import { GroupUserListSkeleton } from '../skeleton/GroupUserListSkeleton';
import { showToast } from '../toast';
import { ConfirmDialog } from '../dialog/confirm-dialog';
import { DeleteButton } from '../delete-button';

interface GroupCardProps {
  group: Group;
  onManageUsers: (
    group: Group & { onUpdate?: (users: any[], isLoading?: boolean) => void }
  ) => void;
  isActive: boolean;
  onAssignCart: (
    groupId: string,
    userId: string,
    cartId: string,
    groupUserId: string
  ) => Promise<void>;
  onGroupDeleted: (groupId: string, success: boolean) => void;
  sessionId: string;
  onGroupDeleteSuccess: () => void;
}

interface BillingData {
  gstNumber?: string;
  remarks?: string;
  discountCode?: string;
  discountAmount: number;
  totalAmount: number;
  subtotal?: number;
}

export function GroupCard({
  group,
  onManageUsers,
  isActive,
  onAssignCart,
  onGroupDeleted,
  sessionId,
  onGroupDeleteSuccess,
}: GroupCardProps) {
  const {
    getGroupUsers,
    activeGroupUsers,
    availableCarts,
    loading: gucDataLoading,
    refreshGroupUsers,
  } = useGUCData();
  const [localGroupUsers, setLocalGroupUsers] = useState<any[]>([]);
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
  const [isUpdating, setIsUpdating] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const users = getGroupUsers(group.id);
    setLocalGroupUsers(users);
  }, [group.id, getGroupUsers]);

  // useEffect(() => {
  //   const handleGroupUpdate = async () => {
  //     await refreshGroupUsers();
  //     const updatedUsers = getGroupUsers(group.id);
  //     setLocalGroupUsers(updatedUsers);
  //   };

  //   handleGroupUpdate();
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, []);

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
    const groupUser = localGroupUsers.find((gu) => gu.user_id === userId);
    return groupUser?.time_in_minutes || groupUser?.allowed_duration || 0;
  };

  const handleAssignCart = async (userId: string, cartId: string, groupUserId: string) => {
    await onAssignCart(group.id, userId, cartId, groupUserId);
  };

  const mainUsers = localGroupUsers.length > 3 ? localGroupUsers.slice(0, 2) : localGroupUsers;
  const remainingUsers = localGroupUsers.length > 3 ? localGroupUsers.slice(2) : [];

  const getActiveUserData = (userId: string) =>
    activeGroupUsers.find((gu) => gu.user_id === userId && gu.group_id === group.id);

  const handleGenerateBill = async () => {
    try {
      // const totalAmount = localGroupUsers.reduce((sum, user) => {
      //   const duration = getUserDuration(user.user_id);
      //   return sum + 70000 * (duration / 60);
      // }, 0);

      setBillingData((prev) => ({
        ...prev,
        totalAmount: 0,
        totalUsers: localGroupUsers.length,
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

      const usersWithDurations = localGroupUsers.map((user) => ({
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
      if (response.data) {
        setBillGenError(null);
        showToast.success('Bill generated successfully');
        setOpenBilling(false);
      }

      // const blob = new Blob([response.data], { type: 'application/pdf' });
      // const url = window.URL.createObjectURL(blob);
      // const a = document.createElement('a');
      // a.href = url;
      // a.download = `invoice-${group.name}.pdf`;
      // a.click();
      // window.URL.revokeObjectURL(url);
      // setOpenBilling(false);
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

  const handleUserUpdate = useCallback((updatedUsers: any[], isLoading = true) => {
    setLocalGroupUsers(updatedUsers);
    setIsUpdating(isLoading);
  }, []);

  const handleManageUsers = useCallback(
    (grp: Group) => {
      onManageUsers({
        ...grp,
        onUpdate: handleUserUpdate,
      });
    },
    [onManageUsers, handleUserUpdate]
  );

  const handleDeleteGroup = async () => {
    try {
      setIsDeleting(true);
      onGroupDeleteSuccess();
      setShowDeleteDialog(false);

      await sessionApi.deleteGroup(sessionId, group.id);
      showToast.success('Group deleted successfully');
      onGroupDeleted(group.id, true);
    } catch (error) {
      console.error('Error deleting group:', error);
      showToast.error('Failed to delete group');
      onGroupDeleted(group.id, false);
    } finally {
      setIsDeleting(false);
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
          transition: 'all 0.2s ease-in-out',
          position: 'relative',
          '&:hover .delete-icon': {
            opacity: 1,
          },
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
        <DeleteButton
          className="delete-icon"
          onDelete={() => setShowDeleteDialog(true)}
          disabled={!isActive || gucDataLoading || isUpdating || isDeleting}
        />

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
                {gucDataLoading ? (
                  <Skeleton variant="text" width="40px" height={24} />
                ) : (
                  `${localGroupUsers.length} Racer${localGroupUsers.length > 1 ? 's' : ''}`
                )}
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
                isUpdating={isUpdating}
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
              onClick={() => handleManageUsers(group)}
              disabled={!isActive || gucDataLoading || isUpdating}
            >
              Manage Group Users
            </Button>

            <Button
              variant="contained"
              color="secondary"
              startIcon={<Iconify icon="solar:bill-list-bold" />}
              onClick={handleGenerateBill}
              disabled={localGroupUsers.length === 0}
              // disabled
            >
              {(group as any)?.isBillGenerated ? 'View' : 'Generate'} Bill
            </Button>
          </Stack>
        </Box>
      </Card>

      <ConfirmDialog
        open={showDeleteDialog}
        title="Delete Group"
        content={`Are you sure you want to delete ${group.name}? This action cannot be undone.`}
        confirmText="Delete"
        confirmColor="error"
        loading={isDeleting}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDeleteGroup}
      />

      <BillingDialog
        open={openBilling}
        onClose={() => setOpenBilling(false)}
        groupName={group.name}
        groupId={group.id}
        billingData={billingData}
        onBillingDataChange={(data) => setBillingData((prev) => ({ ...prev, ...data }))}
        onDownload={handleDownloadBill}
        isGenerating={isGeneratingBill}
        billGenError={billGenError}
        loading={loadingBilling}
        hasBillingData={hasBillingData}
        fetchBillingData={getBillingData}
        localGroupUsers={localGroupUsers}
      />
    </Box>
  );
}
