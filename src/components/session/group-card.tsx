import { useState, useCallback, useEffect } from 'react';
import { Card, Box, Stack, Typography, Button } from '@mui/material';
import { Cart, Group, NewUser, Plan, UpdatingUser, User, UserRaceStatus } from 'src/types/session';
import { Iconify } from 'src/components/iconify';
import { billingApi } from 'src/services/api/billing.api';
import { showToast } from '../toast';
import { GroupUserList } from './group-user-list';
import { ConfirmDialog } from '../dialog/confirm-dialog';
import { DeleteButton } from '../delete-button';
import { ManageUsersDialog } from './manage-users-dialog';
import { BillingDialog } from './billing-dialog';

interface GroupCardProps {
  group: Group;
  carts: Cart[];
  getCarts: VoidFunction;
  plans: Plan[];
  handleAssignCart: (group_id: string, user_id: string, cart_id: string) => void;
  handleRemoveUser: (group_id: string, user_id: string) => void;
  handleDeleteGroup: (group_id: string) => void;
  handleAddUsers: (group_id: string, data: NewUser[]) => void;
  handleUpdateUser: (group_id: string, user_id: string, data: UpdatingUser) => void;
  handleManageUserRace: (group_id: string, user_id: string, status: UserRaceStatus, updates?: any) => void;
  sessionId: string;
  users: User[];
  isSessionActive?: boolean;
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
  carts,
  getCarts,
  plans,
  handleAssignCart,
  handleDeleteGroup,
  handleManageUserRace,
  handleRemoveUser,
  handleAddUsers,
  handleUpdateUser,
  sessionId,
  users,
  isSessionActive = true,
}: GroupCardProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showManageUsers, setShowManageUsers] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [localGroup, setLocalGroup] = useState(group);
  const [openBilling, setOpenBilling] = useState(false);
  const [billingData, setBillingData] = useState<BillingData>({
    discountAmount: 0,
    totalAmount: 0,
  });
  const [isGeneratingBill, setIsGeneratingBill] = useState(false);
  const [billGenError, setBillGenError] = useState<string | null>(null);
  const [loadingBilling, setLoadingBilling] = useState(false);
  const [hasBillingData, setHasBillingData] = useState(false);

  useEffect(() => {
    setLocalGroup((prev) => {
      const optimisticUsers = prev?.users?.filter((u) => (u as any)._isOptimistic) || [];
      const nonOptimisticUsers = group.users.filter(
        (u) => !optimisticUsers.some((ou) => ou.user_id === u.user_id)
      );

      return {
        ...group,
        users: [...nonOptimisticUsers, ...optimisticUsers],
      };
    });
  }, [group]);

  const handleLocalRemoveUser = useCallback(
    (groupId: string, userId: string) => {
      handleRemoveUser(groupId, userId);
      setLocalGroup((prev) => ({
        ...prev,
        users: prev.users.filter((u) => u.user_id !== userId),
      }));
    },
    [handleRemoveUser]
  );

  const handleLocalAddUsers = useCallback(
    async (groupId: string, newUsers: NewUser[], onComplete?: () => void) => {
      const optimisticUsers = newUsers.map((user) => ({
        user_id: user.user_id,
        user_name: user.user_name,
        name: user.user_name,
        email: '',
        phone: '',
        plan_id: user.plan_id,
        time_in_minutes: user.time_in_minutes,
        cart_id: null,
        race_active: false,
        total_active_seconds: 0,
        time_allotted: user.time_in_minutes || 0,
        race_end_time: '',
        race_start_times: [],
        race_pause_times: [],
        total_remaining_seconds: user.time_in_minutes || 0,
        _isOptimistic: true,
      }));

      setLocalGroup((prev) => ({
        ...prev,
        users: [...prev.users, ...optimisticUsers] as any,
      }));

      try {
        await handleAddUsers(groupId, newUsers);
        await new Promise(resolve => setTimeout(resolve, 500));
        setLocalGroup((prev) => ({
          ...prev,
          users: prev.users.map(u => 
            (u as any)._isOptimistic ? 
              { ...u, _isOptimistic: false } : 
              u
          ),
        }));
        if (onComplete) onComplete();
      } catch (error) {
        console.error('Error adding users:', error);
        setLocalGroup((prev) => ({
          ...prev,
          users: prev.users.filter((u) => !(u as any)._isOptimistic),
        }));
        if (onComplete) onComplete();
      }
    },
    [handleAddUsers]
  );

  const getBillingData = async () => {
    try {
      setLoadingBilling(true);
      const response = await billingApi.getBillingData(sessionId, group.group_id);
      if (response.data && Object.keys(response.data).length > 0) {
        if ((response?.data as any)?.has_discount) {
          setBillingData((prev) => ({
            ...prev,
            discountCode: (response?.data as any)?.discount_code?.toUpperCase(),
          }));
        }
        else {
          setBillingData(response.data as any);
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
  };

  const handleGenerateBill = async () => {
    try {
      setBillingData((prev) => ({
        ...prev,
        totalAmount: 0,
        totalUsers: localGroup.users.length,
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

      const usersWithDurations = localGroup.users.map((user) => ({
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

  return (
    <Box sx={{ position: 'relative', height: '100%' }}>
      <Card
        sx={{
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            transform: isDeleting ? 'none' : 'scale(1.02)',
            boxShadow: isDeleting ? 'none' : 24,
            zIndex: 999,
          },
          '&:hover .delete-icon': {
            opacity: isDeleting ? 0 : 1,
          },
          height: '100%',
          overflow: 'visible',
          opacity: isDeleting ? 0.5 : 1,
          pointerEvents: isDeleting ? 'none' : 'auto',
          filter: isDeleting ? 'grayscale(100%)' : 'none',
        }}
      >
        {isSessionActive && (
        <DeleteButton
          className="delete-icon"
          onDelete={() => setShowDeleteDialog(true)}
          sx={{ opacity: 1 }}
          disabled={isDeleting}
        />
        )}

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
              <Typography variant="h6">{localGroup.name}</Typography>
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
                {localGroup?.users.length} Racers
              </Typography>
            </Stack>

            <GroupUserList
              users={localGroup?.users}
              group={localGroup}
              carts={carts}
              getCarts={getCarts}
              handleAssignCart={handleAssignCart}
              handleManageUserRace={handleManageUserRace}
              plans={plans}
              disabled={!isSessionActive}
            />
          </Stack>

          <Stack direction={{ xs: 'column', sm: 'row', lg: 'column' }} spacing={2} marginTop={2}>
            {isSessionActive && (
            <Button
              variant="contained"
              color="primary"
              startIcon={<Iconify icon="solar:users-group-rounded-bold" />}
              onClick={() => setShowManageUsers(true)}
              disabled={isDeleting}
            >
              Manage Group Users
            </Button>
            )}

            <Button
              variant="contained"
              color="secondary"
              startIcon={<Iconify icon="solar:bill-list-bold" />}
              onClick={handleGenerateBill}
              disabled={localGroup.users.length === 0 || isDeleting}
            >
              {hasBillingData ? 'View' : 'Generate'} Bill
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
        onConfirm={() => {
          setIsDeleting(true);
          handleDeleteGroup(group?.group_id);
          setShowDeleteDialog(false);
        }}
      />

      <ManageUsersDialog
        open={showManageUsers}
        onClose={() => {
          setShowManageUsers(false);
        }}
        group={localGroup}
        handleUpdateUser={handleUpdateUser}
        handleAddUsers={handleLocalAddUsers}
        handleRemoveUser={handleLocalRemoveUser}
        plans={plans}
        sessionUsers={users as any}
      />

      <BillingDialog
        open={openBilling}
        onClose={() => setOpenBilling(false)}
        groupName={localGroup.name}
        groupId={localGroup.group_id}
        billingData={billingData}
        onBillingDataChange={(data) => setBillingData((prev) => ({ ...prev, ...data }))}
        onDownload={handleDownloadBill}
        isGenerating={isGeneratingBill}
        billGenError={billGenError}
        loading={loadingBilling}
        hasBillingData={hasBillingData}
        fetchBillingData={getBillingData}
        localGroupUsers={localGroup.users}
        sessionId={sessionId}
      />
    </Box>
  );
}
