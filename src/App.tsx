import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useEffect } from 'react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import './i18n';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import HomePage from './pages/HomePage';
import AuthPage from './pages/AuthPage';
import MatchesPage from './pages/MatchesPage';
import AnalysisPage from './pages/AnalysisPage';
import PricingPage from './pages/PricingPage';

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
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<AuthPage mode="login" />} />
          <Route path="/register" element={<AuthPage mode="register" />} />
          <Route path="/matches" element={<MatchesPage />} />
          <Route path="/analysis/:id" element={<AnalysisPage />} />
          <Route path="/pricing" element={<PricingPage />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
      <SpeedInsights />
    </BrowserRouter>
  );
}

export default App;
