import { publicApiClient } from './client';
import type { UserRankingData, UserRankingResponse } from '../types/userRanking';

/**
 * User ranking list
 * GET /api/v1/users/ranking
 */
export async function getUserRanking(limit = 50): Promise<UserRankingData> {
  const response = await publicApiClient.get<UserRankingResponse>(
    `/api/v1/users/ranking?limit=${limit}`
  );
  return response.data.data;
}

const userRankingApi = {
  getUserRanking,
};

export default userRankingApi;
