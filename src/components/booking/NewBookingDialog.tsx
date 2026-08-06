import type { Plan } from 'src/types/session';

import { useRef, useState, useEffect } from 'react';

import { LoadingButton } from '@mui/lab';
import {
  Box,
  Stack,
  Button,
  Dialog,
  Typography,
  DialogTitle,
  DialogActions,
  DialogContent,
} from '@mui/material';

import { Iconify } from 'src/components/iconify';

import { BookingSummary } from './BookingSummary';
import { PlanCartSelector } from './PlanCartSelector';
import { StickySummaryBar } from './StickySummaryBar';
import { UserSelectionStep } from './UserSelectionStep';
import { PeopleCountSelector } from './PeopleCountSelector';
import { calculateBookingTotal } from './bookingSummaryUtils';

import type { PlanCartSelection, DiscountInfo } from './bookingSummaryUtils';

interface NewBookingDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmitSuccess: () => void;
  plans: Plan[];
}

const steps = ['Configure Booking', 'Add Users & Details'];

export function NewBookingDialog({ open, onClose, onSubmitSuccess, plans }: NewBookingDialogProps) {
  const [activeStep, setActiveStep] = useState(0);
  const [peopleCount, setPeopleCount] = useState(2);
  const [sameForAll, setSameForAll] = useState(true);
  const [selections, setSelections] = useState<PlanCartSelection[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [isUserStepValid, setIsUserStepValid] = useState(false);
  const [discount, setDiscount] = useState<DiscountInfo | null>(null);
  const userStepRef = useRef<{ handleSubmit: () => Promise<void> } | null>(null);

  useEffect(() => {
    if (open && plans.length > 0) {
      const defaultPlan = plans.find(p => (p.level || 1) === 2) || plans[0];
      const initialSelections: PlanCartSelection[] = [{
        planId: defaultPlan.plan_id,
        cartType: '2',
        count: peopleCount,
      }];
      setSelections(initialSelections);
    }
  }, [open, plans, peopleCount]);

  useEffect(() => {
    if (sameForAll && plans.length > 0) {
      const defaultPlan = plans.find(p => (p.level || 1) === 2) || plans[0];
      setSelections(prevSelections => {
        const masterSelection = prevSelections[0] || {
          planId: defaultPlan.plan_id,
          cartType: '2',
          count: peopleCount,
        };
        return [{ ...masterSelection, count: peopleCount }];
      });
    } else if (!sameForAll) {
      const defaultPlan = plans.find(p => (p.level || 1) === 2) || plans[0];
      setSelections(prevSelections => {
        const individualSelections: PlanCartSelection[] = Array.from(
          { length: peopleCount },
          (_, index) => prevSelections[index] || {
            planId: defaultPlan?.plan_id || '',
            cartType: '2',
            count: 1,
          }
        );
        return individualSelections;
      });
    }
  }, [peopleCount, sameForAll, plans]);

  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleClose = () => {
    setActiveStep(0);
    setPeopleCount(2);
    setSameForAll(true);
    setSelections([]);
    setDiscount(null);
    onClose();
  };

  const canProceedToNext = () => {
    if (activeStep === 0) {
      return peopleCount > 0 && selections.length > 0 && 
             selections.every(s => s.planId && s.cartType);
    }
    return true;
  };

  const { subtotal, total: totalAmount } = calculateBookingTotal({ peopleCount, selections, plans, sameForAll, discount: discount || undefined });

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <Stack spacing={3}>
            <PeopleCountSelector
              count={peopleCount}
              onChange={setPeopleCount}
            />
            
            <PlanCartSelector
              plans={plans}
              peopleCount={peopleCount}
              selections={selections}
              onChange={setSelections}
              sameForAll={sameForAll}
              onSameForAllChange={setSameForAll}
            />
            
            <BookingSummary
              peopleCount={peopleCount}
              selections={selections}
              plans={plans}
              sameForAll={sameForAll}
              discount={discount}
            />
          </Stack>
        );
      
      case 1:
        return (
          <UserSelectionStep
            peopleCount={peopleCount}
            selections={selections}
            plans={plans}
            sameForAll={sameForAll}
            onSubmit={async (bookingData) => {
              onSubmitSuccess();
              handleClose();
            }}
            submitting={submitting}
            ref={userStepRef}
            onValidityChange={setIsUserStepValid}
            onDiscountChange={setDiscount}
          />
        );
      
      default:
        return null;
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{
        sx: { 
          maxHeight: '80vh',
          height: '80vh'
        }
      }}
    >
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} flexDirection={{ xs: 'column', sm: 'row' }} gap={2}>
          <Box>
            <Typography variant="h6">
              Create Booking (Draft Session)
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Configure your booking in two simple steps
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.5, sm: 1 }, alignSelf: { xs: 'stretch', sm: 'auto' } }}>
            {steps.map((label, index) => (
              <Box key={label} sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.5, sm: 1 }, flex: { xs: 1, sm: 'none' } }}>
                <Box
                  sx={{
                    width: { xs: 20, sm: 24 },
                    height: { xs: 20, sm: 24 },
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: { xs: '0.7rem', sm: '0.75rem' },
                    fontWeight: 'bold',
                    bgcolor: activeStep >= index ? 'primary.main' : 'grey.300',
                    color: activeStep >= index ? 'primary.contrastText' : 'text.secondary',
                  }}
                >
                  {index + 1}
                </Box>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    fontSize: { xs: '0.7rem', sm: '0.75rem' },
                    color: activeStep >= index ? 'text.primary' : 'text.secondary',
                    fontWeight: activeStep === index ? 'bold' : 'normal',
                    display: { xs: 'block', sm: 'block' },
                    whiteSpace: 'nowrap'
                  }}
                >
                  {label}
                </Typography>
                {index < steps.length - 1 && (
                  <Box
                    sx={{
                      width: { xs: 16, sm: 20 },
                      height: 1,
                      bgcolor: activeStep > index ? 'primary.main' : 'grey.300',
                      mx: { xs: 0.25, sm: 0.5 },
                      flex: { xs: 1, sm: 'none' }
                    }}
                  />
                )}
              </Box>
            ))}
          </Box>
        </Box>
      </DialogTitle>
      
      <DialogContent sx={{ p: 0, display: 'flex', flexDirection: 'column', flex: 1 }}>
        <Box sx={{ px: 3, pt: 3, flex: 1, overflowY: 'auto' }}>
          <Box sx={{ mb: 3 }}>
            {renderStepContent()}
          </Box>
        </Box>
        <StickySummaryBar
          peopleCount={peopleCount}
          total={totalAmount}
          hasDiscount={!!discount}
          originalTotal={discount ? subtotal : undefined}
        />
      </DialogContent>
      
      <DialogActions sx={{ px: 3, pb: 3, pt: 2 }}>
        <Button onClick={handleClose} color="inherit">
          Cancel
        </Button>
        
        <Box sx={{ flex: 1 }} />
        
        {activeStep > 0 && (
          <Button onClick={handleBack} color="inherit">
            Back
          </Button>
        )}
        
        {activeStep < steps.length - 1 ? (
          <Button 
            variant="contained" 
            onClick={handleNext}
            disabled={!canProceedToNext()}
          >
            Next: Add Users
          </Button>
        ) : (
          <LoadingButton
            variant="contained"
            loading={submitting}
            disabled={!isUserStepValid || submitting}
            onClick={async () => {
              if (userStepRef.current?.handleSubmit) {
                setSubmitting(true);
                try {
                  await userStepRef.current.handleSubmit();
                } finally {
                  setSubmitting(false);
                }
              }
            }}
            startIcon={<Iconify icon="eva:checkmark-circle-2-fill" />}
          >
            Create Booking
          </LoadingButton>
        )}
      </DialogActions>
    </Dialog>
  );
}
