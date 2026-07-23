import axios from 'src/lib/axios';

const buildUploadEndpoint = (folder: string = 'support') => {
  const sanitizedFolder = (folder || 'support').trim();
  return `api/v1/files/upload/${encodeURIComponent(sanitizedFolder)}`;
};

const buildConfig = (onProgress?: (progress: number) => void) => {
  const config: any = {
    headers: { 'Content-Type': 'multipart/form-data' },
  };
  if (onProgress) {
    config.onUploadProgress = (event: any) => {
      const percentCompleted = Math.round((event.loaded * 100) / (event.total || 1));
      onProgress(percentCompleted);
    };
  }
  return config;
};

export const uploadFileApi = async (file: File, options?: { folder?: string; onProgress?: (progress: number) => void }) => {
  const { folder = 'support', onProgress } = options || {};

  const formData = new FormData();
  formData.append('file', file);

  return axios.post(buildUploadEndpoint(folder), formData, buildConfig(onProgress));
};

export const uploadFilesApi = async (files: File[], options?: { folder?: string; onProgress?: (progress: number) => void }) => {
  const { folder = 'support', onProgress } = options || {};

  const formData = new FormData();
  files.forEach((file) => formData.append('files', file));

  return axios.post(`${buildUploadEndpoint(folder)}/multi`, formData, buildConfig(onProgress));
};

export const deleteFileApi = (fileUrl: string) =>
  axios.delete('api/v1/files', {
    data: { url: fileUrl },
  });

