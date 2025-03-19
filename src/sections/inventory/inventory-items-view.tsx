import { LoadingButton } from '@mui/lab';
import {
  Box,
  Button,
  Card,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Stack,
  Table,
  TableContainer,
  TablePagination,
  TextField,
  Typography
} from '@mui/material';
import { useCallback, useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Iconify } from 'src/components/iconify';
import DataTable from 'src/components/table/DataTable';
import { showToast } from 'src/components/toast';
import { useBoolean } from 'src/hooks/use-boolean';
import { API_ENDPOINTS } from 'src/services/api/endpoints';
import { InventoryItem, InventoryItemsResponse } from 'src/types/inventory';
import InventoryItemDialog from './inventory-item-dialog';

const categories = ['All', 'Spare Parts', 'Tools', 'Safety Equipment', 'Consumables', 'Other'];

export default function InventoryItemsView() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showLowStock, setShowLowStock] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [loading, setLoading] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [quantityDialog, setQuantityDialog] = useState({
    open: false,
    itemId: '',
    operation: '' as 'add' | 'remove',
    loading: false
  });
  const [quantityForm, setQuantityForm] = useState({
    quantity: 1,
    remarks: ''
  });
  const dialog = useBoolean();

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page + 1),
        per_page: String(rowsPerPage),
        ...(selectedCategory !== 'All' && { category: selectedCategory }),
        ...(showLowStock && { is_low_stock: 'true' }),
      });

      const response = await fetch(`${API_ENDPOINTS.INVENTORY.ITEMS.LIST}?${params}`);
      const data: InventoryItemsResponse = await response.json();
      setItems(data.items);
      setTotalItems(data.pagination.totalItems);
    } catch (error) {
      console.error('Error fetching inventory items:', error);
      showToast.error('Failed to fetch inventory items');
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, selectedCategory, showLowStock]);

  const handleCreateItem = async (data: Partial<InventoryItem>) => {
    try {
      // Optimistically add the new item
      const newItem = { ...data, id: Date.now().toString() } as InventoryItem;
      setItems((prevItems) => [...prevItems, newItem]);

      const response = await fetch(API_ENDPOINTS.INVENTORY.ITEMS.CREATE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        // Revert optimistic update if API call fails
        setItems((prevItems) => prevItems.filter(item => item.id !== newItem.id));
        throw new Error('Failed to create item');
      }

      showToast.success('Item created successfully');
    } catch (error) {
      console.error('Error creating inventory item:', error);
      showToast.error('Failed to create item');
    }
  };

  const handleUpdateItem = async (data: Partial<InventoryItem>) => {
    if (!selectedItem?.id) return;

    try {
      // Optimistically update the item
      setItems((prevItems) =>
        prevItems.map((item) =>
          item.id === selectedItem.id ? { ...item, ...data } : item
        )
      );

      const response = await fetch(API_ENDPOINTS.INVENTORY.ITEMS.UPDATE(selectedItem.id), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        // Revert optimistic update if API call fails
        setItems((prevItems) =>
          prevItems.map((item) =>
            item.id === selectedItem.id ? selectedItem : item
          )
        );
        throw new Error('Failed to update item');
      }

      showToast.success('Item updated successfully');
    } catch (error) {
      console.error('Error updating inventory item:', error);
      showToast.error('Failed to update item');
    }
  };

  const handleDeleteItem = async (id: string) => {
    try {
      setDeleteLoading(true);
      const response = await fetch(API_ENDPOINTS.INVENTORY.ITEMS.DELETE(id), {
        method: 'DELETE',
      });
  
      if (!response.ok) {
        throw new Error('Failed to delete item');
      }
  
      // Optimistically remove the item after successful deletion
      setItems((prevItems) => prevItems.filter(item => item.id !== id));
      showToast.success('Item deleted successfully');
      setDeleteConfirmOpen(false);
    } catch (error) {
      console.error('Error deleting inventory item:', error);
      showToast.error('Failed to delete item');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleUpdateQuantity = async () => {
    const { itemId, operation } = quantityDialog;
    const { quantity, remarks } = quantityForm;

    try {
      setQuantityDialog(prev => ({ ...prev, loading: true }));
      showToast.info('Saving changes...');
      
      // Optimistically update the quantity
      setItems((prevItems) =>
        prevItems.map((item) =>
          item.id === itemId
            ? {
                ...item,
                quantity:
                  operation === 'add'
                    ? item.quantity + quantity
                    : item.quantity - quantity,
              }
            : item
        )
      );

      const response = await fetch(API_ENDPOINTS.INVENTORY.ITEMS.UPDATE_QUANTITY(itemId), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity, operation, remarks }),
      });

      if (!response.ok) {
        // Revert optimistic update if API call fails
        setItems((prevItems) =>
          prevItems.map((item) =>
            item.id === itemId
              ? {
                  ...item,
                  quantity:
                    operation === 'add'
                      ? item.quantity - quantity
                      : item.quantity + quantity,
                }
              : item
          )
        );
        throw new Error('Failed to update quantity');
      }

      showToast.success('Quantity updated successfully');
      handleCloseQuantityDialog();
    } catch (error) {
      console.error('Error updating quantity:', error);
      showToast.error('Failed to update quantity');
    } finally {
      setQuantityDialog(prev => ({ ...prev, loading: false }));
    }
  };

  const handleOpenQuantityDialog = (id: string, operation: 'add' | 'remove') => {
    setQuantityDialog({
      open: true,
      itemId: id,
      operation,
      loading: false
    });
    setQuantityForm({
      quantity: 1,
      remarks: ''
    });
  };

  const handleCloseQuantityDialog = () => {
    setQuantityDialog({
      open: false,
      itemId: '',
      operation: 'add',
      loading: false
    });
    setQuantityForm({
      quantity: 1,
      remarks: ''
    });
  };

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  return (
<>
    <Helmet>
    <title>Items | Inventory</title>
  </Helmet>

  <Box sx={{ p: 3 }}>
    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
      <Typography variant="h4">Items</Typography>
    </Stack>

      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={3}>
        <Stack direction="row" spacing={2}>
          <TextField
            select
            label="Category"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            sx={{ width: 200 }}
          >
            {categories.map((category) => (
              <MenuItem key={category} value={category}>
                {category}
              </MenuItem>
            ))}
          </TextField>
          <Button
            variant={showLowStock ? 'contained' : 'outlined'}
            onClick={() => setShowLowStock(!showLowStock)}
            startIcon={<Iconify icon="mdi:alert-circle-outline" />}
          >
            Low Stock
          </Button>
        </Stack>
        <Button
          variant="contained"
          startIcon={<Iconify icon="eva:plus-fill" />}
          onClick={() => {
            setSelectedItem(null);
            dialog.onTrue();
          }}
        >
          New Item
        </Button>
      </Stack>

      <Card>
        <TableContainer sx={{ position: 'relative', overflow: 'unset' }}>
          <Table>
            {loading ? (
              <Box sx={{ p: 3, textAlign: 'center' }}>
                <CircularProgress />
              </Box>
            ) : (
              <DataTable
                columns={[
                { id: 'name', label: 'Name', align: 'left' },
                { id: 'category', label: 'Category', align: 'left' },
                { id: 'quantity', label: 'Quantity', align: 'right', format: (value) => String(value) },
                { id: 'low_stock_number', label: 'Low Stock Alert', align: 'right', format: (value) => String(value) },
                { id: 'actions', label: 'Actions', align: 'right' }
              ]}
              rows={items}
            //   getRowProps={(row:any) => ({
            //     sx: row.quantity <= (row.low_stock_number || 0) ? {
            //       backgroundColor: 'error.lighter'
            //     } : {}
            //   })}
              actions={(item) => (
                <Stack direction="row" spacing={1} justifyContent="flex-end">
                    <Button
                      size="small"
                      onClick={() => handleOpenQuantityDialog(item.id, 'add')}
                      startIcon={<Iconify icon="eva:plus-fill" />}
                    >
                      Add
                    </Button>
                    <Button
                      size="small"
                      color="error"
                      onClick={() => handleOpenQuantityDialog(item.id, 'remove')}
                      startIcon={<Iconify icon="eva:minus-fill" />}
                    >
                      Remove
                    </Button>
                    <Button
                      size="small"
                      color="error"
                      onClick={() => {
                        setItemToDelete(item.id);
                        setDeleteConfirmOpen(true);
                      }}
                      startIcon={<Iconify icon="eva:trash-2-outline" />}
                    >
                      Delete
                    </Button>
                    <Button
                      size="small"
                      color="info"
                      onClick={() => {
                        setSelectedItem(item);
                        dialog.onTrue();
                      }}
                      startIcon={<Iconify icon="eva:edit-fill" />}
                    >
                      Edit
                    </Button>
                </Stack>
              )}
            />)}
            
          </Table>
        </TableContainer>

        <TablePagination
          page={page}
          component="div"
          count={totalItems}
          rowsPerPage={rowsPerPage}
          onPageChange={(e, newPage) => setPage(newPage)}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
        />
      </Card>

      <InventoryItemDialog
        open={dialog.value}
        onClose={() => {
          dialog.onFalse();
          setSelectedItem(null);
        }}
        onSubmit={selectedItem ? handleUpdateItem : handleCreateItem}
        item={selectedItem || undefined}
        mode={selectedItem ? 'edit' : 'create'}
      />

      <Dialog
        open={deleteConfirmOpen}
        onClose={() => !deleteLoading && setDeleteConfirmOpen(false)}
        aria-labelledby="delete-confirm-dialog"
      >
        <DialogTitle id="delete-confirm-dialog">Delete Item</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this item?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)} disabled={deleteLoading}>Cancel</Button>
          <LoadingButton
            onClick={() => {
              handleDeleteItem(itemToDelete!);
            }}
            color="error"
            variant="contained"
            loading={deleteLoading}
          >
            Delete
          </LoadingButton>
        </DialogActions>
      </Dialog>

      <Dialog
        open={quantityDialog.open}
        onClose={handleCloseQuantityDialog}
        aria-labelledby="quantity-dialog"
      >
        <DialogTitle id="quantity-dialog">
          {quantityDialog.operation === 'add' ? 'Add' : 'Remove'} Quantity
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <TextField
            fullWidth
            label="Quantity"
            type="number"
            value={quantityForm.quantity}
            onChange={(e) => setQuantityForm(prev => ({ ...prev, quantity: parseInt(e.target.value, 10) || 0 }))}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Remarks (Optional)"
            value={quantityForm.remarks}
            onChange={(e) => setQuantityForm(prev => ({ ...prev, remarks: e.target.value }))}
            margin="normal"
            multiline
            rows={3}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseQuantityDialog}>Cancel</Button>
          <LoadingButton
            loading={quantityDialog.loading}
            onClick={handleUpdateQuantity}
            variant="contained"
          >
            {quantityDialog.operation === 'add' ? 'Add' : 'Remove'}
          </LoadingButton>
        </DialogActions>
      </Dialog>
    </Box>
    </>
  );
}