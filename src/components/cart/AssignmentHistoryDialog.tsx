import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  List, 
  ListItem, 
  ListItemText, 
  Typography,
  Button,
  Box,
  Chip,
  Divider,
  IconButton,
  DialogActions,
  useTheme
} from '@mui/material';
import { useState, useEffect } from 'react';
import { Cart } from 'src/types/cart';
import { AssignmentHistory, cartApi } from 'src/services/api/cart.api';
import CloseIcon from '@mui/icons-material/Close';
import PersonIcon from '@mui/icons-material/Person';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import AssignmentHistoryListSkeleton from './AssignmentHistoryListSkeleton';

interface AssignmentHistoryDialogProps {
  open: boolean;
  onClose: () => void;
  cart: Cart | null;
  history: AssignmentHistory[];
  hasMore: boolean;
  loading: boolean;
}

export default function AssignmentHistoryDialog({ 
  open, 
  onClose, 
  cart, 
  history: initialHistory,
  hasMore: initialHasMore,
  loading: initialLoading
}: AssignmentHistoryDialogProps) {
  const theme = useTheme();
  const [history, setHistory] = useState(initialHistory);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  
  useEffect(() => {
    setHistory(initialHistory);
    setHasMore(initialHasMore);
    setPage(1);
  }, [initialHistory, initialHasMore]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'assigned':
        return theme.palette.success.main;
      case 'unassigned':
        return theme.palette.error.main;
      default:
        return theme.palette.info.main;
    }
  };

  const handleLoadMore = async () => {
    if (!cart?.rfid_number) return;
    
    try {
      setLoading(true);
      const nextPage = page + 1;
      const response = await cartApi.getAssignmentHistory(cart.rfid_number, nextPage);
      
      setHistory([...history, ...response.history]);
      setHasMore(response.has_more);
      setPage(nextPage);
    } catch (error) {
      console.error('Failed to load more history:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          minHeight: '60vh'
        }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        borderBottom: 1,
        borderColor: 'divider',
        pb: 2
      }}>
        <Typography variant="h6" component="div">
          Assignment History - {cart?.name}
        </Typography>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ p: 0 }}>
        {initialLoading ? (
          <AssignmentHistoryListSkeleton />
        ) : history.length === 0 ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
            <Typography color="textSecondary">No assignment history found</Typography>
          </Box>
        ) : (
          <>
            <List sx={{ pt: 0 }}>
              {history.map((record, index) => (
                <ListItem 
                  key={index} 
                  divider={index !== history.length - 1}
                  sx={{ 
                    px: 3,
                    py: 2,
                    '&:hover': {
                      bgcolor: 'action.hover'
                    }
                  }}
                >
                  <ListItemText
                    primary={
                      <Box display="flex" alignItems="center" gap={1} mb={1}>
                        <Chip
                          label={record.status.toUpperCase()}
                          size="small"
                          sx={{
                            bgcolor: getStatusColor(record.status),
                            color: 'white',
                            fontWeight: 'medium'
                          }}
                        />
                      </Box>
                    }
                    secondary={
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                        <Box display="flex" alignItems="center" gap={1}>
                          <PersonIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                          <Typography component="span" variant="body2">
                            {record.user_name || 'Unknown User'}
                          </Typography>
                        </Box>
                        <Box display="flex" alignItems="center" gap={1}>
                          <AccessTimeIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                          <Typography component="span" variant="body2">
                            {formatDate(record.timestamp)}
                          </Typography>
                        </Box>
                      </Box>
                    }
                  />
                </ListItem>
              ))}
            </List>
            {hasMore && (
              <Box 
                sx={{ 
                  textAlign: 'center', 
                  py: 2,
                  borderTop: 1,
                  borderColor: 'divider'
                }}
              >
                <Button 
                  onClick={handleLoadMore} 
                  disabled={loading}
                  variant="text"
                  sx={{ 
                    minWidth: 150,
                    '&.Mui-disabled': {
                      bgcolor: 'action.disabledBackground'
                    }
                  }}
                >
                  {loading ? 'Loading...' : '+ View More'}
                </Button>
              </Box>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
} 