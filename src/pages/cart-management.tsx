import { useState, useEffect } from 'react';
import { Button, Card, Chip, Stack } from '@mui/material';
import { Cart } from 'src/types/cart';
import DataTable from 'src/components/table/DataTable';
import { cartApi } from 'src/services/api/cart.api';
import RefuelCartDialog from 'src/components/cart/RefuelCartDialog';
import AssignCartDialog from 'src/components/cart/AssignCartDialog';
import NewCartDialog from 'src/components/cart/NewCartDialog';
import PageContainer from 'src/components/common/PageContainer';
import PageHeader from 'src/components/common/PageHeader';
import CartStatsGrid from 'src/components/cart/CartStatsGrid';
import FuelLevelIndicator from 'src/components/cart/FuelLevelIndicator';
import MaintenanceDialog from 'src/components/cart/MaintenanceDialog';

export default function CartManagementPage() {
  const [carts, setCarts] = useState<Cart[]>([]);
  const [loading, setLoading] = useState(true);
  const [openAssignDialog, setOpenAssignDialog] = useState(false);
  const [openRefuelDialog, setOpenRefuelDialog] = useState(false);
  const [selectedCart, setSelectedCart] = useState<Cart | null>(null);
  const [openNewCartDialog, setOpenNewCartDialog] = useState(false);
  const [openMaintenanceDialog, setOpenMaintenanceDialog] = useState(false);

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
      id: 'current_level',
      label: 'Fuel Level',
      minWidth: 120,
      format: (value: number) => <FuelLevelIndicator value={value} />,
    },
    {
      id: 'current_level',
      label: 'Remaining Fuel (L)',
      minWidth: 120,
      format: (value: number, row: Cart) =>
        `${((value * ((row as any)?.fuel_capacity || 0) / 100).toFixed(1))} L`,
    },
    {
      id: 'total_distance',
      label: 'Total Distance',
      minWidth: 120,
      format: (value: number) => `${(value || 0).toFixed(1)} km`,
    }
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
    data: { amount: number; cost: number; operation: string }
  ) => {
    try {
      if (!cartId) {
        console.error('No cart selected for refuel');
        return;
      }

      const refuelData = {
        ...data,
        date: new Date().toISOString(),
      };

      const rfidNumber = (carts.find((cart) => cart.id === cartId) as any)?.rfid_number;
      if (!rfidNumber) {
        console.error('No rfid number found for cart');
        return;
      }
      await cartApi.refuel(rfidNumber, refuelData);
      await fetchCarts();
      setSelectedCart(null);
    } catch (error) {
      console.error('Failed to refuel cart:', error);
    } finally {
      setOpenRefuelDialog(false);
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
        current_level: cartData.fuelLevel || 0,
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
      if (!cartId) {
        console.error('No cart selected for maintenance');
        return;
      }

      const maintenanceData = {
        ...data,
        date: new Date().toISOString(),
      };

      const rfidNumber = (carts.find((cart) => cart.id === cartId) as any)?.rfid_number;
      if (!rfidNumber) {
        console.error('No rfid number found for cart');
        return;
      }
      await cartApi.updateMaintenance(rfidNumber, maintenanceData);
      await fetchCarts();
      setSelectedCart(null);
    } catch (error) {
      console.error('Failed to update maintenance status:', error);
    } finally {
      setOpenMaintenanceDialog(false);
    }
  };

  const actions = (cart: Cart) => (
    <Stack direction="row" spacing={1} justifyContent="flex-end">
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
        onRefuel={(data: { amount: number; cost: number; operation: string; notes?: string }) =>
          selectedCart && handleRefuelSubmit(selectedCart?.id || '', data)
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
            selectedCart?.id || '',
            data as { status: 'maintenance' | 'refueling'; notes?: string }
          )
        }
      />
    </PageContainer>
  );
}
