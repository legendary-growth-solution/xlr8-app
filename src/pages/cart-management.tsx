import { useState, useEffect } from 'react';
import { Button, Card, Chip, Stack } from '@mui/material';
import { Cart } from 'src/types/cart';
import DataTable from 'src/components/table/DataTable';
import { MOCK_CARTS } from 'src/services/mock/mock-data';
import RefuelCartDialog from 'src/components/cart/RefuelCartDialog';
import AssignCartDialog from 'src/components/cart/AssignCartDialog';
import NewCartDialog from 'src/components/cart/NewCartDialog';
import PageContainer from 'src/components/common/PageContainer';
import PageHeader from 'src/components/common/PageHeader';
import CartStatsGrid from 'src/components/cart/CartStatsGrid';
import FuelLevelIndicator from 'src/components/cart/FuelLevelIndicator';

export default function CartManagementPage() {
  const [carts, setCarts] = useState<Cart[]>([]);
  const [loading, setLoading] = useState(true);
  const [openAssignDialog, setOpenAssignDialog] = useState(false);
  const [openRefuelDialog, setOpenRefuelDialog] = useState(false);
  const [selectedCart, setSelectedCart] = useState<Cart | null>(null);
  const [openNewCartDialog, setOpenNewCartDialog] = useState(false);

  const columns = [
    { 
      id: 'name', 
      label: 'Cart Name',
      minWidth: 120 
    },
    {
      id: 'status',
      label: 'Status',
      minWidth: 120,
      format: (value: Cart['status']) => (
        <Chip
          label={value?.toUpperCase()}
          color={
            value === 'available' ? 'success' :
            value === 'in-use' ? 'primary' :
            value === 'maintenance' ? 'warning' : 'error'
          }
          size="small"
        />
      ),
    },
    {
      id: 'fuelLevel',
      label: 'Fuel Level',
      minWidth: 120,
      format: (value: number) => <FuelLevelIndicator value={value} />,
    },
    {
      id: 'totalDistance',
      label: 'Total Distance',
      minWidth: 120,
      format: (value: number) => `${value.toFixed(1)} km`,
    },
    {
      id: 'currentUser',
      label: 'Assigned To',
      minWidth: 150,
      format: (value: string) => value || 'Unassigned',
    },
  ];

  const handleAssignCart = (cart: Cart) => {
    setSelectedCart(cart);
    setOpenAssignDialog(true);
  };

  const handleRefuelCart = (cart: Cart) => {
    setSelectedCart(cart);
    setOpenRefuelDialog(true);
  };

  const handleAddCart = (cartData: { name: string; rfidtag: string }) => {
    const newCart: Cart = {
      id: `cart-${carts.length + 1}`,
      name: cartData.name,
      status: 'available',
      fuelLevel: 100,
      totalDistance: 0,
      currentUser: '',
      rfidTag: cartData.rfidtag,
    };

    setCarts([...carts, newCart]);
  };

  const actions = (cart: Cart) => (
    <Stack direction="row" spacing={1}>
      <Button
        size="small"
        variant="outlined"
        onClick={() => handleAssignCart(cart)}
        disabled={cart.status !== 'available'}
      >
        Assign
      </Button>
      <Button
        size="small"
        variant="outlined"
        color="warning"
        onClick={() => handleRefuelCart(cart)}
        disabled={cart.status === 'in-use'}
      >
        Refuel
      </Button>
    </Stack>
  );

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setCarts(MOCK_CARTS);
      setLoading(false);
    }, 500);
  }, []);

  return (
    <PageContainer title="Cart Management">
      <PageHeader 
        title="Cart Management"
        action={{
          label: "New Cart",
          onClick: () => setOpenNewCartDialog(true)
        }}
      />

      <CartStatsGrid carts={carts} />

      <Card>
        <DataTable
          loading={loading}
          columns={columns}
          rows={carts}
          actions={actions}
        />
      </Card>

      <AssignCartDialog
        open={openAssignDialog}
        onClose={() => setOpenAssignDialog(false)}
        cart={selectedCart}
      />

      <RefuelCartDialog
        open={openRefuelDialog}
        onClose={() => setOpenRefuelDialog(false)}
        cart={selectedCart}
      />

      <NewCartDialog
        open={openNewCartDialog}
        onClose={() => setOpenNewCartDialog(false)}
        onAdd={handleAddCart}
      />
    </PageContainer>
  );
} 