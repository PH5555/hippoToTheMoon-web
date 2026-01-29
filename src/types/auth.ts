export type SocialType = 'KAKAO' | 'GOOGLE';

export interface SignInRequest {
  socialType: SocialType;
  token: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface SignInResponse {
  accessToken: string;
  refreshToken: string;
}

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
