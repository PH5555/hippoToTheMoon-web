import { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { useAuthStore } from '../store/authStore';
import authApi from '../api/auth';
import type { SocialType } from '../types/auth';

const KAKAO_REST_API_KEY = import.meta.env.VITE_KAKAO_REST_API_KEY;
const KAKAO_CLIENT_SECRET = import.meta.env.VITE_KAKAO_CLIENT_SECRET;
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const REDIRECT_URI = `${window.location.origin}/login`;

export default function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isAuthenticated, login, setLoading } = useAuthStore();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Ref to prevent double execution in React StrictMode
  const isProcessingRef = useRef(false);

  // Get redirect URL from query params and save to sessionStorage
  const redirectUrl = searchParams.get('redirect') || '/';
  
  // 로그인 페이지 진입 시 redirect URL을 sessionStorage에 저장
  useEffect(() => {
    if (redirectUrl && redirectUrl !== '/') {
      sessionStorage.setItem('loginRedirect', redirectUrl);
    }
  }, [redirectUrl]);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const savedRedirect = sessionStorage.getItem('loginRedirect') || redirectUrl;
      sessionStorage.removeItem('loginRedirect');
      navigate(savedRedirect);
    }
  }, [isAuthenticated, navigate, redirectUrl]);

  // Handle OAuth callbacks
  useEffect(() => {
    // Prevent double execution (React StrictMode)
    if (isProcessingRef.current) {
      return;
    }

    // Google OAuth - implicit flow (token in hash)
    const hash = window.location.hash;
    if (hash) {
      const hashParams = new URLSearchParams(hash.substring(1));
      const accessToken = hashParams.get('access_token');
      const state = hashParams.get('state');

      if (accessToken && state === 'GOOGLE') {
        isProcessingRef.current = true;
        window.history.replaceState(null, '', window.location.pathname);
        handleSocialLogin(accessToken, 'GOOGLE');
        return;
      }
    }

    // Kakao OAuth - authorization code flow
    const code = searchParams.get('code');
    const state = searchParams.get('state');

    if (code && state === 'KAKAO') {
      isProcessingRef.current = true;
      // Clear URL params immediately to prevent re-processing
      window.history.replaceState(null, '', window.location.pathname);
      exchangeKakaoCodeForToken(code);
    }
  }, [searchParams]);

  const exchangeKakaoCodeForToken = async (code: string) => {
    setIsProcessing(true);
    setError(null);

    try {
      // Exchange authorization code for access token
      const tokenResponse = await fetch('https://kauth.kakao.com/oauth/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
        },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          client_id: KAKAO_REST_API_KEY,
          client_secret: KAKAO_CLIENT_SECRET,
          redirect_uri: REDIRECT_URI,
          code: code,
        }),
      });

      if (!tokenResponse.ok) {
        const errorData = await tokenResponse.json();
        throw new Error(errorData.error_description || 'Failed to get access token');
      }

      const tokenData = await tokenResponse.json();
      const accessToken = tokenData.access_token;

      // Now send the access token to our backend
      await handleSocialLogin(accessToken, 'KAKAO');
    } catch (err) {
      console.error('Kakao token exchange failed:', err);
      setError('카카오 로그인에 실패했습니다. 다시 시도해주세요.');
      setIsProcessing(false);
    }
  };

  const handleSocialLogin = useCallback(async (accessToken: string, socialType: SocialType) => {
    setIsProcessing(true);
    setError(null);

    try {
      await authApi.signIn({
        socialType,
        token: accessToken,
      });
      // 토큰은 Set-Cookie 헤더로 자동 설정됨

      // login() 호출 후 isAuthenticated가 true가 되면
      // useEffect에서 자동으로 redirect 처리됨
      login();
    } catch (err) {
      console.error('Login failed:', err);
      setError('로그인에 실패했습니다. 다시 시도해주세요.');
      setLoading(false);
    } finally {
      setIsProcessing(false);
    }
  }, [login, setLoading]);

  const handleKakaoLogin = () => {
    if (!KAKAO_REST_API_KEY) {
      setError('카카오 REST API 키가 설정되지 않았습니다.');
      return;
    }

    // Kakao OAuth 2.0 Authorization Code Flow
    const kakaoAuthUrl = new URL('https://kauth.kakao.com/oauth/authorize');
    kakaoAuthUrl.searchParams.set('client_id', KAKAO_REST_API_KEY);
    kakaoAuthUrl.searchParams.set('redirect_uri', REDIRECT_URI);
    kakaoAuthUrl.searchParams.set('response_type', 'code');
    kakaoAuthUrl.searchParams.set('state', 'KAKAO');

    window.location.href = kakaoAuthUrl.toString();
  };

  const handleGoogleLogin = () => {
    if (!GOOGLE_CLIENT_ID) {
      setError('구글 클라이언트 ID가 설정되지 않았습니다.');
      return;
    }

    // Google OAuth 2.0 Implicit Grant Flow
    const googleAuthUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
    googleAuthUrl.searchParams.set('client_id', GOOGLE_CLIENT_ID);
    googleAuthUrl.searchParams.set('redirect_uri', REDIRECT_URI);
    googleAuthUrl.searchParams.set('response_type', 'token');
    googleAuthUrl.searchParams.set('scope', 'openid email profile');
    googleAuthUrl.searchParams.set('state', 'GOOGLE');

    window.location.href = googleAuthUrl.toString();
  };

  return (
    <div className="min-h-screen bg-bg-primary flex flex-col">
      {/* Noise overlay */}
      <div className="noise-overlay" />

      {/* Header */}
      <header className="p-4">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          <span>뒤로가기</span>
        </button>
      </header>

      {/* Main content */}
      <main className="flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          {/* Login card */}
          <div className="card-brutal p-8 rounded-lg">
            {/* Logo */}
            <div className="text-center mb-8">
              <span className="text-5xl mb-4 block">🦛</span>
              <h1 className="font-display text-3xl text-lime mb-2">
                떡상하마
              </h1>
              <p className="text-text-secondary">
                로그인하고 모의 투자를 시작하세요
              </p>
            </div>

            {/* Error message */}
            {error && (
              <div className="mb-6 p-4 bg-magenta/10 border-2 border-magenta rounded-lg">
                <p className="text-magenta text-sm text-center">{error}</p>
              </div>
            )}

            {/* Social login buttons */}
            <div className="space-y-4">
              <Button
                variant="kakao"
                size="lg"
                className="w-full"
                onClick={handleKakaoLogin}
                disabled={isProcessing}
                isLoading={isProcessing}
              >
                <svg
                  className="w-5 h-5 mr-2"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12 3C6.48 3 2 6.58 2 11c0 2.8 1.86 5.26 4.64 6.67-.2.75-.73 2.72-.84 3.14-.13.52.19.51.4.37.17-.11 2.62-1.77 3.69-2.49.7.1 1.41.15 2.11.15 5.52 0 10-3.58 10-8 0-4.42-4.48-8-10-8z" />
                </svg>
                카카오로 계속하기
              </Button>

              <Button
                variant="google"
                size="lg"
                className="w-full"
                onClick={handleGoogleLogin}
                disabled={isProcessing}
                isLoading={isProcessing}
              >
                <svg
                  className="w-5 h-5 mr-2"
                  viewBox="0 0 24 24"
                >
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                구글로 계속하기
              </Button>
            </div>

            {/* Divider */}
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-bg-card text-text-muted">
                  간편하게 시작하세요
                </span>
              </div>
            </div>

            {/* Info */}
            <p className="text-text-muted text-xs text-center">
              로그인 시{' '}
              <a href="#" className="text-lime hover:underline">
                이용약관
              </a>{' '}
              및{' '}
              <a href="#" className="text-lime hover:underline">
                개인정보처리방침
              </a>
              에 동의하게 됩니다.
            </p>
          </div>
        </div>
      </main>

      {/* Background gradient */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-lime/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-magenta/5 rounded-full blur-3xl" />
      </div>
    </div>
  );
}
