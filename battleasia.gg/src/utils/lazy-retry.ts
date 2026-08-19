/**
 * Lazy import with retry logic for handling chunk loading errors
 * This helps resolve issues when new deployments cause chunk mismatch
 */

interface RetryOptions {
  maxRetries?: number;
  delay?: number;
}

export function lazyRetry<T extends React.ComponentType<any>>(
  componentImport: () => Promise<{ default: T }>,
  options: RetryOptions = {}
): Promise<{ default: T }> {
  const { maxRetries = 1, delay = 1000 } = options;

  return new Promise((resolve, reject) => {
    const attemptImport = (retryCount: number) => {
      componentImport()
        .then(resolve)
        .catch((error) => {
          // Check if it's a chunk loading error
          const isChunkError =
            error?.message?.includes('Failed to fetch dynamically imported module') ||
            error?.message?.includes('Importing a module script failed') ||
            error?.message?.includes('Unable to preload');

          if (isChunkError && retryCount < maxRetries) {
            // Wait before retrying
            setTimeout(() => {
              // Retry silently
              attemptImport(retryCount + 1);
            }, delay);
          } else if (isChunkError) {
            // Max retries reached, reload the page
            // Max retries reached — attempt page reload
            const hasReloaded = sessionStorage.getItem('chunk-error-reload');
            if (!hasReloaded) {
              sessionStorage.setItem('chunk-error-reload', 'true');
              window.location.reload();
            } else {
              reject(error);
            }
          } else {
            // Not a chunk error, reject immediately
            reject(error);
          }
        });
    };

    attemptImport(0);
  });
}
