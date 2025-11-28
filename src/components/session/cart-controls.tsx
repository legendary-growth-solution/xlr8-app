import {
  Stack,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Box,
  Typography,
  Skeleton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
} from '@mui/material';
import { useState, useEffect, useMemo } from 'react';
import { Iconify } from 'src/components/iconify';
import { LoadingButton } from '@mui/lab';
import { ConfirmDialog } from 'src/components/dialog/confirm-dialog';
import { User, UserRaceStatus, Cart } from 'src/types/session';
import axios from 'axios';
import { API_ENDPOINTS } from 'src/services/api/endpoints';
import { showToast } from '../toast';
import { DisqualifyDialog } from './disqualify-dialog';
import { PenaltyDialog } from './penalty-dialog';

interface CartControlsProps {
  user: User;
  group_id: string;
  carts: Cart[];
  handleAssignCart: (group_id: string, user_id: string, cart_id: string) => void;
  handleManageUserRace: (group_id: string, user_id: string, status: UserRaceStatus, updates?: any) => void;
  disabled?: boolean;
}

const normalizeRaceEndTime = (timeString: string): string =>
  timeString.replace(/(\.\d+)(?:Z|[+-]\d{2}:\d{2})?$/, '$1');

export function CartControls({
  user,
  group_id,
  carts,
  handleAssignCart,
  handleManageUserRace,
  disabled = false,
}: CartControlsProps) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(
    user?.total_remaining_seconds ?? (user?.time_allotted ? user.time_allotted * 60 : 0)
  );
  const [isRaceStarted, setIsRaceStarted] = useState<boolean>(
    user.race_active || !!user?.race_end_time
  );
  const [error, setError] = useState<string | null>(null);
  const [confirmStop, setConfirmStop] = useState(false);
  const [isStoppingRace, setIsStoppingRace] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);
  const [optimisticCartId, setOptimisticCartId] = useState<string | null>(null);
  const isUpdating = false;
  const isOptimistic = !!optimisticCartId;
  const [isStartingRace, setIsStartingRace] = useState<boolean>(false);
  const isOptimisticUser = (user as any)._isOptimistic;

  const [openDisqualifyDialog, setOpenDisqualifyDialog] = useState(false);
  const [disqualifyReason, setDisqualifyReason] = useState('');
  const [isDisqualifying, setIsDisqualifying] = useState(false);
  const [openPenaltyDialog, setOpenPenaltyDialog] = useState(false);
  const [penaltySeconds, setPenaltySeconds] = useState<number | string>('');
  const [isApplyingPenalty, setIsApplyingPenalty] = useState(false);
  const [raceActionsAnchorEl, setRaceActionsAnchorEl] = useState<null | HTMLElement>(null);
 
  const raceCompleted = useMemo(() => {
    if (!user?.race_end_time) return false;
    if (user?.race_end_time === '') return false;

    const normalizedRaceEndTime = normalizeRaceEndTime(user.race_end_time);
    const endTime = new Date(normalizedRaceEndTime).getTime();
    const now = new Date().getTime();
    return endTime <= now;
  }, [user?.race_end_time]);

  const isRaceActive = useMemo(
    () => user?.race_active && !!user?.race_end_time && user?.race_end_time !== '',
    [user?.race_active, user?.race_end_time]
  );

  const isPaused = useMemo(() => {
    if (user?.time_in_minutes && user?.total_active_seconds !== undefined) {
      const totalAllottedSeconds = user.time_in_minutes * 60;
      return !user.race_active && (user.total_active_seconds < totalAllottedSeconds) && user?.total_active_seconds !== 0
    }
    return false;
  }, [user?.time_in_minutes, user?.total_active_seconds, user?.race_active]);
  
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    return `${mins.toString().padStart(2, '0')}:${Math.ceil(seconds % 60).toString().padStart(2, '0')}`;
  };

  const handleOpenCartMenu = (event: React.MouseEvent<HTMLElement>) => {
    if (isOptimisticUser || disabled) return;
    setAnchorEl(event.currentTarget);
  };

  const handleCloseCartMenu = () => {
    setAnchorEl(null);
  };

  const handleCloseError = () => {
    setError(null);
  };

  const handleCartAssignment = (cart_id: string) => {
    if (isAssigning || user?.cart_id === cart_id || isOptimisticUser) {
      handleCloseCartMenu();
      return;
    }

    setIsAssigning(true);
    setOptimisticCartId(cart_id);
    handleCloseCartMenu();

    handleAssignCart(group_id, user?.user_id, cart_id);

    setTimeout(() => {
      setIsAssigning(false);
    }, 1000);
  };

  const handleOpenRaceActionsMenu = (event: React.MouseEvent<HTMLElement>) => {
    if (isOptimisticUser || !user.cart_id) return;
    setRaceActionsAnchorEl(event.currentTarget);
  };

  const handleCloseRaceActionsMenu = () => {
    setRaceActionsAnchorEl(null);
  };

  const handleOpenDisqualifyDialog = () => {
    setOpenDisqualifyDialog(true);
    handleCloseRaceActionsMenu();
  };

  const handleDisqualify = async () => {
    if (!user.user_id || !group_id) return;
    
    setIsDisqualifying(true);
    try {
      const response = await axios.post(API_ENDPOINTS.SESSIONS.GROUPS.DISQUALIFY_USER(user.session_id || 'current', group_id, user.user_id), {
        reason: disqualifyReason || 'No reason provided'
      });
      
      showToast.error('⚠️ Racer has been DISQUALIFIED');
      
      handleManageUserRace(group_id, user?.user_id, 'update', {
        is_disqualified: true,
        disqualification_reason: disqualifyReason || 'No reason provided',
        race_active: false
      });
      
      const userElement = document.querySelector(`[data-user-id="${user.user_id}"]`);
      if (userElement) {
        userElement.classList.add('disqualify-animation');
        
        const flashOverlay = document.createElement('div');
        flashOverlay.style.position = 'absolute';
        flashOverlay.style.top = '0';
        flashOverlay.style.left = '0';
        flashOverlay.style.right = '0';
        flashOverlay.style.bottom = '0';
        flashOverlay.style.backgroundColor = 'rgba(255, 0, 0, 0.2)';
        flashOverlay.style.borderRadius = '4px';
        flashOverlay.style.zIndex = '-1';
        flashOverlay.style.animation = 'flash-fade 2s ease-out';
        
        const style = document.createElement('style');
        style.innerHTML = `
          @keyframes flash-fade {
            0% { opacity: 0; }
            10% { opacity: 0.8; }
            30% { opacity: 0.6; }
            70% { opacity: 0.4; }
            100% { opacity: 0; }
          }
        `;
        document.head.appendChild(style);
        
        (userElement as HTMLElement).style.position = 'relative';
        userElement.appendChild(flashOverlay);
        
        setTimeout(() => {
          userElement.classList.remove('disqualify-animation');
          userElement.removeChild(flashOverlay);
          document.head.removeChild(style);
        }, 2000);
      }
    } catch (err: any) {
      console.error('Error disqualifying user:', err);
      const errorMessage = err.response?.data?.error || 'Failed to disqualify user. Please try again.';
      showToast.error(errorMessage);
    } finally {
      setIsDisqualifying(false);
      setOpenDisqualifyDialog(false);
      setDisqualifyReason('');
    }
  };

  const handleOpenPenaltyDialog = () => {
    setOpenPenaltyDialog(true);
    handleCloseRaceActionsMenu();
  };

  const handleApplyPenalty = async () => {
    if (!user.user_id || !group_id) return;
    
    const penalty = Number(penaltySeconds);
    if (Number.isNaN(penalty) || penalty < 0) {
      showToast.error('Please enter a valid positive number for the penalty.');
      return;
    }
    
    setIsApplyingPenalty(true);
    try {
      const response = await axios.post(API_ENDPOINTS.SESSIONS.GROUPS.ADD_PENALTY(user.session_id || 'current', group_id, user.user_id), {
        penalty_seconds: Math.abs(penalty)
      });
      
      showToast.success(`${penalty}s penalty applied successfully`);
      
      handleManageUserRace(group_id, user?.user_id, 'update', {
        penalty_seconds: Math.abs(penalty)
      });
      
      const userElement = document.querySelector(`[data-user-id="${user.user_id}"]`);
      if (userElement) {
        userElement.classList.add('penalty-animation');
        setTimeout(() => {
          userElement.classList.remove('penalty-animation');
        }, 1500);
      }
    } catch (err: any) {
      console.error('Error applying penalty:', err);
      const errorMessage = err.response?.data?.error || 'Failed to apply penalty. Please try again.';
      showToast.error(errorMessage);
    } finally {
      setIsApplyingPenalty(false);
      setOpenPenaltyDialog(false);
      setPenaltySeconds('');
    }
  };

  const handleOpenStopConfirm = () => {
    setConfirmStop(true);
  };

  const handleCloseStopConfirm = () => {
    setConfirmStop(false);
  };

  const renderCartMenuItem = (cart: Cart) => {
    const isAssignedToOtherUser =
      cart?.is_assigned && cart?.cart_id !== user?.cart_id && cart?.cart_id !== optimisticCartId;
    const isCurrentUserCart = user?.cart_id === cart.cart_id || optimisticCartId === cart.cart_id;

    return (
      <MenuItem
        key={cart.cart_id}
        onClick={() => handleCartAssignment(cart.cart_id)}
        disabled={isAssignedToOtherUser}
        sx={{
          position: 'relative',
          opacity: isCurrentUserCart ? 0.7 : 1,
        }}
      >
        <ListItemIcon>
          <Iconify
            icon={isCurrentUserCart ? 'mdi:check-circle' : 'mdi:go-kart'}
            width={20}
            sx={{
              color: isCurrentUserCart ? 'success.main' : 'inherit',
            }}
          />
        </ListItemIcon>
        <ListItemText
          primary={cart.name}
          secondary={
            <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Iconify icon="mdi:fuel" width={14} />
              {`${Math.round(cart.fuel_level)}% (${cart.fuel}L)`}
            </Typography>
          }
        />
        {isAssignedToOtherUser && (
          <Box sx={{ ml: 1 }}>
            <Iconify icon="mdi:lock" width={16} sx={{ color: 'text.disabled' }} />
          </Box>
        )}
      </MenuItem>
    );
  };

  useEffect(() => {
    if (user?.total_active_seconds !== undefined && user?.time_in_minutes !== undefined) {
      setTimeLeft(user.time_in_minutes * 60 - user.total_active_seconds);
    }
  }, [user?.total_active_seconds, user?.time_in_minutes]);

  useEffect(() => {
    if (optimisticCartId && user?.cart_id === optimisticCartId) {
      setOptimisticCartId(null);
    }
  }, [user?.cart_id, optimisticCartId]);

  useEffect(() => {
    let interval: NodeJS.Timeout | undefined;

    if (isRaceActive && !raceCompleted && user?.race_end_time) {
      const updateTimeLeft = () => {
        const normalizedRaceEndTime = normalizeRaceEndTime(user.race_end_time);
        const endTime = new Date(normalizedRaceEndTime).getTime();
        const now = new Date().getTime();
        const remaining = Math.max(0, Math.floor((endTime - now) / 1000));
        setTimeLeft(remaining);

        if (remaining <= 0) {
          setTimeLeft(0);
          handleManageUserRace(group_id, user?.user_id, 'end');
          return false;
        }
        return true;
      };

      updateTimeLeft();
      interval = setInterval(() => {
        const shouldContinue = updateTimeLeft();
        if (!shouldContinue) {
          clearInterval(interval);
        }
      }, 1000);
    } else if (!isRaceActive && user?.total_remaining_seconds !== undefined) {
      setTimeLeft(user.total_remaining_seconds);
    } else if (isPaused && user?.time_in_minutes && user?.total_active_seconds !== undefined) {
      const totalAllottedSeconds = user.time_in_minutes * 60;
      const remainingSeconds = Math.max(0, totalAllottedSeconds - user.total_active_seconds);
      setTimeLeft(remainingSeconds);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [
    user?.race_end_time,
    isRaceActive,
    raceCompleted,
    user?.total_remaining_seconds,
    user?.time_in_minutes,
    user?.total_active_seconds,
    isPaused,
    handleManageUserRace,
    group_id,
    user?.user_id,
  ]);

  const currentCart = useMemo(() => {
    const cartId = optimisticCartId || user?.cart_id;
    return carts?.find((item: Cart) => item?.cart_id === cartId);
  }, [carts, user?.cart_id, optimisticCartId]);

  const showAsAssigned = !!user?.cart_id || !!optimisticCartId;
  const isDisqualified = user?.is_disqualified;
  const hasPenalty = user?.penalty_seconds && user.penalty_seconds > 0;

  const raceHasStarted = useMemo(() => 
    user.race_start_times?.length > 0 || 
    raceCompleted || 
    (user.total_active_seconds !== undefined && user.total_active_seconds > 0) ||
    user.race_active
  , [user.race_start_times, user.total_active_seconds, raceCompleted, user.race_active]);

  const isRaceComplete = useMemo(() => 
    raceCompleted || 
    formatTime(timeLeft || 0) === '00:00' ||
    (user.time_in_minutes && user.total_active_seconds !== undefined && 
     user.total_active_seconds >= user.time_in_minutes * 60)
  , [raceCompleted, user.total_active_seconds, user.time_in_minutes, timeLeft]);

  useEffect(() => {
    if (error) {
      showToast.error(error);
      setError(null);
    }
  }, [error]);

  useEffect(() => {
    if (isRaceActive) {
      setIsRaceStarted(true);
    }
  }, [isRaceActive]);

  return (
    <>
      <Stack direction="row" spacing={1} alignItems="center">
        {showAsAssigned ? (
          <Box
            onClick={handleOpenCartMenu}
            sx={{
              pointerEvents: user?.race_active || raceCompleted || isOptimisticUser || isDisqualified ? 'none' : 'auto',
              display: 'flex',
              alignItems: 'center',
              bgcolor: isDisqualified 
                ? 'error.lighter'
                : user?.race_active || raceCompleted || isOptimisticUser 
                  ? 'grey.200' 
                  : 'success.lighter',
              borderRadius: '8px',
              height: '32px',
              minWidth: 'fit-content !important',
              padding: '0 8px',
              width: '52px',
              border: '1px solid',
              borderColor: isDisqualified
                ? 'error.light'
                : user?.race_active || raceCompleted || isOptimisticUser 
                  ? 'grey.300' 
                  : 'success.light',
              position: 'relative',
              transition: 'all 0.2s',
              cursor: user?.race_active || raceCompleted || isOptimisticUser || isDisqualified ? 'default' : 'pointer',
              '&:hover': {
                borderColor: isDisqualified
                  ? 'error.light'
                  : user?.race_active || raceCompleted || isOptimisticUser 
                    ? 'grey.300' 
                    : 'success.main',
              },
            }}
          >
            <Stack
              spacing={0}
              alignItems="center"
              sx={{
                width: '100%',
                cursor: user?.race_active || raceCompleted || isOptimisticUser || isDisqualified ? 'default' : 'pointer',
              }}
              onClick={user?.race_active || raceCompleted || isOptimisticUser || isDisqualified ? undefined : handleOpenCartMenu}
            >
              <Typography
                variant="caption"
                sx={{
                  fontWeight: 700,
                  color: isDisqualified 
                    ? 'error.dark'
                    : isAssigning ? 'text.disabled' : 'success.dark',
                  lineHeight: 1,
                  fontSize: '0.75rem',
                  textDecoration: isDisqualified ? 'line-through' : 'none',
                }}
              >
                {currentCart?.name || '...'}
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: isDisqualified 
                    ? 'error.dark'
                    : isAssigning ? 'text.disabled' : 'success.dark',
                  opacity: isAssigning ? 0.7 : 0.9,
                  fontSize: '0.65rem',
                  lineHeight: 1,
                  textDecoration: isDisqualified ? 'line-through' : 'none',
                }}
              >
                #{currentCart?.rfid_number || '...'}
              </Typography>
            </Stack>
            <Box
              sx={{
                position: 'absolute',
                right: -6,
                top: -6,
                bgcolor: isDisqualified
                  ? 'error.main'
                  : isAssigning ? 'action.disabled' : 'success.main',
                borderRadius: '50%',
                width: 16,
                height: 16,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: isAssigning || user?.race_active || raceCompleted || isOptimisticUser || isDisqualified ? 'default' : 'pointer',
                border: '1px solid',
                borderColor: isDisqualified
                  ? 'error.light'
                  : isAssigning ? 'action.disabled' : 'success.light',
                '&:hover': {
                  bgcolor: isDisqualified
                    ? 'error.main'
                    : isAssigning || user?.race_active || raceCompleted || isOptimisticUser
                      ? 'action.disabled'
                      : 'success.dark',
                },
              }}
              onClick={user?.race_active || raceCompleted || isOptimisticUser || isDisqualified ? undefined : handleOpenCartMenu}
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
                      color: 'text.disabled',
                    },
                  }}
                />
              ) : (
                <Iconify
                  icon={isDisqualified ? "mdi:flag" : "eva:more-vertical-fill"}
                  width={12}
                  sx={{ color: isDisqualified ? 'error.lighter' : 'success.lighter' }}
                />
              )}
            </Box>
          </Box>
        ) : (
          <IconButton
            size="small"
            onClick={handleOpenCartMenu}
            disabled={user?.race_active || isAssigning || isOptimisticUser || isDisqualified}
            sx={{
              color: 'primary.main',
              '&:hover': { bgcolor: 'primary.lighter' },
            }}
          >
            {isAssigning ? (
              <LoadingButton
                loading
                size="small"
                sx={{
                  minWidth: 20,
                  p: 0,
                  '& .MuiCircularProgress-root': {
                    width: '20px !important',
                    height: '20px !important',
                    color: 'primary.main',
                  },
                }}
              />
            ) : (
              <Iconify icon="mdi:go-kart" width={20} />
            )}
          </IconButton>
        )}

        <Box sx={{ position: 'relative' }}>
          {isAssigning || isUpdating ? (
            <Skeleton
              variant="rectangular"
              width={55}
              height={32}
              sx={{
                borderRadius: 1,
                bgcolor: 'background.neutral',
              }}
            />
          ) : isDisqualified ? (
            <Tooltip title={`Disqualified: ${user.disqualification_reason || 'No reason provided'}`}>
              <Box
                sx={{
                  bgcolor: 'error.lighter',
                  borderRadius: 1,
                  px: 1,
                  minWidth: 55,
                  color: 'error.dark',
                  textAlign: 'center',
                  fontSize: '0.9rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: 32,
                }}
              >
                <Typography sx={{ fontSize: '0.9rem', fontWeight: 'bold' }}>DQ</Typography>
              </Box>
            </Tooltip>
          ) : (user.race_end_time === '' || user.race_end_time === undefined) && !isPaused ? (
            <IconButton
              size="small"
              onClick={() => {
                setIsStartingRace(true);
                setIsRaceStarted(true);
                Promise.resolve(handleManageUserRace(group_id, user?.user_id, 'start')).finally(
                  () => setIsStartingRace(false)
                );
              }}
              disabled={!(user?.cart_id || optimisticCartId) || isStartingRace || isOptimisticUser || disabled}
              sx={{
                color: 'success.main',
                '&:hover': { bgcolor: 'success.lighter' },
              }}
            >
              {isStartingRace ? (
                <LoadingButton
                  loading
                  size="small"
                  sx={{
                    minWidth: 20,
                    p: 0,
                    '& .MuiCircularProgress-root': {
                      width: '20px !important',
                      height: '20px !important',
                      color: 'success.main',
                    },
                  }}
                />
              ) : (
                <Iconify icon="mdi:play" width={20} />
              )}
            </IconButton>
          ) : (
            <Box
              sx={{
                position: 'relative',
                '&:hover .pause-button': {
                  opacity: 1,
                  pointerEvents: 'auto',
                },
                '&:hover .stop-button': {
                  opacity: 1,
                  pointerEvents: 'auto',
                },
              }}
            >
              <Typography
                sx={{
                  bgcolor: raceCompleted ? 'error.lighter' : 'warning.lighter',
                  borderRadius: 1,
                  px: 1,
                  minWidth: 55,
                  color:
                    raceCompleted || formatTime(timeLeft || 0) === '00:00'
                      ? 'error.dark'
                      : 'warning.dark',
                  textAlign: 'center',
                  fontSize: '0.9rem',
                }}
              >
                {raceCompleted || formatTime(timeLeft || 0) === '00:00'
                  ? 'END'
                  : formatTime(timeLeft || 0)}
              </Typography>

              {user?.race_active &&
                user?.race_end_time &&
                user?.race_end_time !== '' &&
                !raceCompleted &&
                !disabled && (
                  <Tooltip title="Pause timer">
                    <IconButton
                      className="pause-button"
                      size="small"
                      onClick={() => handleManageUserRace(group_id, user?.user_id, 'pause')}
                      sx={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        opacity: 0,
                        transition: 'opacity 0.2s',
                        pointerEvents: 'none',
                        bgcolor: 'warning.main',
                        color: 'white',
                        '&:hover': {
                          bgcolor: 'warning.dark',
                        },
                        width: 24,
                        height: 24,
                      }}
                    >
                      <Iconify icon="mdi:pause" width={16} />
                    </IconButton>
                  </Tooltip>
                )}

              {!user?.race_active && user?.race_end_time === '' && timeLeft > 0 && !disabled && (
                <>
                  <Tooltip title="Resume timer">
                    <IconButton
                      className="pause-button"
                      size="small"
                      onClick={() => handleManageUserRace(group_id, user?.user_id, 'start')}
                      sx={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        opacity: 0,
                        transition: 'opacity 0.2s',
                        pointerEvents: 'none',
                        bgcolor: 'success.main',
                        color: 'white',
                        '&:hover': {
                          bgcolor: 'success.dark',
                        },
                        width: 24,
                        height: 24,
                      }}
                    >
                      <Iconify icon="mdi:play" width={16} />
                    </IconButton>
                  </Tooltip>
                  <Typography variant="body2" sx={{ position: 'absolute', bottom: '50%', left: '50%', transform: 'translate(-50%, -50%)', color: 'white' }}>
                    {formatTime(timeLeft)}
                  </Typography>
                </>
              )}
            </Box>
          )}
        </Box>

        {showAsAssigned && !isOptimisticUser && !(raceCompleted && isDisqualified) && (
          <Tooltip title={
            disabled
              ? "Session has ended"
              : !raceHasStarted
              ? "Race must be started first"
              : isDisqualified 
                ? `Disqualified: ${user.disqualification_reason || 'No reason provided'}`
                : hasPenalty 
                  ? `${user.penalty_seconds}s penalty applied` 
                  : "Race Actions"
          }>
            <span>
              <IconButton
                size="small"
                onClick={handleOpenRaceActionsMenu}
                disabled={isOptimisticUser || !raceHasStarted || disabled}
                sx={{
                  color: hasPenalty 
                    ? 'warning.main' 
                    : isDisqualified 
                      ? 'error.main' 
                      : !raceHasStarted
                        ? 'text.disabled'
                        : 'text.secondary',
                  '&:hover': { 
                    bgcolor: hasPenalty 
                      ? 'warning.lighter' 
                      : isDisqualified 
                        ? 'error.lighter' 
                        : 'action.hover' 
                  },
                }}
              >
                <Box>
                  <Iconify 
                    icon={
                      isDisqualified
                        ? "mdi:flag"
                        : hasPenalty
                          ? "mdi:timer-alert"
                          : "mdi:dots-vertical"
                    } 
                    width={20} 
                  />
                </Box>
              </IconButton>
            </span>
          </Tooltip>
        )}
      </Stack>

      <Menu
        anchorEl={raceActionsAnchorEl}
        open={Boolean(raceActionsAnchorEl)}
        onClose={handleCloseRaceActionsMenu}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuItem 
          onClick={handleOpenDisqualifyDialog}
          disabled={isDisqualified}
          sx={{
            color: 'error.main',
            '&.Mui-disabled': {
              opacity: 0.5,
            },
          }}
        >
          <ListItemIcon>
            <Iconify icon="mdi:flag" width={20} sx={{ color: 'error.main' }} />
          </ListItemIcon>
          <ListItemText primary={isDisqualified ? "Already Disqualified" : "Disqualify Racer"} />
        </MenuItem>

        <MenuItem 
          onClick={handleOpenPenaltyDialog}
          disabled={isDisqualified || !isRaceComplete}
          sx={{
            color: hasPenalty ? 'warning.main' : 'text.primary',
            '&.Mui-disabled': {
              opacity: 0.5,
            },
          }}
        >
          <ListItemIcon>
            <Iconify 
              icon={hasPenalty ? "mdi:timer-alert" : "mdi:timer-plus"} 
              width={20} 
              sx={{ color: hasPenalty ? 'warning.main' : 'text.primary' }} 
            />
          </ListItemIcon>
          <ListItemText 
            primary={hasPenalty ? `Update Penalty (${user.penalty_seconds}s)` : "Add Time Penalty"} 
          />
          {!isRaceComplete && !isDisqualified && (
            <Typography variant="caption" sx={{ color: 'text.disabled', ml: 1 }}>
              (Race must end)
            </Typography>
          )}
        </MenuItem>
      </Menu>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl) && !isAssigning && !user.race_active && !isOptimistic && !isUpdating && !isOptimisticUser}
        onClose={handleCloseCartMenu}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        sx={{
          pointerEvents: isAssigning ? 'none' : 'auto',
          '.MuiPaper-root': {
            opacity: isAssigning ? 0.7 : 1,
          },
        }}
      >
        <MenuItem disabled sx={{ opacity: 1, bgcolor: 'background.neutral' }}>
          <ListItemText primary="Available Carts" />
        </MenuItem>

        {(carts || [])
          .sort((a, b) => {
            if (a.cart_id === user?.cart_id) return -1;
            if (b.cart_id === user?.cart_id) return 1;

            if (a.is_assigned !== b.is_assigned) {
              return a.is_assigned ? 1 : -1;
            }

            return a.name.localeCompare(b.name);
          })
          .map(renderCartMenuItem)}

        {carts?.filter((item: Cart) => !item?.is_assigned || item?.cart_id === user?.cart_id)
          ?.length === 0 && (
          <MenuItem disabled>
            <ListItemText primary="No carts available" />
          </MenuItem>
        )}
      </Menu>

      <DisqualifyDialog
        open={openDisqualifyDialog}
        onClose={() => setOpenDisqualifyDialog(false)}
        user={user}
        isDisqualifying={isDisqualifying}
        disqualifyReason={disqualifyReason}
        setDisqualifyReason={setDisqualifyReason}
        handleDisqualify={handleDisqualify}
      />

      <PenaltyDialog
        open={openPenaltyDialog}
        onClose={() => setOpenPenaltyDialog(false)}
        user={user}
        hasPenalty={hasPenalty || false}
        penaltySeconds={penaltySeconds}
        setPenaltySeconds={setPenaltySeconds}
        isApplyingPenalty={isApplyingPenalty}
        handleApplyPenalty={handleApplyPenalty}
      />

      <ConfirmDialog
        open={confirmStop}
        title="Stop Race"
        content="Are you sure you want to stop this race? This action cannot be undone."
        confirmText="Stop Race"
        confirmColor="error"
        loading={isStoppingRace}
        onClose={handleCloseStopConfirm}
        onConfirm={() => handleManageUserRace(group_id, user?.user_id, 'end')}
      />
    </>
  );
}
