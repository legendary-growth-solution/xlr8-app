import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  FormControlLabel,
  Switch,
  Box,
  Alert,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { Banner } from 'src/types/banner';

interface BannerDialogProps {
  open: boolean;
  onClose: () => void;
  onAdd?: (data: Partial<Banner>) => void;
  onEdit?: (id: string, data: Partial<Banner>) => void;
  banner?: Banner | null;
}

const isValidImageUrl = (url: string): boolean => {
  if (!url) return false;

  try {
    const parsedUrl = new URL(url);
    return parsedUrl.protocol === 'https:';
  } catch {
    return false;
  }
};

export default function BannerDialog({ open, onClose, onAdd, onEdit, banner }: BannerDialogProps) {
  const isEditMode = !!banner;
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [link, setLink] = useState('');
  const [startDate, setStartDate] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    if (banner && open) {
      setName(banner.name || '');
      setDescription(banner.description || '');
      const url = banner.imageUrl || '';
      setImageUrl(url);
      setImageError(url ? !isValidImageUrl(url) : false);
      setLink(banner.link || '');
      setStartDate(banner.startDate ? new Date(banner.startDate).toISOString().slice(0, 16) : '');
      setExpiryDate(banner.expiryDate ? new Date(banner.expiryDate).toISOString().slice(0, 16) : '');
      setIsActive(banner.isActive ?? true);
    }
  }, [banner, open]);

  const handleImageUrlChange = (value: string) => {
    setImageUrl(value);
    if (value && !isValidImageUrl(value)) {
      setImageError(true);
    } else {
      setImageError(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (imageError) return;

    if (isEditMode && banner?.banner_id && onEdit) {
      onEdit(banner.banner_id, {
        name,
        description: description || undefined,
        imageUrl,
        link: link || undefined,
        startDate,
        expiryDate: expiryDate || undefined,
        isActive,
      });
    } else if (!isEditMode && onAdd) {
      onAdd({
        name,
        description: description || undefined,
        imageUrl,
        link: link || undefined,
        startDate,
        expiryDate: expiryDate || undefined,
        isActive,
      });
    }
    handleClose();
  };

  const handleClose = () => {
    if (!isEditMode) {
      setName('');
      setDescription('');
      setImageUrl('');
      setLink('');
      setStartDate('');
      setExpiryDate('');
      setIsActive(true);
      setImageError(false);
    }
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>{isEditMode ? 'Edit Banner' : 'Add New Banner'}</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <TextField
            fullWidth
            label="Banner Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            sx={{ mb: 2 }}
            required
          />
          <TextField
            fullWidth
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            multiline
            rows={3}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Image URL"
            value={imageUrl}
            onChange={(e) => handleImageUrlChange(e.target.value)}
            sx={{ mb: 2 }}
            required
            placeholder="https://example.com/image.jpg"
            error={imageError}
            helperText={imageError ? 'Please enter a valid HTTPS image URL' : ''}
          />
          {imageUrl && !imageError && (
            <Box sx={{ mb: 2, display: 'flex', justifyContent: 'center' }}>
              <Box
                component="img"
                src={imageUrl}
                alt="Banner preview"
                sx={{
                  maxWidth: '100%',
                  maxHeight: 200,
                  objectFit: 'contain',
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 1,
                  p: 1,
                }}
                onError={() => setImageError(true)}
                onLoad={() => setImageError(false)}
              />
            </Box>
          )}
          <TextField
            fullWidth
            label="Link (Optional)"
            value={link}
            onChange={(e) => setLink(e.target.value)}
            sx={{ mb: 2 }}
            placeholder="https://example.com"
          />
          <TextField
            fullWidth
            label="Start Date"
            type="datetime-local"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            sx={{ mb: 2 }}
            required
            InputLabelProps={{
              shrink: true,
            }}
          />
          <TextField
            fullWidth
            label="Expiry Date (Optional)"
            type="datetime-local"
            value={expiryDate}
            onChange={(e) => setExpiryDate(e.target.value)}
            sx={{ mb: 2 }}
            InputLabelProps={{
              shrink: true,
            }}
          />
          <FormControlLabel
            control={
              <Switch
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
              />
            }
            label="Active"
            sx={{ mb: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button type="submit" variant="contained" color="primary">
            {isEditMode ? 'Update Banner' : 'Add Banner'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
