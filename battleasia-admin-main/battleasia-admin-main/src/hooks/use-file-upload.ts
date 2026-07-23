import { useState, useCallback } from 'react';
import { validateFile } from 'src/utils/file-upload';
import useApi from 'src/hooks/use-api';
import toast from 'react-hot-toast';

// ----------------------------------------------------------------------

export type UseFileUploadOptions = {
    maxSize?: number;
    allowedTypes?: string[];
    autoUpload?: boolean;
    endpoint?: string;
    fieldName?: string;
    folder?: string;
};

export type UseFileUploadReturn = {
    uploading: boolean;
    uploadProgress: number;
    uploadFile: (file: File) => Promise<string | null>;
    uploadFiles: (files: File[]) => Promise<string[]>;
    validateAndUpload: (file: File) => Promise<string | null>;
    deleteFile: (fileUrl: string) => Promise<boolean>;
};

/**
 * Custom hook for handling file uploads
 * @param options - Upload configuration options
 * @returns Object with upload functions and state
 */
export function useFileUpload(options: UseFileUploadOptions = {}): UseFileUploadReturn {
    const {
        maxSize,
        allowedTypes,
        autoUpload = true,
        endpoint,
        fieldName,
        folder = 'avatar',
    } = options;

    const { uploadFileApi, uploadFilesApi, deleteFileApi } = useApi();
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

    const handleUpload = useCallback(
        async (file: File): Promise<string | null> => {
            // Validate file if validation options are provided
            if (maxSize || allowedTypes) {
                const validation = validateFile(file, maxSize, allowedTypes);
                if (!validation.isValid) {
                    toast.error(validation.error || 'File validation failed');
                    return null;
                }
            }

            if (!autoUpload) {
                // Return file object URL for preview if auto-upload is disabled
                return URL.createObjectURL(file);
            }

            try {
                setUploading(true);
                setUploadProgress(0);

                const onProgress = (progress: number) => {
                    setUploadProgress(progress);
                };

                const response = await uploadFileApi(file, {
                    endpoint,
                    fieldName,
                    folder,
                    onProgress,
                });

                setUploadProgress(100);

                // Handle different response structures
                if (response?.data?.status && response.data?.data) {
                    return response.data.data.url || response.data.data.filename || null;
                }

                if (response?.data?.url) {
                    return response.data.url;
                }

                if (response?.data?.filename) {
                    return response.data.filename;
                }

                return null;
            } catch (error: any) {
                console.error('Upload error:', error);
                const errorMessage =
                    error?.response?.data?.message ||
                    error?.message ||
                    'Failed to upload file';
                toast.error(errorMessage);
                return null;
            } finally {
                setUploading(false);
                // Reset progress after a short delay
                setTimeout(() => setUploadProgress(0), 1000);
            }
        },
        [maxSize, allowedTypes, autoUpload, endpoint, fieldName, folder, uploadFileApi]
    );

    const handleUploadMultiple = useCallback(
        async (files: File[]): Promise<string[]> => {
            if (!files.length) return [];

            if (autoUpload && uploadFilesApi) {
                try {
                    setUploading(true);
                    const response = await uploadFilesApi(files, options);
                    const uploaded =
                        response?.data?.data?.files?.map((item: any) => item.url || item.filename)?.filter(Boolean) || [];
                    return uploaded;
                } catch (error: any) {
                    console.error('Upload multiple error:', error);
                    const errorMessage =
                        error?.response?.data?.message || error?.message || 'Failed to upload files';
                    toast.error(errorMessage);
                    return [];
                } finally {
                    setUploading(false);
                }
            }

            const uploadPromises = files.map((file) => handleUpload(file));
            const results = await Promise.all(uploadPromises);
            return results.filter((url): url is string => url !== null);
        },
        [autoUpload, uploadFilesApi, options, handleUpload]
    );

    const validateAndUpload = useCallback(
        (file: File): Promise<string | null> => handleUpload(file),
        [handleUpload]
    );

    const handleDelete = useCallback(
        async (fileUrl: string): Promise<boolean> => {
            if (!fileUrl) {
                return false;
            }

            try {
                await deleteFileApi(fileUrl);
                return true;
            } catch (error: any) {
                console.error('Delete file error:', error);
                const errorMessage =
                    error?.response?.data?.message ||
                    error?.message ||
                    'Failed to delete file';
                toast.error(errorMessage);
                return false;
            }
        },
        [deleteFileApi]
    );

    return {
        uploading,
        uploadProgress,
        uploadFile: handleUpload,
        uploadFiles: handleUploadMultiple,
        validateAndUpload,
        deleteFile: handleDelete,
    };
}

