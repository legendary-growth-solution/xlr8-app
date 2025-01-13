import { Button, Card, Chip, Stack } from '@mui/material';
import { useEffect, useState } from 'react';
import AssignCartDialog from 'src/components/cart/AssignCartDialog';
import AssignmentHistoryDialog from 'src/components/cart/AssignmentHistoryDialog';
import CartStatsGrid from 'src/components/cart/CartStatsGrid';
import MaintenanceDialog from 'src/components/cart/MaintenanceDialog';
import NewCartDialog from 'src/components/cart/NewCartDialog';
import RefuelCartDialog from 'src/components/cart/RefuelCartDialog';
import PageContainer from 'src/components/common/PageContainer';
import PageHeader from 'src/components/common/PageHeader';
import DataTable from 'src/components/table/DataTable';
import type { AssignmentHistory } from 'src/services/api/cart.api';
import { cartApi } from 'src/services/api/cart.api';
import { Cart } from 'src/types/cart';

export default function CartManagementPage() {
  const [carts, setCarts] = useState<Cart[]>([]);
  const [loading, setLoading] = useState(true);
  const [openAssignDialog, setOpenAssignDialog] = useState(false);
  const [openRefuelDialog, setOpenRefuelDialog] = useState(false);
  const [selectedCart, setSelectedCart] = useState<Cart | null>(null);
  const [openNewCartDialog, setOpenNewCartDialog] = useState(false);
  const [openMaintenanceDialog, setOpenMaintenanceDialog] = useState(false);
  const [openHistoryDialog, setOpenHistoryDialog] = useState(false);
  const [assignmentHistory, setAssignmentHistory] = useState<AssignmentHistory[]>([]);
  const [hasMore, setHasMore] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);

  const fetchCarts = async () => {
    try {
      setLoading(true);
      const response = await cartApi.list({});
      setCarts(response.carts);
    } catch (error) {
      console.error('Failed to fetch carts', error);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      id: 'name',
      label: 'Cart Name',
      minWidth: 120,
    },
    {
      id: 'variant',
      label: 'Level',
      minWidth: 120,
    },
    {
      id: 'status',
      label: 'Status',
      minWidth: 120,
      format: (value: Cart['status']) => (
        <Chip
          label={value?.toUpperCase()}
          color={
            value === 'available'
              ? 'success'
              : value === 'in-use'
                ? 'primary'
                : value === 'maintenance'
                  ? 'warning'
                  : 'error'
          }
          size="small"
        />
      ),
    },
    {
      id: 'fuel_capacity',
      label: 'Fuel Capacity',
      minWidth: 120,
      format: (value: number) => `${value} L`,
      // format: (value: number) => <FuelLevelIndicator value={value} />,
    },
    {
      id: 'fuel',
      label: 'Remaining Fuel (L)',
      minWidth: 120,
      format: (value: number) => value? `${value} L` : '-',
      // format: (value: number, row: Cart) =>
      //   `${((value * ((row as any)?.fuel_level || 0) / 100).toFixed(1))} L`,
    },
    // {
    //   id: 'total_distance',
    //   label: 'Total Distance',
    //   minWidth: 120,
    //   format: (value: number) => `${(value || 0).toFixed(1)} km`,
    // }
  ];

  const handleAssignCart = (cart: Cart) => {
    setSelectedCart(cart);
    setOpenAssignDialog(true);
  };

  const handleRefuelCart = (cart: Cart) => {
    setSelectedCart(cart);
    setOpenRefuelDialog(true);
  };

  const handleAssignSubmit = async (
    cartId: string,
    data: { userId: string; groupUserMappingId: string }
  ) => {
    try {
      await cartApi.assign(cartId, {
        userId: data.userId,
        groupUserMappingId: data.groupUserMappingId,
      });
      fetchCarts();
    } catch (error) {
      console.error('Failed to assign cart', error);
    }
    setOpenAssignDialog(false);
  };

  const handleRefuelSubmit = async (
    cartId: string,
    data: { quantity: number; cost: number; operation: string }
  ) => {
    try {
      if (!cartId) {
        console.error('No cart selected for refuel');
        return;
      }

      setLoading(true);

      const rfidNumber = (carts.find((cart) => cart.cart_id === cartId) as any)?.rfid_number;
      if (!rfidNumber) {
        console.error('No rfid number found for cart');
        return;
      }
      await cartApi.refuel(cartId, data);
      await fetchCarts();
      setSelectedCart(null);
    } catch (error) {
      console.error('Failed to refuel cart:', error);
    } finally {
      setOpenRefuelDialog(false);
      setLoading(false);
    }
  };

  const handleAddCart = async (cartData: {
    name: string;
    rfidtag: string;
    fuelLevel?: number;
    fuelCapacity?: number;
    variant?: string;
    model?: string;
  }) => {
    try {
      await cartApi.create({
        name: cartData.name,
        status: 'available',
        rfid_number: cartData.rfidtag,
        fuel_level: cartData.fuelLevel || 0,
        fuel_capacity: cartData.fuelCapacity || 10,
        variant: cartData.variant,
        model: cartData.model,
      });
      fetchCarts();
    } catch (error) {
      console.error('Failed to add cart', error);
    }
    setOpenNewCartDialog(false);
  };

  const handleMaintenanceSubmit = async (
    cartId: string,
    data: { status: 'maintenance' | 'refueling'; notes?: string }
  ) => {
    try {
      setLoading(true);
      if (!cartId) {
        console.error('No cart selected for maintenance');
        return;
      }


      const rfidNumber = (carts.find((cart) => cart.cart_id === cartId) as any)?.rfid_number;
      if (!rfidNumber) {
        console.error('No rfid number found for cart');
        return;
      }
      await cartApi.updateMaintenance(cartId, data);
      await fetchCarts();
      setSelectedCart(null);
    } catch (error) {
      console.error('Failed to update maintenance status:', error);
    } finally {
      setOpenMaintenanceDialog(false);
      setLoading(false);
    }
  };

  const handleViewHistory = async (cart: Cart) => {
    try {
      setSelectedCart(cart);
      setHistoryLoading(true);
      setOpenHistoryDialog(true);
      
      const response = await cartApi.getAssignmentHistory(cart.rfid_number || '');
      setAssignmentHistory(response.history);
      setHasMore(response.has_more);
    } catch (error) {
      console.error('Failed to fetch assignment history:', error);
    } finally {
      setHistoryLoading(false);
    }
  };

  const actions = (cart: Cart) => (
    <Stack direction="row" spacing={1} justifyContent="flex-end">
      {/* <Button
        size="small"
        variant="outlined"
        onClick={() => handleViewHistory(cart)}
      >
        View History
      </Button> */}
      <Button
        size="small"
        variant="outlined"
        color="warning"
        onClick={() => handleRefuelCart(cart)}
        disabled={
          cart.status === 'in-use' || cart.status === 'maintenance' || cart.status === 'refueling'
        }
      >
        Update Fuel
      </Button>
      <Button
        size="small"
        variant="outlined"
        color={cart.status === 'maintenance' || cart.status === 'refueling' ? 'success' : 'info'}
        onClick={() => {
          setSelectedCart(cart);
          setOpenMaintenanceDialog(true);
        }}
        disabled={cart.status === 'in-use'}
      >
        {cart.status === 'maintenance'
          ? 'Complete Maintenance'
          : cart.status === 'refueling'
            ? 'Complete Refueling'
            : 'Update Status'}
      </Button>
    </Stack>
  );

  useEffect(() => {
    fetchCarts();
  }, []);

  return (
    <PageContainer title="Cart Management">
      <PageHeader
        title="Cart Management"
        action={{
          label: 'New Cart',
          onClick: () => setOpenNewCartDialog(true),
        }}
      />

      <CartStatsGrid carts={carts} />

      <Card>
        <DataTable loading={loading} columns={columns} rows={carts} actions={actions} />
      </Card>

      <AssignCartDialog
        open={openAssignDialog}
        onClose={() => setOpenAssignDialog(false)}
        cart={selectedCart}
        onAssign={handleAssignSubmit}
      />

      <RefuelCartDialog
        open={openRefuelDialog}
        onClose={() => {
          setOpenRefuelDialog(false);
          setSelectedCart(null);
        }}
        cart={selectedCart}
        onRefuel={(data: { quantity: number; cost: number; operation: string; notes?: string }) =>
          selectedCart && handleRefuelSubmit(selectedCart?.cart_id || '', data)
        }
      />

      <NewCartDialog
        open={openNewCartDialog}
        onClose={() => setOpenNewCartDialog(false)}
        onAdd={handleAddCart}
      />

      <MaintenanceDialog
        open={openMaintenanceDialog}
        onClose={() => {
          setOpenMaintenanceDialog(false);
          setSelectedCart(null);
        }}
        cart={selectedCart}
        onSubmit={(data) =>
          selectedCart &&
          handleMaintenanceSubmit(
            selectedCart?.cart_id || '',
            data as { status: 'maintenance' | 'refueling'; notes?: string }
          )
        }
      />

      <AssignmentHistoryDialog
        open={openHistoryDialog}
        onClose={() => {
          setOpenHistoryDialog(false);
          setSelectedCart(null);
          setAssignmentHistory([]);
        }}
        cart={selectedCart}
        history={assignmentHistory}
        hasMore={hasMore}
        loading={historyLoading}
      />
    </PageContainer>
  );
}
