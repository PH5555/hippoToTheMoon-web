import type { ApiResponse } from './auth';

// 소셜 로그인 유형
export type AuthType = 'KAKAO' | 'GOOGLE';

// 유저 정보
export interface UserInfo {
  id: string;
  nickname: string;
  balance: number;
  authType: AuthType;
}

// 닉네임 수정 요청
export interface UpdateNicknameRequest {
  nickname: string;
}

// API 응답 타입들
export type UserInfoResponse = ApiResponse<UserInfo>;
export type UpdateNicknameResponse = ApiResponse<null>;
export type WithdrawResponse = ApiResponse<null>;

// 에러 코드 타입
export type UserErrorCode =
  | 'HIP001-400'  // 유효성 검사 실패
  | 'HIP001-401'  // 인증 실패
  | 'HIP002-404'  // 사용자를 찾을 수 없음
  | 'HIP001-409'; // 닉네임 중복

// 에러 메시지 매핑
export const USER_ERROR_MESSAGES: Record<UserErrorCode, string> = {
  'HIP001-400': '입력값을 확인해주세요.',
  'HIP001-401': '로그인이 필요합니다. 다시 로그인해주세요.',
  'HIP002-404': '사용자 정보를 찾을 수 없습니다. 다시 로그인해주세요.',
  'HIP001-409': '이미 사용 중인 닉네임입니다.',
};

// 에러 메시지 조회 유틸리티
export function getUserErrorMessage(errorCode: string | null): string {
  if (!errorCode) return '알 수 없는 오류가 발생했습니다.';
  return USER_ERROR_MESSAGES[errorCode as UserErrorCode] || '오류가 발생했습니다.';
}
