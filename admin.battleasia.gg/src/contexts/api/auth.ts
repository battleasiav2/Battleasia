import axios from 'src/utils/axios';

export const initialize = async () => axios.get('api/v3/users/auth/me');

export const loginApi = async (email: string, password: string) =>
  axios.post('api/v3/users/auth/signin', { email, password });

export const verifyOtpApi = async (email: string, password: string, code: string) =>
  axios.post('api/v3/users/auth/verify-otp', { email, password, code });

export const logoutApi = async () => axios.post('api/v3/users/auth/logout');

export const updateProfileApi = async (data: {
  currentPassword?: string;
  newPassword?: string;
  avatar?: string;
}) => axios.patch('api/v3/users/auth/profile', data);
