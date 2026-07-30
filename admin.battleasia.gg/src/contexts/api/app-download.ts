import axios from 'src/utils/axios';

export const getAppDownloadSettingsApi = () => axios.get('api/v2/app-settings/app-download');

export const updateAppDownloadSettingsApi = (data: {
  enabled?: boolean;
  version?: string;
}) => axios.put('api/v2/app-settings/app-download', data);

export const uploadAppApkApi = (file: File, version?: string) => {
  const formData = new FormData();
  formData.append('apk', file);
  if (version) {
    formData.append('version', version);
  }
  return axios.post('api/v2/app-settings/app-download/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    maxContentLength: 500 * 1024 * 1024,
    maxBodyLength: 500 * 1024 * 1024,
  });
};
