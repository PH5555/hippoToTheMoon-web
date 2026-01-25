declare namespace Kakao {
  function init(appKey: string): void;
  function isInitialized(): boolean;

  namespace Auth {
    interface AuthSuccessResponse {
      access_token: string;
      token_type: string;
      refresh_token: string;
      expires_in: number;
      scope: string;
      refresh_token_expires_in: number;
    }

    interface AuthFailResponse {
      error: string;
      error_description: string;
    }

    interface LoginOptions {
      success?: (response: AuthSuccessResponse) => void;
      fail?: (error: AuthFailResponse) => void;
      always?: () => void;
      scope?: string;
      throughTalk?: boolean;
    }

    function login(options?: LoginOptions): void;
    function logout(callback?: () => void): void;
    function getAccessToken(): string | null;
    function setAccessToken(token: string): void;
  }
}

interface Window {
  Kakao: typeof Kakao;
}
