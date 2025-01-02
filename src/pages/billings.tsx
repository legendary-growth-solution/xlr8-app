import { useState, useEffect } from 'react';
import {
  Card,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Container,
  Stack,
  TablePagination,
  Dialog,
  DialogTitle,
  DialogContent,
} from '@mui/material';
import { BillingDetailsTable } from 'src/components/session/billing-details-table';
import { useBoolean } from 'src/hooks/use-boolean';
import { billingApi } from 'src/services/api/billing.api';

interface BillingData {
  id: string;
  invoice_number: string;
  created_at: string;
  status: string;
  billing_data: {
    grand_total: number;
    total_amount: number;
    total_cgst: number;
    total_sgst: number;
    total_discount: number;
    total_tax: number;
  };
  users: Array<any>;
}

export default function BillingsPage() {
  const [billings, setBillings] = useState<BillingData[]>([]);
  const [selectedBilling, setSelectedBilling] = useState<BillingData | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const dialog = useBoolean();

  const fetchBillings = async () => {
    try {
      const response = await billingApi.getAllInvoices();
      setBillings(response.data as any);
    } catch (error) {
      console.error('Failed to fetch billings', error);
    }
  };

  useEffect(() => {
    fetchBillings();
  }, []);

  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleRowClick = (billing: BillingData) => {
    setSelectedBilling(billing);
    dialog.onTrue();
  };

  return (
    <Container>
      <Stack spacing={3}>
        <Typography variant="h4">Billings</Typography>

        <Card>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Invoice Number</TableCell>
                  <TableCell>Date</TableCell>
                  {/* <TableCell>Status</TableCell> */}
                  <TableCell>Total Amount</TableCell>
                  <TableCell>Discount</TableCell>
                  <TableCell>Tax</TableCell>
                  <TableCell>Grand Total</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {billings
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((billing) => (
                    <TableRow
                      key={billing.id}
                      hover
                      onClick={() => handleRowClick(billing)}
                      sx={{ cursor: 'pointer' }}
                    >
                      <TableCell>{billing.invoice_number}</TableCell>
                      <TableCell>{new Date(billing.created_at).toLocaleString()}</TableCell>
                      {/* <TableCell sx={{ textTransform: 'capitalize' }}>{billing.status}</TableCell> */}
                      <TableCell>₹{billing.billing_data.total_amount}</TableCell>
                      <TableCell>₹{billing.billing_data.total_discount}</TableCell>
                      <TableCell>₹{billing.billing_data.total_tax}</TableCell>
                      <TableCell>₹{billing.billing_data.grand_total}</TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={billings.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Card>
      </Stack>

      <Dialog open={dialog.value} onClose={dialog.onFalse} maxWidth="md" fullWidth>
        <DialogContent sx={{ pt: 0 }}>
          {selectedBilling && <BillingDetailsTable billingData={selectedBilling} />}
        </DialogContent>
      </Dialog>
    </Container>
  );
}
