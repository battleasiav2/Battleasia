import axios, { AxiosRequestConfig } from 'axios';
// config
import { API_URL } from 'src/config-global';
import toast from 'react-hot-toast';
import { store } from 'src/store';
import { logoutAction } from 'src/store/reducers/auth';
// ----------------------------------------------------------------------

const axiosInstance = axios.create({ baseURL: API_URL, withCredentials: true });

axiosInstance.interceptors.request.use(
  (config: any) => {
    config.baseURL = API_URL;
    const state = store.getState() as any;
    const accessToken = state.auth.token;
    if (accessToken) {
      config.headers.authorization = accessToken.startsWith('Bearer ')
        ? accessToken
        : `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const { response } = error;

    const getErrorMessage = (data: any, fallback: string): string => {
      if (!data) return fallback;
      if (typeof data === 'string') return data;
      if (typeof data?.error === 'string') return data.error;
      if (typeof data?.message === 'string') return data.message;
      return fallback;
    };

    if (response && response.status === 400) {
      console.error(response.data);
      toast.error(getErrorMessage(response.data, 'Bad request'));
    } else if (response && response.status === 401) {
      const state = store.getState() as { auth?: { isLoggedIn?: boolean } };
      const requestUrl = String(error?.config?.url || '');
      const isAuthRequest =
        requestUrl.includes('/auth/signin') ||
        requestUrl.includes('/auth/verify-otp') ||
        requestUrl.includes('/auth/logout');

      if (state.auth?.isLoggedIn && !isAuthRequest) {
        store.dispatch(logoutAction());
      }
    } else if (response && response.status === 402) {
      toast.error(getErrorMessage(response.data, 'Payment required'));
    } else if (response && response.status === 500) {
      toast.error(getErrorMessage(response.data, 'Internal server error'));
    } else if (response && response.status === 404) {
      toast.error('API not found');
    } else if (!response) {
      console.error('[API] Network error:', error?.message || error);
    } else {
      toast.error(getErrorMessage(response?.data, 'API error'));
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;


// ----------------------------------------------------------------------

export const fetcher = async (args: string | [string, AxiosRequestConfig]) => {
  const [url, config] = Array.isArray(args) ? args : [args];

  const res = await axiosInstance.get(url, { ...config });

  return res.data;
};

// ----------------------------------------------------------------------

export const endpoints = {
  chat: '/api/chat',
  kanban: '/api/kanban',
  calendar: '/api/calendar',
  auth: {
    me: '/api/auth/me',
    login: '/api/auth/login',
    register: '/api/auth/register',
  },
  mail: {
    list: '/api/mail/list',
    details: '/api/mail/details',
    labels: '/api/mail/labels',
  },
  post: {
    list: '/api/post/list',
    details: '/api/post/details',
    latest: '/api/post/latest',
    search: '/api/post/search',
  },
  product: {
    list: '/api/product/list',
    details: '/api/product/details',
    search: '/api/product/search',
  },
};
