import { CONFIG } from 'src/global-config';

export const getImageUrl = (image?: string | null): string | undefined => {
    if (!image) {
        return "";
    }

    if (image.startsWith('http') || image.startsWith('blob:') || image.startsWith('data:')) {
        return image;
    }

    const baseUrl = CONFIG.serverUrl || '';
    if (!baseUrl) {
        return image;
    }

    return `${baseUrl}${image.startsWith('/') ? image : `/${image}`}`;
};


