import { useState, useEffect, useCallback } from 'react';

// ----------------------------------------------------------------------

export type UseImagePreloaderOptions = {
    /** Delay in milliseconds before marking as loaded (for smooth transition) */
    delay?: number;
    /** Callback when all images are loaded */
    onComplete?: () => void;
    /** Callback when an image fails to load */
    onError?: (src: string) => void;
    /** Continue loading even if some images fail */
    continueOnError?: boolean;
};

export type UseImagePreloaderReturn = {
    /** Whether all images are loaded */
    isLoaded: boolean;
    /** Loading progress percentage (0-100) */
    progress: number;
    /** Number of images loaded */
    loadedCount: number;
    /** Total number of images */
    totalCount: number;
    /** Array of failed image paths */
    failedImages: string[];
};

// ----------------------------------------------------------------------

export function useImagePreloader(
    imagePaths: string[],
    options: UseImagePreloaderOptions = {}
): UseImagePreloaderReturn {
    const {
        delay = 100,
        onComplete,
        onError,
        continueOnError = true,
    } = options;

    const [isLoaded, setIsLoaded] = useState(false);
    const [progress, setProgress] = useState(0);
    const [loadedCount, setLoadedCount] = useState(0);
    const [failedImages, setFailedImages] = useState<string[]>([]);

    const totalCount = imagePaths.length;

    const loadAllImages = useCallback(async () => {
        // Reset state
        setIsLoaded(false);
        setProgress(0);
        setLoadedCount(0);
        setFailedImages([]);

        const currentTotalCount = imagePaths.length;

        if (currentTotalCount === 0) {
            setIsLoaded(true);
            return;
        }

        const loadImage = (src: string): Promise<void> =>
            new Promise((resolve) => {
                const img = new Image();
                img.onload = () => {
                    setLoadedCount((prev) => {
                        const newCount = prev + 1;
                        const newProgress = Math.round((newCount / currentTotalCount) * 100);
                        setProgress(newProgress);
                        return newCount;
                    });
                    resolve();
                };
                img.onerror = () => {
                    if (onError) {
                        onError(src);
                    }
                    if (continueOnError) {
                        setFailedImages((prev) => [...prev, src]);
                        setLoadedCount((prev) => {
                            const newCount = prev + 1;
                            const newProgress = Math.round((newCount / currentTotalCount) * 100);
                            setProgress(newProgress);
                            return newCount;
                        });
                        resolve();
                    } else {
                        onError?.(src);
                        resolve();
                    }
                };
                img.src = src;
            });

        try {
            await Promise.all(imagePaths.map(loadImage));
            // Small delay to ensure smooth transition
            setTimeout(() => {
                setIsLoaded(true);
                if (onComplete) {
                    onComplete();
                }
            }, delay);
        } catch (error) {
            // Silent fail — still show content
            // Still show content even if some images fail to load
            setIsLoaded(true);
            if (onComplete) {
                onComplete();
            }
        }
    }, [imagePaths, delay, onComplete, onError, continueOnError]);

    useEffect(() => {
        loadAllImages();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return {
        isLoaded,
        progress,
        loadedCount,
        totalCount,
        failedImages,
    };
}

