import { Box, Stack, Avatar, Typography, Tooltip, Chip } from '@mui/material';
import { Cart, Group, Plan, User, UserRaceStatus } from 'src/types/session';
import { keyframes } from '@emotion/react';
import { styled } from '@mui/material/styles';
import { CartControls } from './cart-controls';
import { Iconify } from '../iconify';

const disqualifyAnimation = keyframes`
  0% { transform: translateX(0) scale(1) rotate(0deg); box-shadow: 0 0 0 rgba(255, 0, 0, 0); }
  10% { transform: translateX(-10px) scale(1.02) rotate(-1deg); background-color: rgba(255, 0, 0, 0.2); box-shadow: 0 0 15px rgba(255, 0, 0, 0.6); }
  20% { transform: translateX(10px) scale(1.02) rotate(1deg); background-color: rgba(255, 0, 0, 0.1); }
  30% { transform: translateX(-10px) scale(1.03) rotate(-2deg); background-color: rgba(255, 0, 0, 0.3); box-shadow: 0 0 20px rgba(255, 0, 0, 0.7); }
  40% { transform: translateX(10px) scale(1.01) rotate(1deg); background-color: rgba(255, 0, 0, 0.1); }
  50% { transform: translateX(-5px) scale(1.04) rotate(-1deg); background-color: rgba(255, 0, 0, 0.4); box-shadow: 0 0 25px rgba(255, 0, 0, 0.8); }
  60% { transform: translateX(5px) scale(1.02) rotate(2deg); background-color: rgba(255, 0, 0, 0.2); }
  70% { transform: translateX(-5px) scale(1.01) rotate(-1deg); background-color: rgba(255, 0, 0, 0.3); box-shadow: 0 0 15px rgba(255, 0, 0, 0.6); }
  80% { transform: translateX(5px) scale(1.01) rotate(1deg); background-color: rgba(255, 0, 0, 0.1); }
  90% { transform: translateX(-2px) scale(1.01) rotate(0deg); background-color: rgba(255, 0, 0, 0.05); box-shadow: 0 0 5px rgba(255, 0, 0, 0.3); }
  100% { transform: translateX(0) scale(1) rotate(0deg); box-shadow: 0 0 0 rgba(255, 0, 0, 0); }
`;

const penaltyAnimation = keyframes`
  0% { transform: scale(1); }
  10% { transform: scale(1.05); background-color: rgba(255, 193, 7, 0.1); }
  20% { transform: scale(1); }
  30% { transform: scale(1.05); background-color: rgba(255, 193, 7, 0.2); }
  40% { transform: scale(1); }
  50% { transform: scale(1.05); background-color: rgba(255, 193, 7, 0.3); }
  60% { transform: scale(1); }
  70% { transform: scale(1.05); background-color: rgba(255, 193, 7, 0.2); }
  80% { transform: scale(1); }
  90% { transform: scale(1.05); background-color: rgba(255, 193, 7, 0.1); }
  100% { transform: scale(1); }
`;

const flagAnimation = keyframes`
  0% { transform: scale(1) rotate(0deg); opacity: 1; }
  25% { transform: scale(1.5) rotate(15deg); opacity: 1; }
  50% { transform: scale(1.8) rotate(-15deg); opacity: 1; }
  75% { transform: scale(1.5) rotate(5deg); opacity: 0.9; }
  100% { transform: scale(1) rotate(0deg); opacity: 1; }
`;

const UserRow = styled(Stack)(({ theme }) => ({
  '&.disqualify-animation': {
    animation: `${disqualifyAnimation} 1.5s ease`,
    position: 'relative',
    zIndex: 1,
    borderRadius: theme.shape.borderRadius,
    overflow: 'visible',
    '&::after': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: -8,
      right: -8,
      bottom: 0,
      background: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255, 0, 0, 0.05) 10px, rgba(255, 0, 0, 0.05) 20px)',
      borderRadius: theme.shape.borderRadius,
      zIndex: -1,
      opacity: 0,
      animation: 'fadeIn 0.5s ease forwards 1.5s',
    },
    '& .disqualify-flag': {
      animation: `${flagAnimation} 1.5s ease`
    }
  },
  '&.penalty-animation': {
    animation: `${penaltyAnimation} 1.5s ease`,
  },
  '@keyframes fadeIn': {
    '0%': { opacity: 0 },
    '100%': { opacity: 1 }
  }
}));

interface GroupUserListProps {
  users: User[];
  group: Group;
  carts: Cart[];
  // eslint-disable-next-line react/no-unused-prop-types
  getCarts: VoidFunction;
  handleAssignCart: (group_id: string, user_id: string, cart_id: string) => void;
  handleManageUserRace: (group_id: string, user_id: string, status: UserRaceStatus, updates?: any) => void;
  plans?: Plan[];
  disabled?: boolean;
}

