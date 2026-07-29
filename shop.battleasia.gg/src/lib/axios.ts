import type { AxiosRequestConfig } from 'axios';

import axios from 'axios';

import { store } from 'src/store';
import { CONFIG } from 'src/global-config';
import { logoutAction } from 'src/store/reducers/auth';

import { toast } from 'react-hot-toast';

// ----------------------------------------------------------------------

const axiosInstance = axios.create({ baseURL: CONFIG.serverUrl, withCredentials: true });

// Request interceptor
axiosInstance.interceptors.request.use(
  (config: any) => {
    config.baseURL = CONFIG.serverUrl;
    if (config.url && !config.url.startsWith('http') && !config.url.startsWith('/')) {
      config.url = `/${config.url}`;
    }
    const state = store.getState() as any;
    const accessToken = state.auth.token;
    if (accessToken) {
      config.headers.authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const { response } = error;
    if (response && response.status === 400) {
      const errorMessage = response.data?.message || response.data || 'Bad request';
      toast.error(errorMessage);
    } else if (response && response.status === 401) {
      store.dispatch(logoutAction());
      const errorMessage = response.data?.message || response.data || 'Unauthorized';
      toast.error(errorMessage);
    } else if (response && response.status === 413) {
      const errorMessage = response.data?.message || response.data || 'Payload too large';
      toast.error(errorMessage);
    } else if (response && response.status === 429) {
      const errorMessage = response.data?.message || response.data || 'Too many requests';
      toast.error(errorMessage);
    } else {
      console.log(response);
    }
    return Promise.reject((response && response.data) || 'Something went wrong!');
  }
);

export default axiosInstance;

// ----------------------------------------------------------------------

export const fetcher = async (args: string | [string, AxiosRequestConfig]) => {
  try {
    const [url, config] = Array.isArray(args) ? args : [args];

    const res = await axiosInstance.get(url, { ...config });

    return res.data;
  } catch (error) {
    console.error('Failed to fetch:', error);
    throw error;
  }
};

// ----------------------------------------------------------------------

export const endpoints = {
  chat: '/api/chat',
  kanban: '/api/kanban',
  calendar: '/api/calendar',
  auth: {
    me: '/api/users/me',
    signIn: '/api/users/signin',
    signUp: '/api/users/signup',
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
