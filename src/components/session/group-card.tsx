import { useState, useCallback } from 'react';
import { Card, Box, Stack, Typography, Button } from '@mui/material';
import { Cart, Group, NewUser, Plan, User, UserRaceStatus } from 'src/types/session';
import { Iconify } from 'src/components/iconify';
import { GroupUserList } from './group-user-list';
import { ConfirmDialog } from '../dialog/confirm-dialog';
import { DeleteButton } from '../delete-button';
import { ManageUsersDialog } from './manage-users-dialog';

interface GroupCardProps {
  group: Group
  carts: Cart[]
  getCarts: VoidFunction
  plans: Plan[];
  handleAssignCart: (group_id: string, user_id: string, cart_id: string) => void;
  handleRemoveUser: (group_id: string, user_id: string) => void;
  handleDeleteGroup: (group_id: string) => void;
  handleAddUsers: (group_id: string, data: NewUser[]) => void;
  handleUpdateUser: (group_id: string, user_id: string, data: NewUser) => void;
  handleManageUserRace: (group_id: string, user_id: string, status: UserRaceStatus) => void;
  sessionId: string;
  users: User[];
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
  users
}: GroupCardProps) {
  // const [localGroupUsers, setLocalGroupUsers] = useState<any[]>([]);
  // const [isExpanded, setIsExpanded] = useState(false);
  // const [openBilling, setOpenBilling] = useState(false);
  // const [billingData, setBillingData] = useState<BillingData>({
  //   discountAmount: 0,
  //   totalAmount: 0,
  // });
  // const [isGeneratingBill, setIsGeneratingBill] = useState(false);
  // const [billGenError, setBillGenError] = useState<string | null>(null);
  // const [loadingBilling, setLoadingBilling] = useState(false);
  // const [hasBillingData, setHasBillingData] = useState(false);
  // const [isUpdating, setIsUpdating] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showManageUsers, setShowManageUsers] = useState(false);

  // const [isDeleting, setIsDeleting] = useState(false);

  // const getBillingData = async () => {
  //   try {
  //     setLoadingBilling(true);
  //     api.billing.get()
  //     const response = await billingApi.getBillingData(group.id);
  //     if (response.data && Object.keys(response.data).length > 0) {
  //       setBillingData(response.data as any);
  //       setHasBillingData(true);
  //     } else {
  //       setHasBillingData(false);
  //     }
  //     setLoadingBilling(false);
  //   } catch (error) {
  //     console.error('Error fetching billing data:', error);
  //   }
  // };

  // const getUserDuration = (userId: string) => {
  //   const activeUser = activeGroupUsers.find(
  //     (gu) => gu.user_id === userId && gu.group_id === group.id
  //   );
  //   if (activeUser) {
  //     return activeUser?.time_in_minutes || activeUser?.allowed_duration || 0;
  //   }
  //   const groupUser = localGroupUsers.find((gu) => gu.user_id === userId);
  //   return groupUser?.time_in_minutes || groupUser?.allowed_duration || 0;
  // };


  // const mainUsers = localGroupUsers.length > 3 ? localGroupUsers.slice(0, 2) : localGroupUsers;
  // const remainingUsers = localGroupUsers.length > 3 ? localGroupUsers.slice(2) : [];

  // const getActiveUserData = (userId: string) =>
  //   activeGroupUsers.find((gu) => gu.user_id === userId && gu.group_id === group.id);

  // const handleGenerateBill = async () => {
  //   try {
  //     // const totalAmount = localGroupUsers.reduce((sum, user) => {
  //     //   const duration = getUserDuration(user.user_id);
  //     //   return sum + 70000 * (duration / 60);
  //     // }, 0);

  //     setBillingData((prev) => ({
  //       ...prev,
  //       totalAmount: 0,
  //       totalUsers: localGroupUsers.length,
  //     }));
  //     setOpenBilling(true);
  //   } catch (error) {
  //     console.error('Error generating bill:', error);
  //   }
  // };

  // const handleDiscountCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   setBillGenError(null);
  //   setBillingData((prev) => ({ ...prev, discountCode: e.target.value }));
  // };

  // const handleDownloadBill = async () => {
  //   try {
  //     setIsGeneratingBill(true);
  //     setBillGenError(null);

  //     const usersWithDurations = localGroupUsers.map((user) => ({
  //       user_id: user.user_id,
  //       time_in_minutes: getUserDuration(user.user_id),
  //     }));

  //     const response = await billingApi.generateInvoice(group.group_id, {
  //       billingData: {
  //         gstNumber: billingData.gstNumber,
  //         remarks: billingData.remarks,
  //         discountCode: billingData.discountCode,
  //       },
  //       users: usersWithDurations,
  //     });
  //     if (response.data) {
  //       setBillGenError(null);
  //       showToast.success('Bill generated successfully');
  //       setOpenBilling(false);
  //     }

  //     // const blob = new Blob([response.data], { type: 'application/pdf' });
  //     // const url = window.URL.createObjectURL(blob);
  //     // const a = document.createElement('a');
  //     // a.href = url;
  //     // a.download = `invoice-${group.name}.pdf`;
  //     // a.click();
  //     // window.URL.revokeObjectURL(url);
  //     // setOpenBilling(false);
  //   } catch (error: any) {
  //     if (error.response?.status === 400) {
  //       setBillGenError(
  //         error.response.data.error || 'Error generating bill. Check coupon/details & try again.'
  //       );
  //     } else {
  //       setBillGenError('An error occurred while generating the bill');
  //     }
  //   } finally {
  //     setIsGeneratingBill(false);
  //   }
  // };

  // const handleUserUpdate = useCallback((updatedUsers: any[], isLoading = true) => {
  //   setLocalGroupUsers(updatedUsers);
  //   setIsUpdating(isLoading);
  // }, []);

  // const handleManageUsers = useCallback(
  //   (grp: Group) => {
  //     onManageUsers({
  //       ...grp,
  //       onUpdate: handleUserUpdate,
  //     });
  //   },
  //   [onManageUsers, handleUserUpdate]
  // );

  return (
    <Box sx={{ position: 'relative', height: '100%' }}>
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
      />
      <Card
        sx={{
          // height: '380px',
          transition: 'all 0.2s ease-in-out',
          // position: 'relative',
          '&:hover .delete-icon': {
            opacity: 1,
          },
          position: 'absolute',
          zIndex: 999,
          left: 0,
          right: 0,
          height: 'auto',
          minHeight: '100%',
          boxShadow: 24,
          overflow: 'visible',
          mb: 3,
        }}
      >
        <DeleteButton
          className="delete-icon"
          onDelete={() => setShowDeleteDialog(true)}
        // disabled={!isActive || gucDataLoading || isUpdating || isDeleting}
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
                {group?.users.length} Racers
              </Typography>
            </Stack>

            <GroupUserList
              users={group?.users}
              group={group}
              carts={carts}
              getCarts={getCarts}
              handleAssignCart={handleAssignCart}
              handleManageUserRace={handleManageUserRace}
            />
          </Stack>

          <Stack
            direction={{ xs: 'column', sm: 'row', lg: 'column' }}
            spacing={2}
          // sx={{ mt: mainUsers.length > 0 && !isExpanded ? 0 : 3 }}
          >
            <Button
              variant="contained"
              color="primary"
              startIcon={<Iconify icon="solar:users-group-rounded-bold" />}
              onClick={() => setShowManageUsers(true)}
            // disabled={!isActive || gucDataLoading || isUpdating}
            >
              Manage Group Users
            </Button>

            {/* <Button
              variant="contained"
              color="secondary"
              startIcon={<Iconify icon="solar:bill-list-bold" />}
              onClick={handleGenerateBill}
              disabled={localGroupUsers.length === 0}
              // disabled
            >
              {(group as any)?.isBillGenerated ? 'View' : 'Generate'} Bill
            </Button> */}
          </Stack>
        </Box>
      </Card>

      <ConfirmDialog
        open={showDeleteDialog}
        title="Delete Group"
        content={`Are you sure you want to delete ${group.name}? This action cannot be undone.`}
        confirmText="Delete"
        confirmColor="error"
        // loading={isDeleting}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={() => handleDeleteGroup(group?.group_id)}
      />

      <ManageUsersDialog
        open={showManageUsers}
        onClose={()=>{setShowManageUsers(false)}}
        group={group}
        handleUpdateUser={handleUpdateUser}
        handleAddUsers={handleAddUsers}
        handleRemoveUser={handleRemoveUser}
        plans={plans}
      />


      {/* <BillingDialog
        open={openBilling}
        onClose={() => setOpenBilling(false)}
        groupName={group.name}
        groupId={group.group_id}
        billingData={billingData}
        onBillingDataChange={(data) => setBillingData((prev: BillingData) => ({ ...prev, ...data }))}
        onDownload={handleDownloadBill}
        isGenerating={isGeneratingBill}
        billGenError={billGenError}
        loading={loadingBilling}
        hasBillingData={hasBillingData}
        fetchBillingData={getBillingData}
        localGroupUsers={localGroupUsers}
      /> */}
    </Box>
  );
}
