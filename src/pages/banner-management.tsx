import { Button, Card, Chip, Stack, TextField, InputAdornment } from '@mui/material';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ConfirmDialog } from 'src/components/dialog/confirm-dialog';
import { bannerApi } from 'src/services/api/banner.api';
import BannerDialog from 'src/components/banner/BannerDialog';
import PageContainer from 'src/components/common/PageContainer';
import PageHeader from 'src/components/common/PageHeader';
import DataTable from 'src/components/table/DataTable';
import { Banner } from 'src/types/banner';
import { showToast } from 'src/components/toast';
import { Iconify } from 'src/components/iconify';
import { debounce } from 'src/utils/debounce';

export default function BannerManagementPage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedBanner, setSelectedBanner] = useState<Banner | null>(null);
  const [deleteBannerId, setDeleteBannerId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const debouncedSearchRef = useRef(
    debounce((value: string) => {
      setCurrentPage(1);
      fetchBanners(1, value);
    }, 300)
  );

  const fetchBanners = useCallback(async (page = 1, search = '') => {
    try {
      setLoading(true);
      const response = await bannerApi.list({
        page,
        pageSize,
        search: search || undefined,
      });
      setBanners(response.banners);
      setTotalItems(response.pagination.totalItems);
      setTotalPages(response.pagination.totalPages);
      setCurrentPage(response.pagination.currentPage);
    } catch (error) {
      console.error('Failed to fetch banners', error);
      showToast.error('Failed to fetch banners');
    } finally {
      setLoading(false);
    }
  }, [pageSize]);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    debouncedSearchRef.current(value);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchBanners(page, searchTerm);
  };

  const columns = [
    {
      id: 'name',
      label: 'Name',
      minWidth: 200,
    },
    {
      id: 'description',
      label: 'Description',
      minWidth: 250,
      format: (value: string) => value || '-',
    },
    {
      id: 'imageUrl',
      label: 'Image',
      minWidth: 150,
      format: (value: string) => (
        <img
          src={value}
          alt="Banner"
          style={{
            width: '60px',
            height: '40px',
            objectFit: 'cover',
            borderRadius: '4px',
          }}
        />
      ),
    },
    {
      id: 'startDate',
      label: 'Start Date',
      minWidth: 150,
      format: (value: string) =>
        value ? new Date(value).toLocaleDateString() : '-',
    },
    {
      id: 'expiryDate',
      label: 'Expiry Date',
      minWidth: 150,
      format: (value: string) =>
        value ? new Date(value).toLocaleDateString() : '-',
    },
    {
      id: 'isActive',
      label: 'Status',
      minWidth: 100,
      format: (value: boolean) => (
        <Chip
          label={value ? 'Active' : 'Inactive'}
          color={value ? 'success' : 'default'}
          size="small"
        />
      ),
    },
  ];

  const handleEditBanner = (banner: Banner) => {
    setSelectedBanner(banner);
    setOpenDialog(true);
  };

  const handleAddBanner = async (data: Partial<Banner>) => {
    try {
      await bannerApi.create(data);
      showToast.success('Banner created successfully');
      fetchBanners(currentPage, searchTerm);
    } catch (error) {
      console.error('Failed to create banner', error);
      showToast.error('Failed to create banner');
    }
    setOpenDialog(false);
    setSelectedBanner(null);
  };

  const handleEditSubmit = async (id: string, data: Partial<Banner>) => {
    try {
      await bannerApi.update(id, data);
      showToast.success('Banner updated successfully');
      fetchBanners(currentPage, searchTerm);
    } catch (error) {
      console.error('Failed to update banner', error);
      showToast.error('Failed to update banner');
    }
    setOpenDialog(false);
    setSelectedBanner(null);
  };

  const handleDeleteBanner = async () => {
    if (!deleteBannerId) return;
    try {
      setLoading(true);
      await bannerApi.delete(deleteBannerId);
      showToast.success('Banner deleted successfully');
      fetchBanners(currentPage, searchTerm);
    } catch (error) {
      showToast.error('Failed to delete banner');
      console.error('Failed to delete banner:', error);
    } finally {
      setLoading(false);
      setDeleteBannerId(null);
    }
  };

  const actions = (banner: Banner) => (
    <Stack direction="row" spacing={1} justifyContent="flex-end">
      <Button
        size="small"
        variant="outlined"
        onClick={() => handleEditBanner(banner)}
      >
        Edit
      </Button>
      <Button
        size="small"
        variant="outlined"
        color="error"
        onClick={() => setDeleteBannerId(banner.banner_id || '')}
      >
        Delete
      </Button>
    </Stack>
  );

  useEffect(() => {
    fetchBanners();
  }, [fetchBanners]);

  useEffect(() => {
    const debouncedSearch = debouncedSearchRef.current;
    return () => debouncedSearch.cancel();
  }, []);

  return (
    <PageContainer title="Banner Management">
      <PageHeader
        title="Banner Management"
        action={{
          label: 'New Banner',
          onClick: () => setOpenDialog(true),
        }}
      />

      <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
        <TextField
          fullWidth
          placeholder="Search banners..."
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Iconify icon="eva:search-fill" />
              </InputAdornment>
            ),
          }}
          sx={{ maxWidth: 400 }}
        />
      </Stack>

      <Card>
        <DataTable
          loading={loading}
          columns={columns}
          rows={banners}
          actions={actions}
          page={currentPage}
          rowsPerPage={pageSize}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          emptyState={{
            icon: 'mdi:image-off',
            title: 'No banner available',
          }}
        />
      </Card>

      <BannerDialog
        open={openDialog}
        onClose={() => {
          setOpenDialog(false);
          setSelectedBanner(null);
        }}
        onAdd={handleAddBanner}
        onEdit={handleEditSubmit}
        banner={selectedBanner}
      />

      <ConfirmDialog
        open={!!deleteBannerId}
        title="Delete Banner"
        content="Are you sure you want to delete this banner? This action cannot be undone."
        confirmText="Delete"
        confirmColor="error"
        loading={loading}
        onClose={() => setDeleteBannerId(null)}
        onConfirm={handleDeleteBanner}
      />
    </PageContainer>
  );
}
