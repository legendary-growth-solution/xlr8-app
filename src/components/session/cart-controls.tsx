import { 
  Stack, 
  IconButton, 
  Menu, 
  MenuItem, 
  ListItemIcon, 
  ListItemText,
  Box,
  Typography ,
  Alert,
  Snackbar,
  Skeleton
} from '@mui/material';
import { useState, useEffect, useCallback } from 'react';
import { Iconify } from 'src/components/iconify';
import { Cart } from 'src/types/cart';
import { CartAssignment } from 'src/types/session';
import { sessionApi } from 'src/services/api/session.api';
import { useGUCData } from 'src/contexts/DataContext';
import { LoadingButton } from '@mui/lab';
import { userApi } from 'src/services/api/user.api';

interface CartControlsProps {
  userId: string;
  groupId: string;
  cartAssignments: any[];
  groupUserId: string;
  onAssignCart: (userId: string, cartId: string, groupUserId: string) => Promise<void>;
  availableCarts: any[];
  activeUser: any;
  isOptimistic?: boolean;
  isUpdating?: boolean;
}

export function CartControls({ 
  userId, 
  groupId, 
  groupUserId,
  cartAssignments, 
  availableCarts, 
  onAssignCart,
  activeUser,
  isOptimistic = false,
  isUpdating = false,
}: CartControlsProps) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [isRaceStarted, setIsRaceStarted] = useState(activeUser?.race_status === 'in_progress');
  const [raceStatus, setRaceStatus] = useState<'not_started' | 'in_progress' | 'completed'>(
    activeUser?.race_status || 'not_started'
  );
  const [startTime, setStartTime] = useState<string | null>(
    activeUser?.race_start_time || null
  );
  const { getGroupUsers } = useGUCData();
  const [isAssigning, setIsAssigning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getUserCart = (ucId: string): any => 
    cartAssignments.find(ca => ca.current_user === ucId);

  const [currentCartId, setCurrentCartId] = useState<string | null>(
    getUserCart(userId)?.cart_id || null
  );

  const getUserDuration = useCallback(() => {
    const userGroup = getGroupUsers(groupId).find((gu : any) => gu.user_id === userId);
    return userGroup?.time_in_minutes || userGroup?.allowed_duration || 0;
  }, [groupId, userId, getGroupUsers]);
  
  useEffect(() => {
    if (activeUser) {
      setIsRaceStarted(activeUser.race_status === 'in_progress');
      setRaceStatus(activeUser.race_status);
      setStartTime(activeUser.race_start_time || null);

      if (activeUser.race_status === 'in_progress' && activeUser.expected_end_time) {
        const endTime = new Date(activeUser.expected_end_time).getTime();
        const now = new Date().getTime();
        const remaining = Math.max(0, Math.floor((endTime - now) / 1000));
        
        setTimeLeft(remaining);

        const interval = setInterval(() => {
          const nowTime = new Date().getTime();
          const remainingTime = Math.max(0, Math.floor((endTime - nowTime) / 1000));
          
          if (remainingTime <= 0) {
            setTimeLeft(0);
            setRaceStatus('completed');
            clearInterval(interval);
          } else {
            setTimeLeft(remainingTime);
          }
        }, 1000);

        return () => clearInterval(interval);
      }
      if (activeUser.race_status === 'completed') {
        setTimeLeft(0);
      }
    }
    return () => {};
  }, [activeUser]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartRace = async () => {
    try {
      const userCart = getUserCart(userId);
      if (!userCart) return;

      await userApi.startRace(userId, groupId);

      const duration = getUserDuration() * 60;
      setTimeLeft(duration);
      setIsRaceStarted(true);
      setRaceStatus('in_progress');
      setStartTime(new Date().toISOString());

      const interval = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime === null || prevTime <= 0) {
            clearInterval(interval);
            setRaceStatus('completed');
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);

    } catch (e) {
      console.error('Error starting race:', e);
    }
  };

  const handleOpenCartMenu = (event: React.MouseEvent<HTMLElement>) => {
    if (isAssigning) return;
    setAnchorEl(event.currentTarget);
  };

  const handleCloseCartMenu = () => {
    if (isAssigning) return;
    setAnchorEl(null);
  };

  const handleSelectCart = async (cartId: string) => {
    if (!cartId) {
      setError('Invalid cart selection');
      return;
    }

    setIsAssigning(true);
    setAnchorEl(null);

    try {
      await onAssignCart(userId, cartId, groupUserId);
      setCurrentCartId(cartId);
    } catch (e) {
      setError('Failed to assign cart. Please try again.');
      console.error('Error assigning cart:', e);
    } finally {
      setIsAssigning(false);
    }
  };

  const handleCloseError = () => {
    setError(null);
  };

  const currentCart = getUserCart(userId);

  const getFullCartDetails = () => {
    if (!currentCart) return null;
    return availableCarts?.find(cart => cart.rfid_number === currentCart.cart_id) || null;
  };

  const selectedCartDetails = getFullCartDetails();

  const renderCartMenuItem = (cart: Cart) => (
    <MenuItem 
      key={cart.id}
      onClick={() => handleSelectCart(cart?.rfid_number ?? '')}
      disabled={isAssigning || currentCartId === cart.rfid_number}
      sx={{ 
        position: 'relative',
        opacity: currentCartId === cart.rfid_number ? 0.7 : 1,
      }}
    >
      <ListItemIcon>
        {isAssigning && cart.rfid_number === currentCartId ? (
          <LoadingButton
            loading
            size="small"
            sx={{ minWidth: 20, p: 0 }}
          />
        ) : (
          <Iconify 
            icon={currentCartId === cart.rfid_number ? "mdi:check-circle" : "mdi:go-kart"} 
            width={20} 
            sx={{ 
              color: currentCartId === cart.rfid_number ? 'success.main' : 'inherit'
            }}
          />
        )}
      </ListItemIcon>
      <ListItemText 
        primary={cart.name}
        secondary={`Fuel: ${cart?.current_level}%`}
      />
    </MenuItem>
  );

  const isRaceActive = raceStatus === 'in_progress' || raceStatus === 'completed';

  return (
    <>
      <Stack direction="row" spacing={1} alignItems="center">
        {(isAssigning || isUpdating) ? (
          <Skeleton 
            variant="rectangular" 
            width={52} 
            height={32} 
            sx={{ 
              borderRadius: '8px',
              bgcolor: 'background.neutral' 
            }} 
          />
        ) : currentCart ? (
          <Box 
            onClick={isOptimistic ? undefined : handleOpenCartMenu}
            sx={{ 
              opacity: isOptimistic ? 0.5 : raceStatus === 'completed' ? 0.7 : 1,
              pointerEvents: isOptimistic ? 'none' : 'auto',
              display: 'flex', 
              alignItems: 'center',
              bgcolor: raceStatus === 'completed' ? 'grey.200' : 'success.lighter',
              borderRadius: '8px',
              height: '32px',
              minWidth: 'fit-content !important',
              padding: '0 8px',
              width: '52px',
              border: '1px solid',
              borderColor: raceStatus === 'completed' ? 'grey.300' : 'success.light',
              position: 'relative',
              transition: 'all 0.2s',
              cursor: raceStatus === 'completed' ? 'default' : 'pointer',
              '&:hover': {
                borderColor: raceStatus === 'completed' ? 'grey.300' : 'success.main',
              }
            }}
          >
            <Stack 
              spacing={0} 
              alignItems="center" 
              sx={{ 
                width: '100%',
                cursor: isAssigning ? 'default' : 'pointer',
              }}
              onClick={handleOpenCartMenu}
            >
              <Typography 
                variant="caption"
                sx={{ 
                  fontWeight: 700,
                  color: isAssigning ? 'text.disabled' : 'success.dark',
                  lineHeight: 1,
                  fontSize: '0.75rem',
                }}
              >
                {currentCart?.name}
              </Typography>
              <Typography 
                variant="caption" 
                sx={{ 
                  color: isAssigning ? 'text.disabled' : 'success.dark',
                  opacity: isAssigning ? 0.7 : 0.9,
                  fontSize: '0.65rem',
                  lineHeight: 1,
                }}
              >
                #{currentCart?.rfid_number}
              </Typography>
            </Stack>
            <Box 
              sx={{ 
                position: 'absolute',
                right: -6,
                top: -6,
                bgcolor: isAssigning ? 'action.disabled' : 'success.main',
                borderRadius: '50%',
                width: 16,
                height: 16,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: isAssigning ? 'default' : 'pointer',
                border: '1px solid',
                borderColor: isAssigning ? 'action.disabled' : 'success.light',
                '&:hover': {
                  bgcolor: isAssigning ? 'action.disabled' : 'success.dark',
                }
              }}
              onClick={handleOpenCartMenu}
            >
              {isAssigning ? (
                <LoadingButton
                  loading
                  size="small"
                  sx={{ 
                    minWidth: 12, 
                    p: 0,
                    '& .MuiCircularProgress-root': {
                      width: '12px !important',
                      height: '12px !important',
                      color: 'text.disabled'
                    }
                  }}
                />
              ) : (
                <Iconify 
                  icon="eva:more-vertical-fill" 
                  width={12} 
                  sx={{ color: 'success.lighter' }} 
                />
              )}
            </Box>
          </Box>
        ) : (
          <IconButton
            size="small"
            onClick={handleOpenCartMenu}
            disabled={isRaceActive || isOptimistic}
            sx={{ 
              color: 'primary.main',
              '&:hover': { bgcolor: 'primary.lighter' }
            }}
          >
            <Iconify icon="mdi:go-kart" width={20} />
          </IconButton>
        )}

        <Box sx={{ position: 'relative' }}>
          {(isAssigning || isUpdating) ? (
            <Skeleton 
              variant="rectangular" 
              width={55} 
              height={32} 
              sx={{ 
                borderRadius: 1,
                bgcolor: 'background.neutral' 
              }} 
            />
          ) : !isRaceStarted && raceStatus !== 'completed' ? (
            <IconButton
              size="small"
              onClick={handleStartRace}
              disabled={!currentCart}
              sx={{ 
                color: 'success.main',
                '&:hover': { bgcolor: 'success.lighter' }
              }}
            >
              <Iconify icon="mdi:play" width={20} />
            </IconButton>
          ) : (
            <Typography
              sx={{
                bgcolor: timeLeft === 0 || raceStatus === 'completed' ? 'error.lighter' : 'warning.lighter',
                borderRadius: 1,
                px: 1,
                minWidth: 55,
                color: timeLeft === 0 || raceStatus === 'completed' ? 'error.dark' : 'warning.dark',
                textAlign: 'center',
                fontSize: '0.9rem'
              }}
            >
              {timeLeft === 0 || raceStatus === 'completed' ? 'END' : formatTime(timeLeft || 0)}
            </Typography>
          )}
        </Box>
      </Stack>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl) && !isAssigning && !isRaceActive && !isOptimistic && !isUpdating}
        onClose={handleCloseCartMenu}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        sx={{
          pointerEvents: isAssigning ? 'none' : 'auto',
          '.MuiPaper-root': {
            opacity: isAssigning ? 0.7 : 1,
          }
        }}
      >
        {currentCart && (
          <>
            <MenuItem disabled>
              <ListItemIcon>
                <Iconify icon={raceStatus === 'in_progress' ? "mdi:timer" : "lets-icons:check-fill"} width={20} />
              </ListItemIcon>
              <ListItemText 
                primary={`Currently assigned: ${currentCart?.name}`}
                secondary={`Fuel: ${currentCart?.current_level}% ${
                  raceStatus === 'in_progress' ? '(Race in progress)' : 
                  raceStatus === 'completed' ? '(Race completed)' : ''
                }`}
              />
            </MenuItem>
          </>
        )}
        
        <MenuItem disabled sx={{ opacity: 1, bgcolor: 'background.neutral' }}>
          <ListItemText primary="Available Carts" />
        </MenuItem>

        {(availableCarts || []).map(renderCartMenuItem)}
        
        {availableCarts?.length === 0 && (
          <MenuItem disabled>
            <ListItemText primary="No carts available" />
          </MenuItem>
        )}
      </Menu>

      <Snackbar 
        open={!!error} 
        autoHideDuration={6000} 
        onClose={handleCloseError}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseError} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
    </>
  );
} 