export function GroupUserList({
  users,
  group,
  carts,
  handleAssignCart,
  handleManageUserRace,
  plans = [],
  disabled = false,
}: GroupUserListProps) {
  if (users.length === 0) {
    return (
      <Box
        sx={{
          py: 5,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          bgcolor: 'background.neutral',
          borderRadius: 1,
          flexGrow: 1,
        }}
      >
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          No racers assigned yet
        </Typography>
      </Box>
    );
  }

  const getUserTime = (user: User) => {
    if (user?.time_in_minutes) return user.time_in_minutes;

    if (user?.plan_id && plans?.length) {
      const userPlan = plans.find((plan) => plan.plan_id === user.plan_id);
      if (userPlan?.timeInMinutes) return userPlan.timeInMinutes;
    }

    return user?.time_allotted || 0;
  };

  return (
    <Box sx={{ pt: 0.5, mt: '0px !important' }}>
      {users.map((user) => {
        const isDisqualified = user.is_disqualified;
        const hasPenalty = user.penalty_seconds && user.penalty_seconds > 0;
        
        return (
          <UserRow
            key={user.user_id}
            direction="row"
            alignItems="center"
            spacing={2}
            data-user-id={user.user_id}
            sx={{
              py: 1.5,
              position: 'relative',
              '&:not(:last-child)': {
                borderBottom: (theme) => `dashed 1px ${theme.palette.divider}`,
              },
              ...(isDisqualified && {
                opacity: 0.8,
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  left: -8,
                  right: -8,
                  top: 0,
                  bottom: 0,
                  borderRadius: '4px',
                  background: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255, 0, 0, 0.05) 10px, rgba(255, 0, 0, 0.05) 20px)',
                  pointerEvents: 'none',
                },
              }),
            }}
          >
            <Box sx={{ position: 'relative' }}>
              <Avatar
                sx={{
                  width: 36,
                  height: 36,
                  bgcolor: isDisqualified ? 'error.main' : hasPenalty ? 'warning.main' : 'primary.main',
                  fontSize: '1rem',
                  ...(isDisqualified && {
                    border: '2px solid',
                    borderColor: 'error.main',
                  }),
                }}
              >
                {user.user_name
                  .split(' ')
                  .map((name) => name[0]?.toUpperCase())
                  .join('')}
              </Avatar>
              <Typography
                variant="caption"
                sx={{
                  position: 'absolute',
                  bottom: -8,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  px: 1,
                  py: 0.25,
                  borderRadius: 0.75,
                  bgcolor: isDisqualified 
                    ? 'error.lighter' 
                    : hasPenalty 
                      ? 'warning.lighter' 
                      : 'success.lighter',
                  color: isDisqualified 
                    ? 'error.dark' 
                    : hasPenalty 
                      ? 'warning.dark' 
                      : 'success.dark',
                  fontSize: '0.65rem',
                  fontWeight: 'bold',
                  whiteSpace: 'nowrap',
                }}
              >
                {getUserTime(user)}m
              </Typography>
            </Box>

            <Box
              sx={{
                flexGrow: 1,
                minWidth: 0,
                width: '40%',
                mr: 2,
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <Stack direction="column" spacing={0.5} sx={{ minWidth: 0, flexGrow: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Tooltip title={user?.user_name} enterDelay={500}>
                    <Typography 
                      variant="subtitle2" 
                      noWrap
                      sx={{
                        textDecoration: isDisqualified ? 'line-through' : 'none',
                        color: isDisqualified ? 'error.main' : 'text.primary',
                        maxWidth: '120px',
                      }}
                    >
                      {user?.user_name}
                    </Typography>
                  </Tooltip>
                  
                  {isDisqualified && (
                    <Tooltip title={user.disqualification_reason || 'Disqualified'}>
                      <Box sx={{ display: 'inline-flex' }}>
                        <Iconify 
                          className="disqualify-flag"
                          icon="mdi:flag" 
                          width={16} 
                          sx={{ 
                            color: 'error.main',
                            animation: 'pulse 2s infinite',
                            '@keyframes pulse': {
                              '0%': { opacity: 1 },
                              '50%': { opacity: 0.6 },
                              '100%': { opacity: 1 },
                            }
                          }} 
                        />
                      </Box>
                    </Tooltip>
                  )}
                </Box>
              </Stack>
            </Box>

            <Box sx={{ flexShrink: 0 }}>
              <CartControls
                handleManageUserRace={handleManageUserRace}
                user={user}
                group_id={group.group_id}
                carts={carts}
                handleAssignCart={handleAssignCart}
                disabled={disabled}
              />
            </Box>
          </UserRow>
        );
      })}
    </Box>
  );
}
