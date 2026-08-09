import axios from 'src/lib/axios';

import type { LoginData, RegisterData } from '../type';

export const initialize = () => axios.get('api/v2/users/me');

/** Mint a Bearer token from the current cookie/session for shop SSO handoff */
export const shopHandoffApi = () => axios.post('api/v2/users/shop-handoff');

export const loginApi = (data: LoginData) => axios.post('api/v2/users/signin', data);

export const registerApi = (data: RegisterData) => axios.post('api/v2/users/signup', data);

// Email verification APIs
export const sendVerificationEmailApi = () => axios.post('api/v2/users/send-verification-email');

export const resendVerificationCodeApi = (email: string) => axios.post('api/v2/users/resend-verification-code', { email });

export const verifyEmailApi = (code: string) => axios.post('api/v2/users/verify-email', { code });

// New API for verifying email during signup (no auth required)
export const verifyEmailSignupApi = (email: string, code: string) => 
  axios.post('api/v2/users/verify-email-signup', { email, code });

export const forgotPasswordApi = (email: string) => axios.post('api/v2/users/forgot-password', { email });

export const verifyResetCodeApi = (email: string, code: string) => 
  axios.post('api/v2/users/verify-reset-code', { email, code });

export const resetPasswordApi = (email: string, code: string, newPassword: string) => 
  axios.post('api/v2/users/reset-password', { email, code, newPassword });



