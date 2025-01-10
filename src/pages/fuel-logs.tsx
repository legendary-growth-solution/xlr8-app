import { Box, Card, Stack, TextField, Typography } from '@mui/material';
import { useEffect, useRef, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Iconify } from 'src/components/iconify';
import DataTable from 'src/components/table/DataTable';
import { cartApi } from 'src/services/api/cart.api';
import { MaintenanceLog } from 'src/types/cart';

export default function UserManagementPage() {
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [totalPages, setTotalPages] = useState(0);
  
  const [logs, setLogs] = useState<MaintenanceLog[]>([]);
  

  const columns = [
    { 
      id: 'cart_name',
      label: 'Cart Name',
      minWidth: 120,
    },
    {
      id: 'operation',
      label: 'Operation',
      minWidth: 200,
    },
    {
      id: 'quantity',
      label: 'Quantity',
      minWidth: 200,
      format: (value: number) => value ? `${value}L` : '-',
    },
    {
      id: 'cost',
      label: 'Cost',
      minWidth: 200,
      format: (value: number) => `₹${value}`,
    },
    {
      id: 'notes',
      label: 'Notes',
      minWidth: 200,
    },
    {
      id: 'timestamp',
      label: 'Timestamp',
      minWidth: 160,
      format: (value: string) => new Date(value).toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      })
    },
  ];


  const fetchLogs = async (resetPage = false) => {
    try {
      setLoading(true);

      const currentPage = resetPage ? 1 : page;
      if (resetPage) {
        setPage(1);
      }
      const response = await cartApi.getFuelLogs(
        {
          page: currentPage,
          pageSize: rowsPerPage,
          search: currentSearch.current,
        },
      );
      console.log(response);
      setLogs(response?.records);
      setTotalPages(response?.pagination?.totalPages);
    } catch (error) {
      console.error('Failed to fetch fuel logs', error);
    } finally {
      setLoading(false);
    }
  };
  const searchTimeout = useRef<NodeJS.Timeout>();
  const currentSearch = useRef('');  // Add this to track current search value

  const handleSearch = (value: string) => {
    currentSearch.current = value;  // Update the ref immediately
    setSearchQuery(value);  // Update state for input field
    
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }
  
    searchTimeout.current = setTimeout(() => {
      fetchLogs(true);  // This will now use the current search value
    }, 500);
  };
  
// Clean up effect
useEffect(() => {
  fetchLogs();
  return () => {
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }
  };
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, []);

// Pagination effect - only trigger if not from search
useEffect(() => {
  if (logs.length > 0) {
    fetchLogs(false);
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [page, rowsPerPage]);

  return (
    <>
      <Helmet>
        <title>Fuel Logs</title>
      </Helmet>

      <Box sx={{ p: 3 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
          <Typography variant="h4">Fuel Logs</Typography>
      </Stack>
        <Card sx={{ p: 3 }}>
          <Stack spacing={2}>
            <TextField
              placeholder="Search carts..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              InputProps={{
                startAdornment: <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled', mr: 1 }} />,
              }}
            />

            <DataTable
              loading={loading}
              columns={columns}
              rows={logs?.map((user, index) => ({
                ...user,
                sno: (page - 1) * rowsPerPage + index + 1,
              }))}
              page={page}
              rowsPerPage={rowsPerPage}
              totalPages={totalPages}
              onPageChange={(newPage) => setPage(newPage)}
              onRowsPerPageChange={(newRowsPerPage) => {
                setRowsPerPage(newRowsPerPage);
                setPage(1);
              }}
            />
          </Stack>
        </Card>
      </Box>
    </>
  );
} 