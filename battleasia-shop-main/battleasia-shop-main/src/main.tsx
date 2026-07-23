import { StrictMode } from 'react';
import { Provider } from 'react-redux';
import { createRoot } from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
import { PersistGate } from 'redux-persist/integration/react';
import { Outlet, RouterProvider, createBrowserRouter } from 'react-router';

import App from './app';
import { store, persister } from './store';
import { routesSection } from './routes/sections';
import { ErrorBoundary } from './routes/components';

// ----------------------------------------------------------------------

const shopBasename = (import.meta.env.VITE_BASE_PATH || '/').replace(/\/$/, '');

const router = createBrowserRouter(
  [
    {
      Component: () => (
        <App>
          <Outlet />
        </App>
      ),
      errorElement: <ErrorBoundary />,
      children: routesSection,
    },
  ],
  shopBasename ? { basename: shopBasename } : undefined
);

const root = createRoot(document.getElementById('root')!);

root.render(
  <StrictMode>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persister}>
        <HelmetProvider>
          <RouterProvider router={router} />
        </HelmetProvider>
      </PersistGate>
    </Provider>
  </StrictMode>
);
