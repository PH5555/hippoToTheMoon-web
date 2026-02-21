import type { ApiResponse } from './auth';

export interface UserRankingItem {
  rank: number;
  userName: string;
  totalAsset: number;
  profitLoss: number;
  profitRate: string;
}

export interface UserRankingData {
  snapshotAt: string | null;
  items: UserRankingItem[];
}

export type UserRankingResponse = ApiResponse<UserRankingData>;
