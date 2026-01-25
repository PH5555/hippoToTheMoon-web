import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuthStore } from './store/authStore';
import HomePage from './screen/HomePage';
import LoginPage from './screen/LoginPage';
import StockRankingPage from './screen/StockRankingPage';
import StockExplorePage from './screen/StockExplorePage';
import PortfolioPage from './screen/PortfolioPage';
import MyPage from './screen/MyPage';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

function AppContent() {
  const { initialize, isLoading } = useAuthStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <div className="text-center">
          <span className="text-6xl animate-bounce block mb-4">🦛</span>
          <p className="text-text-secondary">로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/ranking" element={<StockRankingPage />} />
      <Route path="/explore" element={<StockExplorePage />} />
      <Route path="/portfolio" element={<PortfolioPage />} />
      <Route path="/mypage" element={<MyPage />} />
    </Routes>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
