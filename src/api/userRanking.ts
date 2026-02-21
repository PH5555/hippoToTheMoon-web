import { publicApiClient } from './client';
import type { UserRankingData, UserRankingResponse } from '../types/userRanking';

/**
 * User ranking list
 * GET /api/v1/users/ranking
 */
export async function getUserRanking(): Promise<UserRankingData> {
  const response = await publicApiClient.get<UserRankingResponse>('/api/v1/users/ranking');
  const result = response.data;

  if (!response.status.toString().startsWith('2') || result.errorCode) {
    throw new Error(result.message || 'Failed to fetch user ranking');
  }

  return result.data;
}

const userRankingApi = {
  getUserRanking,
};

export default userRankingApi;
