import {
  Stack,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Box,
  Typography,
  Alert,
  Snackbar,
  Skeleton,
  Tooltip,
} from '@mui/material';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { Iconify } from 'src/components/iconify';
import { LoadingButton } from '@mui/lab';
import { ConfirmDialog } from 'src/components/dialog/confirm-dialog';
import { User, UserRaceStatus, Cart } from 'src/types/session';

interface CartControlsProps {
  user: User;
  group_id: string;
  carts: Cart[];
  handleAssignCart: (group_id: string, user_id: string, cart_id: string) => void;
  handleManageUserRace: (group_id: string, user_id: string, status: UserRaceStatus) => void;
}

const normalizeRaceEndTime = (timeString: string): string =>
  timeString.replace(/(\.\d+)(?:Z|[+-]\d{2}:\d{2})?$/, '$1');

export function CartControls({
  user,
  group_id,
  carts,
  handleAssignCart,
  handleManageUserRace,
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

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleOpenCartMenu = (event: React.MouseEvent<HTMLElement>) => {
    if (isOptimisticUser) return;
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

  const handleOpenStopConfirm = () => {
    setConfirmStop(true);
  };

  const handleCloseStopConfirm = () => {
    setConfirmStop(false);
  };

  useEffect(() => {
    if (user?.total_remaining_seconds !== undefined) {
      setTimeLeft(user.total_remaining_seconds);
    }
  }, [user?.total_remaining_seconds]);

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
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [
    user?.race_end_time,
    isRaceActive,
    raceCompleted,
    user?.total_remaining_seconds,
    handleManageUserRace,
    group_id,
    user?.user_id,
  ]);

  const currentCart = useMemo(() => {
    const cartId = optimisticCartId || user?.cart_id;
    return carts?.find((item: Cart) => item?.cart_id === cartId);
  }, [carts, user?.cart_id, optimisticCartId]);

  const showAsAssigned = !!user?.cart_id || !!optimisticCartId;
  console.log(raceCompleted, 'raceCompleted', user?.user_name);
  return (
    <>
      <Stack direction="row" spacing={1} alignItems="center">
        {showAsAssigned ? (
          <Box
            onClick={handleOpenCartMenu}
            sx={{
              pointerEvents: user?.race_active || raceCompleted || isOptimisticUser ? 'none' : 'auto',
              display: 'flex',
              alignItems: 'center',
              bgcolor: user?.race_active || raceCompleted || isOptimisticUser ? 'grey.200' : 'success.lighter',
              borderRadius: '8px',
              height: '32px',
              minWidth: 'fit-content !important',
              padding: '0 8px',
              width: '52px',
              border: '1px solid',
              borderColor: user?.race_active || raceCompleted || isOptimisticUser ? 'grey.300' : 'success.light',
              position: 'relative',
              transition: 'all 0.2s',
              cursor: user?.race_active || raceCompleted || isOptimisticUser ? 'default' : 'pointer',
              '&:hover': {
                borderColor: user?.race_active || raceCompleted || isOptimisticUser ? 'grey.300' : 'success.main',
              },
            }}
          >
            <Stack
              spacing={0}
              alignItems="center"
              sx={{
                width: '100%',
                cursor: user?.race_active || raceCompleted || isOptimisticUser ? 'default' : 'pointer',
              }}
              onClick={user?.race_active || raceCompleted || isOptimisticUser ? undefined : handleOpenCartMenu}
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
                {currentCart?.name || '...'}
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
                #{currentCart?.rfid_number || '...'}
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
                cursor: isAssigning || user?.race_active || raceCompleted || isOptimisticUser ? 'default' : 'pointer',
                border: '1px solid',
                borderColor: isAssigning ? 'action.disabled' : 'success.light',
                '&:hover': {
                  bgcolor:
                    isAssigning || user?.race_active || raceCompleted || isOptimisticUser
                      ? 'action.disabled'
                      : 'success.dark',
                },
              }}
              onClick={user?.race_active || raceCompleted || isOptimisticUser ? undefined : handleOpenCartMenu}
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
            disabled={user?.race_active || isAssigning || isOptimisticUser}
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
          ) : !user?.race_end_time || user?.race_end_time === '' ? (
            <IconButton
              size="small"
              onClick={() => {
                setIsStartingRace(true);
                Promise.resolve(handleManageUserRace(group_id, user?.user_id, 'start')).finally(
                  () => setIsStartingRace(false)
                );
              }}
              disabled={!(user?.cart_id || optimisticCartId) || isStartingRace || isOptimisticUser}
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

              {/* {!raceCompleted && user?.race_end_time && user?.race_end_time !== '' && (
                <Tooltip title="Stop timer">
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
                </Tooltip>
              )} */}

              {user?.race_active &&
                user?.race_end_time &&
                user?.race_end_time !== '' &&
                !raceCompleted && (
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

              {!user?.race_active && user?.race_end_time === '' && timeLeft > 0 && (
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
              )}
            </Box>
          )}
        </Box>
      </Stack>

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
        onConfirm={() => handleManageUserRace(group_id, user?.user_id, 'end')}
      />
    </>
  );
}
