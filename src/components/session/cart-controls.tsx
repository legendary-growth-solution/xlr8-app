import { 
  Stack, 
  IconButton, 
  Menu, 
  MenuItem, 
  ListItemIcon, 
  ListItemText,
  Box,
  Typography 
} from '@mui/material';
import { useState, useEffect } from 'react';
import { Iconify } from 'src/components/iconify';
import { Cart } from 'src/types/cart';
import { MOCK_CARTS, MOCK_GROUP_USERS } from 'src/services/mock/mock-data';
import { CartAssignment } from 'src/types/session';

interface CartControlsProps {
  userId: string;
  groupId: string;
  cartAssignments: CartAssignment[];
  onAssignCart: (userId: string, cartId: string) => void;
}

export function CartControls({ userId, groupId, cartAssignments, onAssignCart }: CartControlsProps) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  const getUserMapping = (umId: string) => MOCK_GROUP_USERS.find(gu => gu.groupId === groupId && gu.userId === umId);

  const getUserCart = (ucId: string): Cart | undefined => {
    const assignment = cartAssignments.find(ca => ca.userId === ucId);
    if (!assignment) return undefined;
    return MOCK_CARTS.find(cart => cart.id === assignment.cartId);
  };

  const getUserDuration = (uid: string) => {
    const mapping = MOCK_GROUP_USERS.find(gu => gu.groupId === groupId && gu.userId === uid);
    return (mapping?.allowedDuration || 0) * 60;
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    const userMapping = getUserMapping(userId);

    if (userMapping?.raceStatus === 'in_progress' && userMapping.startTime) {
      const startTime = new Date(userMapping.startTime).getTime();
      const totalDuration = getUserDuration(userId);

      const updateTimer = () => {
        const now = new Date().getTime();
        const elapsedSeconds = Math.floor((now - startTime) / 1000);
        const remaining = Math.max(0, totalDuration - elapsedSeconds);

        if (remaining <= 0) {
          setTimeLeft(0);
          clearInterval(interval);
          const mappingIndex = MOCK_GROUP_USERS.findIndex(
            gu => gu.groupId === groupId && gu.userId === userId
          );
          if (mappingIndex >= 0) {
            MOCK_GROUP_USERS[mappingIndex] = {
              ...MOCK_GROUP_USERS[mappingIndex],
              raceStatus: 'completed'
            };
          }
        } else {
          setTimeLeft(remaining);
        }
      };

      updateTimer();
      interval = setInterval(updateTimer, 1000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, groupId, getUserMapping]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getAvailableCarts = () => {
    const allAssignedCartIds = MOCK_GROUP_USERS
      .filter(gu => gu.cartId)
      .map(gu => gu.cartId) as string[];

    return MOCK_CARTS.filter(cart => 
      cart.status === 'available' && cart.id && !allAssignedCartIds.includes(cart.id)
    );
  };

  const handleOpenCartMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseCartMenu = () => {
    setAnchorEl(null);
  };

  const handleSelectCart = (cartId: string) => {
    if (!cartId) {
      console.error('Cart could not be assigned');
      return;
    }
    onAssignCart(userId, cartId);
    handleCloseCartMenu();
  };

  const handleStartRace = () => {
    const userCart = getUserCart(userId);
    const userMapping = getUserMapping(userId);
    
    if (!userCart || !userMapping) return;

    const mappingIndex = MOCK_GROUP_USERS.findIndex(
      gu => gu.groupId === groupId && gu.userId === userId
    );

    if (mappingIndex >= 0) {
      const startTime = new Date().toISOString();
      MOCK_GROUP_USERS[mappingIndex] = {
        ...MOCK_GROUP_USERS[mappingIndex],
        raceStatus: 'in_progress',
        startTime
      };
      setTimeLeft(getUserDuration(userId));
    }
  };

  const currentCart = getUserCart(userId);
  const userMapping = getUserMapping(userId);
  const isRaceInProgress = userMapping?.raceStatus === 'in_progress';
  const isRaceCompleted = userMapping?.raceStatus === 'completed';

  return (
    <Stack direction="row" spacing={1} alignItems="center">
      <IconButton
        size="small"
        onClick={handleOpenCartMenu}
        disabled={isRaceInProgress || isRaceCompleted}
        sx={{ 
          color: currentCart ? 'success.main' : 'primary.main',
          '&:hover': { bgcolor: currentCart ? 'success.lighter' : 'primary.lighter' }
        }}
      >
        <Iconify icon="mdi:go-kart" width={20} />
      </IconButton>

      <Box sx={{ position: 'relative' }}>
        {!isRaceInProgress ? (
          <IconButton
            size="small"
            onClick={handleStartRace}
            disabled={!currentCart || isRaceInProgress || isRaceCompleted}
            sx={{ 
              color: isRaceCompleted ? 'error.main' : 'success.main',
              '&:hover': { 
                bgcolor: isRaceCompleted 
                  ? 'error.lighter'
                  : 'success.lighter' 
              }
            }}
          >
            <Iconify 
              icon={isRaceCompleted ? "mdi:flag-checkered" : "mdi:play"} 
              width={20} 
            />
          </IconButton>
        ) : (
          <Typography
            sx={{
              bgcolor: timeLeft === 0 ? 'error.lighter' : 'warning.lighter',
              borderRadius: 1,
              px: 1,
              minWidth: 55,
              color: timeLeft === 0 ? 'error.dark' : 'warning.dark',
              textAlign: 'center',
              fontSize: '0.9rem'
            }}
          >
            {timeLeft === 0 ? 'END' : formatTime(timeLeft || 0)}
          </Typography>
        )}
      </Box>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleCloseCartMenu}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        {currentCart && (
          <MenuItem disabled>
            <ListItemIcon>
              <Iconify icon={isRaceInProgress ? "mdi:timer" : "lets-icons:check-fill"} width={20} />
            </ListItemIcon>
            <ListItemText 
              primary={`Currently assigned: ${currentCart.name}`}
              secondary={`Fuel: ${currentCart.fuelLevel}% ${isRaceInProgress ? '(Race in progress)' : 
                isRaceCompleted ? '(Race completed)' : ''}`}
            />
          </MenuItem>
        )}
        
        <MenuItem disabled sx={{ opacity: 1, bgcolor: 'background.neutral' }}>
          <ListItemText primary="Available Carts" />
        </MenuItem>

        {getAvailableCarts().map((cart) => (
          <MenuItem 
            key={cart.id}
            onClick={() => handleSelectCart(cart.id ?? '')}
          >
            <ListItemIcon>
              <Iconify icon="mdi:go-kart" width={20} />
            </ListItemIcon>
            <ListItemText 
              primary={cart.name}
              secondary={`Fuel: ${cart.fuelLevel}%`}
            />
          </MenuItem>
        ))}
        {getAvailableCarts().length === 0 && (
          <MenuItem disabled>
            <ListItemText primary="No carts available" />
          </MenuItem>
        )}
      </Menu>
    </Stack>
  );
} 