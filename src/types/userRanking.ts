import type { ApiResponse } from './auth';

export interface UserRankingEntry {
  rank: number;
  nickname: string;
  totalAsset: number;
  profitLoss: number;
  returnRate: number;
}

export interface UserRankingData {
  rankings: UserRankingEntry[];
  snapshotAt: string | null;
}

export type UserRankingResponse = ApiResponse<UserRankingData>;
