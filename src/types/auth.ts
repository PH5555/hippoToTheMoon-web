export type SocialType = 'KAKAO' | 'GOOGLE';

export interface SignInRequest {
  socialType: SocialType;
  token: string;
}

// RefreshTokenRequest - 제거됨 (쿠키 기반 인증으로 body 전송 불필요)
// SignInResponse - 제거됨 (토큰이 Set-Cookie 헤더로 전달됨)

export interface ApiResponse<T> {
  timestamp: number;
  data: T;
  errorCode: string | null;
  message: string;
}

export interface User {
  id: number;
  authId: string;
  socialType: SocialType;
  nickname?: string;
}
