import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Stack,
  InputAdornment,
  CircularProgress,
  FormHelperText,
} from '@mui/material';
import { Iconify } from 'src/components/iconify';
import { useEffect, useState } from 'react';

interface BillingData {
  gstNumber?: string;
  remarks?: string;
  discountCode?: string;
  discountAmount: number;
  totalAmount: number;
}

interface BillingDialogProps {
  open: boolean;
  onClose: () => void;
  groupName: string;
  billingData: BillingData | any;
  onBillingDataChange: (data: Partial<BillingData>) => void;
  onDownload: () => Promise<void>;
  isGenerating: boolean;
  billGenError: string | null;
  loading: boolean;
  hasBillingData?: boolean;
  fetchBillingData: () => void;
}

const GST_REGEX = /^\d{2}[A-Z]{5}\d{4}[A-Z]{1}[A-Z\d]{1}[Z]{1}[A-Z\d]{1}$/;

export function BillingDialog({
  open,
  onClose,
  groupName,
  billingData,
  onBillingDataChange,
  onDownload,
  isGenerating,
  billGenError,
  loading,
  hasBillingData,
  fetchBillingData,
}: BillingDialogProps) {
  const [gstError, setGstError] = useState<string>('');

  const handleGstChange = (value: string) => {
    if (value && !GST_REGEX.test(value)) {
      setGstError('Invalid GST Number format');
    } else {
      setGstError('');
    }
    onBillingDataChange({ gstNumber: value });
  };

  const handleDownload = () => {
    if (billingData.gstNumber && !GST_REGEX.test(billingData.gstNumber)) {
      setGstError('Invalid GST Number format');
      return;
    }
    onDownload();
  };

  useEffect(() => {
    if (fetchBillingData && open) fetchBillingData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Generate Bill for {groupName}</DialogTitle>
      <DialogContent>
        {loading ? (
          <CircularProgress />
        ) : (
          <Stack spacing={3} sx={{ mt: 2 }}>
            <TextField
              label="GST Number (Optional)"
              fullWidth
              value={hasBillingData ? billingData?.billing_data?.gstNumber : billingData?.gstNumber}
              onChange={(e) => handleGstChange(e.target.value)}
              error={!!gstError}
              helperText={gstError}
              disabled={hasBillingData}
            />

            <TextField
              label="Discount Code"
              fullWidth
              value={
                hasBillingData ? billingData?.billing_data?.discountCode : billingData?.discountCode
              }
              onChange={(e) =>
                !hasBillingData && onBillingDataChange({ discountCode: e.target.value })
              }
              disabled={hasBillingData}
            />

            <TextField
              label="Remarks (Optional)"
              fullWidth
              multiline
              rows={3}
              value={billingData?.remarks}
              onChange={(e) => onBillingDataChange({ remarks: e.target.value })}
            />

            <TextField
              label="Total Amount"
              fullWidth
              disabled
              value={billingData?.totalAmount?.toFixed(2)}
              InputProps={{
                startAdornment: <InputAdornment position="start">₹</InputAdornment>,
              }}
            />
          </Stack>
        )}
      </DialogContent>
      <DialogActions sx={{ justifyContent: 'space-between' }}>
        <FormHelperText sx={{ ml: 2, color: 'red' }}>{billGenError}</FormHelperText>
        <Stack direction="row" spacing={2}>
          <Button onClick={onClose} disabled={isGenerating}>
            Cancel
          </Button>
          {/* <Button
            onClick={handleDownload}
            variant="contained"
            disabled={isGenerating || !!gstError}
            startIcon={
              isGenerating ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                <Iconify icon="solar:download-bold" />
              )
            }
          >
            {isGenerating ? 'Generating...' : 'Download Bill'}
          </Button> */}
          <Button
            onClick={handleDownload}
            variant="contained"
            disabled={isGenerating || !!gstError}
            startIcon={
              isGenerating ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                <Iconify icon="eva:save-fill" />
              )
            }
          >
            {isGenerating ? 'Applying...' : 'Save and Generate Bill'}
          </Button>
        </Stack>
      </DialogActions>
    </Dialog>
  );
}
