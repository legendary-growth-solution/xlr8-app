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
  Typography,
} from '@mui/material';
import { billingApi } from 'src/services/api/billing.api';
import { Iconify } from 'src/components/iconify';
import { showToast } from 'src/components/toast';
import { useEffect, useState, useCallback } from 'react';
import { BillingDetailsTable } from './billing-details-table';

interface BillingData {
  gstNumber?: string;
  remarks?: string;
  discountCode?: string;
  discountAmount: number;
  totalAmount: number;
  subtotal?: number;
}

interface BillingDialogProps {
  open: boolean;
  onClose: () => void;
  groupName: string;
  groupId: string;
  billingData: BillingData | any;
  onBillingDataChange: (data: Partial<BillingData>) => void;
  onDownload: () => Promise<void>;
  isGenerating: boolean;
  billGenError: string | null;
  loading: boolean;
  hasBillingData?: boolean;
  fetchBillingData: () => void;
  localGroupUsers?: any;
}

const GST_REGEX = /^\d{2}[A-Z]{5}\d{4}[A-Z]{1}[A-Z\d]{1}[Z]{1}[A-Z\d]{1}$/;

export function BillingDialog({
  open,
  onClose,
  groupName,
  groupId,
  billingData,
  onBillingDataChange,
  onDownload,
  isGenerating,
  billGenError,
  loading,
  hasBillingData,
  fetchBillingData,
  localGroupUsers
}: BillingDialogProps) {
  const [plans, setPlans] = useState<any>([]);
  const [loadingPlans, setLoadingPlans] = useState<boolean>(false);
  const [planError, setPlanError] = useState<string>('');
  const [gstError, setGstError] = useState<string>('');
  const [step, setStep] = useState<'coupon' | 'details'>('coupon');
  const [validatingCode, setValidatingCode] = useState(false);
  const [codeError, setCodeError] = useState<string>('');

  const handleGstChange = (value: string) => {
    if (value && !GST_REGEX.test(value)) {
      setGstError('Invalid GST Number format');
    } else {
      setGstError('');
    }
    onBillingDataChange({ 
      gstNumber: value,
      discountCode: billingData?.discountCode || '',
      discountAmount: billingData?.discountAmount || 0
    });
  };

  const handleDownload = () => {
    if (billingData.gstNumber && !GST_REGEX.test(billingData.gstNumber)) {
      setGstError('Invalid GST Number format');
      return;
    }
    onDownload();
  };

  const handleValidateCode = async () => {
    if (!billingData?.discountCode) {
      setCodeError('Please enter a discount code');
      return;
    }

    try {
      setValidatingCode(true);
      setCodeError('');
      const response = await billingApi.validateDiscountCode(groupId, billingData.discountCode);

      if (!response.data.valid) {
        setCodeError(response.data.message || 'Invalid or expired discount code');
        showToast.error(response.data.message || 'Invalid or expired discount code');
        return;
      }

      showToast.success(response.data.message || 'Discount code applied successfully');
      onBillingDataChange({ 
        discountAmount: response.data.discount_amount || 0,
        discountCode: billingData.discountCode?.toUpperCase()
      });
      setStep('details');
    } catch (error) {
      const errorMessage = error?.response?.data?.message || 'Error validating code';
      setCodeError(errorMessage);
      showToast.error(errorMessage);
    } finally {
      setValidatingCode(false);
    }
  };

  const handleSkipCoupon = () => {
    onBillingDataChange({ 
      discountCode: '', 
      discountAmount: 0,
      gstNumber: billingData?.gstNumber || ''
    });
    setStep('details');
  };

  const calculateTotal = useCallback(() => {

    if (!localGroupUsers?.length || loadingPlans || !plans.length) return 0;

    const total = localGroupUsers.reduce((acc: number, user: any) => {
      const userPlan = plans.find((p: any) => p.id === user.plan_id);
      if (!userPlan) {
        console.warn(`Plan not found for user ${user.id}`);
        return acc;
      }
      return acc + (userPlan.cost || 0);
    }, 0);

    const finalAmount = total - (billingData.discountAmount || 0);
    
    onBillingDataChange({
      totalAmount: finalAmount,
      subtotal: total,
    });
    
    return total;

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [plans, billingData.discountAmount, localGroupUsers]);

  useEffect(() => {
    if (!hasBillingData && plans.length > 0) {
      calculateTotal();
    }
  }, [hasBillingData, calculateTotal, plans]);

  useEffect(() => {
    if (fetchBillingData && open) fetchBillingData();
    if (open) setStep('coupon');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const renderCouponStep = () => (
    <Stack spacing={3} sx={{ mt: 2 }}>
      <TextField
        label="Discount Code"
        fullWidth
        value={billingData?.discountCode}
        onChange={(e) => {
          setCodeError('');
          onBillingDataChange({ discountCode: e.target.value });
        }}
        error={!!codeError}
        helperText={codeError}
      />
      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
        Enter a discount code if applicable and click Validate to proceed, or click Skip to continue
        without a discount
      </Typography>
    </Stack>
  );

  const getPlans = () => {
    setLoadingPlans(true);
    billingApi
      .getPlans()
      .then((response) => {
        setPlans(response.data);
      })
      .catch((error) => {
        setPlanError(error?.response?.data?.message || 'Error fetching plans');
        showToast.error(error?.response?.data?.message || 'Error fetching plans');
      })
      .finally(() => {
        setLoadingPlans(false);
      });
  };

  useEffect(() => {
    if (open && !hasBillingData) {
      getPlans();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const renderDetailsStep = () => (
    <Stack spacing={3} sx={{ mt: 2 }}>
      <TextField
        label="GST Number (Optional)"
        fullWidth
        value={billingData?.gstNumber}
        onChange={(e) => handleGstChange(e.target.value)}
        error={!!gstError}
        helperText={gstError}
      />

      <TextField
        label="Remarks (Optional)"
        fullWidth
        multiline
        rows={3}
        value={billingData?.remarks}
        onChange={(e) => onBillingDataChange({ remarks: e.target.value })}
      />

      <Stack spacing={2} sx={{ p: 2, bgcolor: 'background.neutral', borderRadius: 1 }}>
        <Typography variant="subtitle1">Summary</Typography>
        <Stack direction="row" justifyContent="space-between">
          <Typography variant="body2">Total Users:</Typography>
          <Typography variant="body2">{billingData?.users?.length || localGroupUsers?.length || 0}</Typography>
        </Stack>
        {billingData?.discountCode && (
          <Stack direction="row" justifyContent="space-between">
            <Typography variant="body2">Applied Coupon:</Typography>
            <Typography variant="body2">{billingData.discountCode?.toUpperCase()}</Typography>
          </Stack>
        )}
        <Stack direction="row" justifyContent="space-between">
          <Typography variant="body2">Amount:</Typography>
          <Typography variant="body2">₹{billingData?.subtotal?.toFixed(2) || '0.00'}</Typography>
        </Stack>
        {billingData?.discountAmount > 0 && (
          <Stack direction="row" justifyContent="space-between">
            <Typography variant="body2">Discount Amount:</Typography>
            <Typography variant="body2">₹{billingData.discountAmount.toFixed(2)}</Typography>
          </Stack>
        )}
        <Stack direction="row" justifyContent="space-between">
          <Typography variant="subtitle2">Final Amount:</Typography>
          <Typography variant="subtitle2">
            ₹{billingData?.totalAmount?.toFixed(2) || '0.00'}
          </Typography>
        </Stack>
      </Stack>
    </Stack>
  );

  const renderExistingBillingData = () => (
    <Stack spacing={3} sx={{ mt: 2 }}>
      <TextField
        label="GST Number"
        fullWidth
        value={billingData?.billing_data?.gstNumber}
        disabled
      />

      <TextField
        label="Discount Code"
        fullWidth
        value={billingData?.billing_data?.discountCode}
        disabled
      />

      <TextField
        label="Remarks"
        fullWidth
        multiline
        rows={3}
        value={billingData?.billing_data?.remarks}
        disabled
      />

      <BillingDetailsTable billingData={billingData} />
    </Stack>
  );

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {hasBillingData ? 'Generated' : 'Generate'} Bill for {groupName}
      </DialogTitle>
      <DialogContent>
        {loading ? (
          <CircularProgress />
        ) : hasBillingData ? (
          renderExistingBillingData()
        ) : step === 'coupon' ? (
          renderCouponStep()
        ) : (
          renderDetailsStep()
        )}
      </DialogContent>
      <DialogActions sx={{ justifyContent: 'space-between' }}>
        <FormHelperText sx={{ ml: 2, color: 'red' }}>{billGenError}</FormHelperText>
        <Stack direction="row" spacing={2}>
          {!hasBillingData && step === 'details' && (
            <Button onClick={() => setStep('coupon')}>Back</Button>
          )}
          <Button onClick={onClose} disabled={isGenerating || validatingCode}>
            Cancel
          </Button>
          {!hasBillingData && (
            <>
              {step === 'coupon' && (
                <Button onClick={handleSkipCoupon} disabled={validatingCode}>
                  Skip
                </Button>
              )}
              <Button
                onClick={step === 'coupon' ? handleValidateCode : handleDownload}
                variant="contained"
                disabled={isGenerating || validatingCode || (step === 'details' && !!gstError)}
                startIcon={
                  isGenerating || validatingCode ? (
                    <CircularProgress size={20} color="inherit" />
                  ) : (
                    <Iconify
                      icon={step === 'coupon' ? 'eva:checkmark-circle-2-fill' : 'eva:save-fill'}
                    />
                  )
                }
              >
                {isGenerating
                  ? 'Applying...'
                  : validatingCode
                    ? 'Validating...'
                    : step === 'coupon'
                      ? 'Validate Code'
                      : 'Save and Generate Bill'}
              </Button>
            </>
          )}
        </Stack>
      </DialogActions>
    </Dialog>
  );
}
