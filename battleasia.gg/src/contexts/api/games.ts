import axios from 'src/lib/axios';

export const getGamesApi = () => axios.get('api/v2/games');

export const getMatchesApi = (gameId?: string) => {
  const query = new URLSearchParams();
  if (gameId) {
    query.append('gameId', gameId);
  }
  const queryString = query.toString();
  const endpoint = queryString ? `api/v2/games/matches?${queryString}` : 'api/v2/games/matches';
  return axios.get(endpoint);
};

export const getMatchDetailApi = (id: string) => axios.get(`api/v2/games/matches/${id}`);

export const getMatchResultApi = (id: string) => axios.get(`api/v2/games/matches/${id}/result`);

export const joinMatchApi = (matchId: string) => axios.post(`api/v2/games/matches/${matchId}/join`);

export const checkMatchJoinApi = (matchId: string) => axios.post(`api/v2/games/matches/${matchId}/check-join`);

export const getMatchHistoryApi = () => axios.get('api/v2/games/matches/history/me');

export const getUserMatchHistoryApi = (userId: string) => axios.get(`api/v2/games/matches/history/user/${userId}`);


