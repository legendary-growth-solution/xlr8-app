import { List, ListItem, ListItemText, Skeleton, Box } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

export default function AssignmentHistoryListSkeleton() {
  return (
    <List sx={{ pt: 0 }}>
      {[...Array(5)].map((_, index) => (
        <ListItem 
          key={index} 
          divider 
          sx={{ 
            px: 3,
            py: 2
          }}
        >
          <ListItemText
            primary={
              <Box display="flex" alignItems="center" gap={1} mb={1}>
                <Skeleton 
                  variant="rectangular" 
                  width={80} 
                  height={24} 
                  sx={{ 
                    borderRadius: 1,
                  }} 
                />
              </Box>
            }
            secondary={
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Box display="flex" alignItems="center" gap={1}>
                  <PersonIcon sx={{ fontSize: 18, color: 'text.disabled' }} />
                  <Skeleton width={120} height={20} />
                </Box>
                <Box display="flex" alignItems="center" gap={1}>
                  <AccessTimeIcon sx={{ fontSize: 18, color: 'text.disabled' }} />
                  <Skeleton width={160} height={20} />
                </Box>
              </Box>
            }
          />
        </ListItem>
      ))}
    </List>
  );
} 