import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useEffect, lazy, Suspense } from 'react';
import './i18n';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';

// 懒加载页面组件，按需加载，减少首屏体积
const HomePage = lazy(() => import('./pages/HomePage'));
const AuthPage = lazy(() => import('./pages/AuthPage'));
const MatchesPage = lazy(() => import('./pages/MatchesPage'));
const AnalysisPage = lazy(() => import('./pages/AnalysisPage'));
const PricingPage = lazy(() => import('./pages/PricingPage'));

function AppContent() {
  const { i18n } = useTranslation();

  // Arabic RTL support
  useEffect(() => {
    const isRTL = i18n.language === 'ar';
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
    document.documentElement.lang = i18n.language;
  }, [i18n.language]);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">
        <Suspense fallback={<div className="flex items-center justify-center min-h-[60vh] text-muted-foreground">加载中...</div>}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<AuthPage mode="login" />} />
            <Route path="/register" element={<AuthPage mode="register" />} />
            <Route path="/matches" element={<MatchesPage />} />
            <Route path="/analysis/:id" element={<AnalysisPage />} />
            <Route path="/pricing" element={<PricingPage />} />
          </Routes>
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;
