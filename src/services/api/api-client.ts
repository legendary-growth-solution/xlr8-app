import axios, { AxiosInstance } from 'axios';
import { BASE_URL } from './endpoints';

export const createApiClient = (): AxiosInstance => {
  const api = axios.create({
    baseURL: BASE_URL
  });

  api.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('accessToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

//   api.interceptors.response.use(
//     (response) => response,
//     async (error) => {
//       const originalRequest = error.config;

//       if (error.response?.status === 401 && !originalRequest._retry) {
//         originalRequest._retry = true;

//         try {
//           const refreshToken = localStorage.getItem('refreshToken');
//           const response = await axios.post('/api/auth/refresh-token', {
//             refresh_token: refreshToken
//           });

//           const { access_token } = response.data;
//           localStorage.setItem('accessToken', access_token);

//           originalRequest.headers.Authorization = `Bearer ${access_token}`;
//           return await axios(originalRequest);
//         } catch (err) {
//           localStorage.removeItem('accessToken');
//           localStorage.removeItem('refreshToken');
//           localStorage.removeItem('userRole');
//           window.location.href = '/auth';
//           return Promise.reject(error);
//         }
//       }

//       return Promise.reject(error);
//     }
//   );

  return api;
};

export const apiClient = createApiClient(); 