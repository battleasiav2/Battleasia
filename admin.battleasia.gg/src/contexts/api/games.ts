import axios from 'src/utils/axios';
import { IGameData, IMatchData, IMatchResultData, IMatchResultEntryData } from '../type';

export const getGamesApi = async (params?: { page?: number; limit?: number; search?: string }) => {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  if (params?.search) queryParams.append('search', params.search);

  const queryString = queryParams.toString();
  const url = `api/v3/games/list${queryString ? `?${queryString}` : ''}`;
  return axios.get(url);
};

export const getGameByIdApi = async (id: string) =>
  axios.get(`api/v3/games/list/${id}`);

export const createGameApi = async (data: IGameData) =>
  axios.post('api/v3/games/list', data);

export const updateGameApi = async (id: string, data: Partial<IGameData>) =>
  axios.put(`api/v3/games/list/${id}`, data);

export const deleteGameApi = async (id: string) =>
  axios.delete(`api/v3/games/list/${id}`);


export const getMatchesApi = async (params?: { page?: number; limit?: number; search?: string; gameId?: string }) => {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  if (params?.search) queryParams.append('search', params.search);
  if (params?.gameId) queryParams.append('gameId', params.gameId);

  const queryString = queryParams.toString();
  const url = `api/v3/games/matches${queryString ? `?${queryString}` : ''}`;
  return axios.get(url);
};

export const createMatchApi = async (data: IMatchData) =>
  axios.post('api/v3/games/matches', data);

export const updateMatchApi = async (id: string, data: Partial<IMatchData>) =>
  axios.put(`api/v3/games/matches/${id}`, data);

export const deleteMatchApi = async (id: string) =>
  axios.delete(`api/v3/games/matches/${id}`);

export const updateMatchResultApi = async (
  id: string,
  data: IMatchResultData
) => axios.put(`api/v3/games/matches/${id}/results`, data);

export const updateMatchEntriesApi = async (
  id: string,
  data: IMatchResultEntryData[]
) => axios.put(`api/v3/games/matches/${id}/entries`, data);

export const getMatchByIdApi = async (id: string) =>
  axios.get(`api/v3/games/matches/${id}`);

export const getMatchParticipantsApi = async (
  id: string,
  params?: { page?: number; limit?: number; search?: string }
) => {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  if (params?.search) queryParams.append('search', params.search);

  const queryString = queryParams.toString();
  const url = `api/v3/games/matches/${id}/participants${queryString ? `?${queryString}` : ''}`;
  return axios.get(url);
};

export const getParticipantsHistoryApi = async (params?: {
  page?: number;
  limit?: number;
  search?: string;
  startDate?: string;
  endDate?: string;
}) => {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  if (params?.search) queryParams.append('search', params.search);
  if (params?.startDate) queryParams.append('startDate', params.startDate);
  if (params?.endDate) queryParams.append('endDate', params.endDate);

  const queryString = queryParams.toString();
  const url = `api/v3/games/participants-history${queryString ? `?${queryString}` : ''}`;
  return axios.get(url);
};

export const distributeMatchWinningsApi = async (id: string) =>
  axios.post(`api/v3/games/matches/${id}/distribute-winnings`);

export const refundMatchEntriesApi = async (id: string) =>
  axios.post(`api/v3/games/matches/${id}/refund`);


