import { Box, Tooltip, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';

interface UserInfoProps {
  name: string;
  email: string;
  userId: string;
  groupId: string;
}

export function UserInfo({ name, email, userId, groupId }: UserInfoProps) {
  const navigate = useNavigate();

  const handleRedirect = () => {
    navigate(`${userId}/${groupId}`, {state: { "name": name } });
  };

  return (
    <Box 
      sx={{ 
        flexGrow: 1,
        minWidth: 0,
        width: '40%',
        mr: 2
      }}
      onClick={handleRedirect}
    >
      <Typography variant="subtitle2" noWrap>
        {name}
      </Typography>
      <Tooltip 
        title={email} 
        placement="top"
        PopperProps={{
          modifiers: [
            {
              name: 'offset',
              options: {
                offset: [0, -14],
              },
            },
          ],
        }}
      >
        <Typography 
          variant="caption" 
          sx={{ 
            color: 'text.secondary',
            display: 'block',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            cursor: 'default',
          }} 
          noWrap
        >
          {email}
        </Typography>
      </Tooltip>
    </Box>
  );
} 