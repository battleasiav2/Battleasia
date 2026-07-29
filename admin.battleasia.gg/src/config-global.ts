// routes
import { paths } from 'src/routes/paths';

// API
// ----------------------------------------------------------------------

export const HOST_API = process.env.REACT_APP_HOST_API;
export const ASSETS_API = process.env.REACT_APP_ASSETS_API;
export const API_URL = process.env.REACT_APP_API_URL;

// ROOT PATH AFTER LOGIN SUCCESSFUL
export const PATH_AFTER_LOGIN = paths.dashboard.root; // as '/dashboard'

// ----------------------------------------------------------------------

export const GAME_SERVERS = [
    { value: 'europe', label: 'Europe' },
    { value: 'asia', label: 'Asia' },
    { value: 'south-america', label: 'South America' },
    { value: 'middle-east', label: 'Middle East' },
    { value: 'krjp', label: 'KRJP' },
  ] as const;
  
  