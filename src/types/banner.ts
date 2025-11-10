export interface Banner {
  banner_id?: string;
  name: string;
  description?: string;
  imageUrl: string;
  link?: string;
  startDate: string;
  expiryDate?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface BannerListResponse {
  banners: Banner[];
  pagination: {
    currentPage: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  };
}

export interface BannerQueryParams {
  page?: number;
  pageSize?: number;
  search?: string;
}
