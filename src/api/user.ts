import { apiClient } from './client';
import type {
  UserInfo,
  UserInfoResponse,
  UpdateNicknameRequest,
  UpdateNicknameResponse,
  WithdrawResponse,
} from '../types/user';

/**
 * 유저 정보 조회
 * GET /api/v1/users/me
 */
export async function getMe(): Promise<UserInfo> {
  const response = await apiClient.get<UserInfoResponse>('/api/v1/users/me');
  return response.data.data;
}

/**
 * 닉네임 수정
 * PATCH /api/v1/users/nickname
 */
export async function updateNickname(nickname: string): Promise<void> {
  const request: UpdateNicknameRequest = { nickname };
  await apiClient.patch<UpdateNicknameResponse>('/api/v1/users/nickname', request);
}

/**
 * 회원 탈퇴
 * DELETE /api/v1/users
 */
export async function withdrawUser(): Promise<void> {
  await apiClient.delete<WithdrawResponse>('/api/v1/users');
}

const userApi = {
  getMe,
  updateNickname,
  withdrawUser,
};

export default userApi;
