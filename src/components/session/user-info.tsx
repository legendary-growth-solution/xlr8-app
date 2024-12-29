import { Box, Typography, Tooltip } from '@mui/material';

interface UserInfoProps {
  name: string;
  email: string;
}

export function UserInfo({ name, email }: UserInfoProps) {
  return (
    <Box 
      sx={{ 
        flexGrow: 1,
        minWidth: 0,
        width: '40%',
        mr: 2
      }}
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