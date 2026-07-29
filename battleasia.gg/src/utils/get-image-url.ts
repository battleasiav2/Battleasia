import { CONFIG } from 'src/global-config';

const DEFAULT_AVATAR = '/assets/images/mock/avatar/avatar-1.webp';

/** Resolve avatar/media URLs. FE public assets stay on the frontend origin. */
export const getImageUrl = (image?: string | null): string | undefined => {
    if (!image) {
        return '';
    }

    if (image.startsWith('http') || image.startsWith('blob:') || image.startsWith('data:')) {
        return image;
    }

    const normalized = image.startsWith('/') ? image : `/${image}`;

    // Frontend-bundled public assets must never be prefixed with the API host
    if (
        normalized.startsWith('/assets/') ||
        normalized.startsWith('/logo/') ||
        normalized.startsWith('/favicon')
    ) {
        const cdnBase = CONFIG.assetsDir?.replace(/\/$/, '') || '';
        return cdnBase ? `${cdnBase}${normalized}` : normalized;
    }

    const baseUrl = CONFIG.serverUrl?.replace(/\/$/, '') || '';
    if (!baseUrl) {
        return normalized;
    }

    return `${baseUrl}${normalized}`;
};

export const getAvatarUrl = (image?: string | null, fallback = DEFAULT_AVATAR): string => {
    const resolved = getImageUrl(image);
    return resolved || fallback;
};


