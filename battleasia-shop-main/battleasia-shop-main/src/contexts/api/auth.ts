import axios from 'src/lib/axios';

import type { LoginData, RegisterData } from '../type';

export const initialize = () => axios.get('api/v2/users/me');

export const loginApi = (data: LoginData) => axios.post('api/v2/users/signin', data);

export const registerApi = (data: RegisterData) => axios.post('api/v2/users/signup', data);


