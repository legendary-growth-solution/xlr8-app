import React from 'react';
import { List, ListItem, ListItemText, Skeleton, Box } from '@mui/material';

interface UserSearchSkeletonProps {
  rows?: number;
}

export const UserSearchSkeleton: React.FC<UserSearchSkeletonProps> = ({ rows = 3 }) => (
  <Box sx={{ maxHeight: 200, overflow: 'auto', border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
    <List>
      {Array.from(new Array(rows)).map((_, index) => (
        <ListItem key={index} secondaryAction={<Skeleton variant="circular" width={24} height={24} />}>
          <ListItemText
            primary={<Skeleton variant="text" width={150} />}
            secondary={<Skeleton variant="text" width={200} />}
          />
        </ListItem>
      ))}
    </List>
  </Box>
);

export default UserSearchSkeleton; 