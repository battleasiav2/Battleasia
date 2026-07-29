import axios from 'src/utils/axios';
import { UploadFileOptions } from '../type';

const buildUploadEndpoint = (endpoint: string | undefined, folder: string | undefined, suffix = '') => {
  const sanitizedFolder = (folder || 'avatar').trim();
  const base = (endpoint ?? 'api/v1/files/upload').replace(/\/+$/, '');
  return `${base}/${encodeURIComponent(sanitizedFolder)}${suffix}`;
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

export const uploadFileApi = async (file: File, options?: UploadFileOptions) => {
  const { endpoint, fieldName = 'file', folder, onProgress } = options || {};

  const formData = new FormData();
  formData.append(fieldName, file);

  return axios.post(buildUploadEndpoint(endpoint, folder), formData, buildConfig(onProgress));
};

export const uploadFilesApi = async (files: File[], options?: UploadFileOptions) => {
  const { multiEndpoint, endpoint, multiFieldName = 'files', folder, onProgress } = options || {};
  const formData = new FormData();
  files.forEach((file) => formData.append(multiFieldName, file));

  const base = multiEndpoint ?? endpoint ?? 'api/v1/files/upload';
  return axios.post(buildUploadEndpoint(base, folder, '/multi'), formData, buildConfig(onProgress));
};

export const deleteFileApi = (fileUrl: string) =>
  axios.delete('/api/v1/files', {
    data: { url: fileUrl },
  });


