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
import { useState, useEffect, useCallback, useMemo } from 'react';
import { Iconify } from 'src/components/iconify';
import { LoadingButton } from '@mui/lab';
import { ConfirmDialog } from 'src/components/dialog/confirm-dialog';
import { User, UserRaceStatus, Cart } from 'src/types/session';

interface CartControlsProps {
  user: User
  group_id: string;
  carts: Cart[];
  handleAssignCart: (group_id: string, user_id: string, cart_id: string) => void;
  handleManageUserRace: (group_id: string, user_id: string, status: UserRaceStatus) => void;
}

export function CartControls({
  user,
  group_id,
  carts,
  handleAssignCart,
  handleManageUserRace,
}: CartControlsProps) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(user?.total_remaining_seconds || user?.time_allotted * 60);
  // const [serverExpEndTime, setServerExpEndTime] = useState<number | null>(null);
  const [isRaceStarted, setIsRaceStarted] = useState<boolean>(user.race_active || !!user?.race_end_time);
  const [error, setError] = useState<string | null>(null);
  // const [raceEndTime, setRaceEndTime] = useState<string | null>(activeUser?.expected_end_time || null);
  const [confirmStop, setConfirmStop] = useState(false);
  const [isStoppingRace, setIsStoppingRace] = useState(false);
  const isAssigning = false;
  const isUpdating = false;
  const isOptimistic = false;
  const raceCompleted = useMemo(()=>{
    return !!user?.race_end_time
  },[user?.race_end_time]);
  // useEffect(() => {
  //   if (raceStatus === 'in_progress' && raceEndTime) {
  //     const updateTimeLeft = () => {
  //       const endTime = new Date(raceEndTime).getTime();
  //       const now = new Date().getTime();
  //       const remaining = Math.max(0, Math.floor((endTime - now) / 1000));

  //       setTimeLeft(remaining);

  //       if (remaining <= 0) {
  //         setTimeLeft(0);
  //         setRaceStatus('completed');
  //         return false;
  //       }
  //       return true;
  //     };

  //     updateTimeLeft();
  //     const interval = setInterval(() => {
  //       const shouldContinue = updateTimeLeft();
  //       if (!shouldContinue) {
  //         clearInterval(interval);
  //       }
  //     }, 1000);

  //     return () => clearInterval(interval);
  //   }
  //   return undefined;
  // }, [raceStatus, raceEndTime]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // const handleStartRace = async () => {
  //   try {
  //     const userCart = getUserCart(userId);
  //     if (!userCart) return;

  //     const responseData = await userApi.startRace(userId, groupId);
  //     const endTime = responseData?.expected_end_time || responseData?.end_time;
  //     setServerExpEndTime(endTime);
  //     setRaceEndTime(endTime);

  //     if (endTime) {
  //       const endTimeMs = new Date(endTime).getTime();
  //       const now = new Date().getTime();
  //       const remaining = Math.max(0, Math.floor((endTimeMs - now) / 1000));
  //       setTimeLeft(remaining);
  //     } else {
  //       const duration = getUserDuration() * 60;
  //       setTimeLeft(duration);
  //     }

  //     setIsRaceStarted(true);
  //     setRaceStatus('in_progress');
  //     setStartTime(new Date().toISOString());
  //   } catch (e) {
  //     console.error('Error starting race:', e);
  //   }
  // };

  const handleOpenCartMenu = (event: React.MouseEvent<HTMLElement>) => {
    // if (isAssigning) return;
    setAnchorEl(event.currentTarget);
  };

  const handleCloseCartMenu = () => {
    // if (isAssigning) return;
    setAnchorEl(null);
  };

  // const handleSelectCart = async (cartId: string) => {
  //   if (!cartId) {
  //     setError('Invalid cart selection');
  //     return;
  //   }

  //   setIsAssigning(true);
  //   setAnchorEl(null);

  //   try {
  //     await onAssignCart(userId, cartId, groupUserId);
  //     setCurrentCartId(cartId);
  //   } catch (e) {
  //     setError('Failed to assign cart. Please try again.');
  //     console.error('Error assigning cart:', e);
  //   } finally {
  //     setIsAssigning(false);
  //   }
  // };

  const handleCloseError = () => {
    setError(null);
  };

  // const selectedCartDetails = getFullCartDetails();

  const renderCartMenuItem = (cart: Cart) => (
    <MenuItem
      key={cart.cart_id}
      onClick={() => handleAssignCart(group_id, user?.user_id, cart?.cart_id)}
      disabled={cart?.active_status}
      sx={{
        position: 'relative',
        opacity: user?.cart_id === cart.cart_id ? 0.7 : 1,
      }}
    >
      <ListItemIcon>
          <Iconify
            icon={user?.cart_id === cart.cart_id ? "mdi:check-circle" : "mdi:go-kart"}
            width={20}
            sx={{
              color: user?.cart_id === cart.cart_id ? 'success.main' : 'inherit'
            }}
          />
      </ListItemIcon>
      <ListItemText
        primary={cart.name}
        // secondary={`Fuel: ${cart?.current_level}%`}
      />
    </MenuItem>
  );

  // const isRaceActive = raceStatus === 'in_progress' || raceStatus === 'completed';

  // const handleStopRace = async () => {
  //   try {
  //     setIsStoppingRace(true);
  //     await userApi.stopRace(userId, groupId);
  //     setTimeLeft(0);
  //     setRaceStatus('completed');
  //     setIsRaceStarted(false);
  //   } catch (e) {
  //     console.error('Error stopping race:', e);
  //   } finally {
  //     setIsStoppingRace(false);
  //     setConfirmStop(false);
  //   }
  // };

  const handleOpenStopConfirm = () => {
    setConfirmStop(true);
  };

  const handleCloseStopConfirm = () => {
    setConfirmStop(false);
  };

  useEffect(()=>{
    if (user?.total_remaining_seconds) setTimeLeft(user?.total_remaining_seconds)
  },[user?.total_remaining_seconds])

  return (
    <>
      <Stack direction="row" spacing={1} alignItems="center">
        {user?.cart_id ? (
          <Box
            onClick={handleOpenCartMenu}
            sx={{
              // opacity: isOptimistic ? 0.5 : raceStatus === 'completed' ? 0.7 : 1,
              pointerEvents: 'auto',
              display: 'flex',
              alignItems: 'center',
              bgcolor: user?.race_active ? 'grey.200' : 'success.lighter',
              borderRadius: '8px',
              height: '32px',
              minWidth: 'fit-content !important',
              padding: '0 8px',
              width: '52px',
              border: '1px solid',
              borderColor: user?.race_active ? 'grey.300' : 'success.light',
              position: 'relative',
              transition: 'all 0.2s',
              cursor: 'pointer',
              '&:hover': {
                borderColor: !user?.race_active ? 'grey.300' : 'success.main',
              }
            }}
          >
            <Stack
              spacing={0}
              alignItems="center"
              sx={{
                width: '100%',
                cursor: 'pointer',
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
                {carts?.find((item: Cart)=>item?.cart_id === user?.cart_id)?.name}
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
                #{carts?.find((item: Cart)=>item?.cart_id === user?.cart_id)?.rfid_number}
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
            disabled={user?.race_active}
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
          ) : !isRaceStarted && user?.race_active  ? (
            <IconButton
              size="small"
              onClick={()=>handleManageUserRace(group_id, user?.user_id, 'start')}
              disabled={!user?.cart_id}
              sx={{
                color: 'success.main',
                '&:hover': { bgcolor: 'success.lighter' }
              }}
            >
              <Iconify icon="mdi:play" width={20} />
            </IconButton>
          ) : (
            <Box
              sx={{
                position: 'relative',
                '&:hover .stop-button': {
                  opacity: 1,
                  pointerEvents: 'auto',
                },
              }}
            >
              <Typography
                sx={{
                  bgcolor: timeLeft === 0 || raceCompleted ? 'error.lighter' : 'warning.lighter',
                  borderRadius: 1,
                  px: 1,
                  minWidth: 55,
                  color: timeLeft === 0 || raceCompleted ? 'error.dark' : 'warning.dark',
                  textAlign: 'center',
                  fontSize: '0.9rem'
                }}
              >
                {timeLeft === 0 || raceCompleted ? 'END' : formatTime(timeLeft || 0)}
              </Typography>

              {!raceCompleted && user?.race_active && (
                <IconButton
                  className="stop-button"
                  size="small"
                  onClick={handleOpenStopConfirm}
                  sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    opacity: 0,
                    transition: 'opacity 0.2s',
                    pointerEvents: 'none',
                    bgcolor: 'error.main',
                    color: 'white',
                    '&:hover': {
                      bgcolor: 'error.dark',
                    },
                    width: 24,
                    height: 24,
                  }}
                >
                  <Iconify icon="mdi:stop" width={16} />
                </IconButton>
              )}
            </Box>
          )}
        </Box>
      </Stack>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl) && !isAssigning && !user.race_active && !isOptimistic && !isUpdating}
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
        {/* {user?.cart_id && (
          <>
            <MenuItem disabled>
              <ListItemIcon>
                <Iconify icon={user.race_active ? "mdi:timer" : "lets-icons:check-fill"} width={20} />
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
        )} */}

        <MenuItem disabled sx={{ opacity: 1, bgcolor: 'background.neutral' }}>
          <ListItemText primary="Available Carts" />
        </MenuItem>

        {(carts?.filter((item: Cart)=>!item?.active_status) || []).map(renderCartMenuItem)}

        {carts?.filter((item: Cart)=>!item?.active_status)?.length === 0 && (
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

      <ConfirmDialog
        open={confirmStop}
        title="Stop Race"
        content="Are you sure you want to stop this race? This action cannot be undone."
        confirmText="Stop Race"
        confirmColor="error"
        loading={isStoppingRace}
        onClose={handleCloseStopConfirm}
        onConfirm={()=>handleManageUserRace(group_id, user?.user_id, 'end')}
      />
    </>
  );
}