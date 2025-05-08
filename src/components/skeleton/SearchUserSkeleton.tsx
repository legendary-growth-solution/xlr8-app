import React from 'react';
import { Box, List, ListItem, ListItemText, Skeleton } from '@mui/material';

const SearchUserSkeleton = () => (
  <Box
    sx={{
      maxHeight: 200,
      overflow: 'auto',
      border: '1px solid',
      borderColor: 'divider',
      borderRadius: 1,
    }}
  >
    <List>
      <ListItem>
        <ListItemText
          primary={<Skeleton variant="text" width="80%" height={30} />}
          secondary={<Skeleton variant="text" width="60%" height={20} />}
        />
      </ListItem>
      <ListItem>
        <ListItemText
          primary={<Skeleton variant="text" width="80%" height={30} />}
          secondary={<Skeleton variant="text" width="60%" height={20} />}
        />
      </ListItem>
      <ListItem>
        <ListItemText
          primary={<Skeleton variant="text" width="80%" height={30} />}
          secondary={<Skeleton variant="text" width="60%" height={20} />}
        />
      </ListItem>
    </List>
  </Box>
);

export default SearchUserSkeleton;
