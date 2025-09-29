// frontend/src/App.tsx
import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import HomePage from './pages/HomePage';
import GameRoom from './pages/GameRoom';
import PlayerStatsPage from './pages/PlayerStatsPage';
import AdminDashboard from './pages/AdminDashboard';
import Preloader from './components/Preloader';
import HeaderLayout from './components/ui/HeaderLayout';
import { Toaster } from './components/ui/toaster';
import { useThemeStore } from './hooks/useTheme';
import './App.css'; 

function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    useThemeStore.getState().setTheme(
      (localStorage.getItem('theme') as 'light' | 'dark') || 'dark'
    );
  }, []);

  if (loading) {
    return <Preloader onFinished={() => setLoading(false)} visibleDuration={3000} />
  }

  return (
    <>
      {loading && <Preloader onFinished={() => setLoading(false)} />}

      <div
        className={`transition-opacity duration-500 ${
          loading ? 'opacity-0' : 'opacity-100'
        }`}
      >
        <Router>
          <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200 transition-colors duration-300">
            <Routes>
              <Route path="/" element={
                <HeaderLayout>
                  <HomePage />
                </HeaderLayout>
              } />
              <Route path="/room/:roomId" element={
                <HeaderLayout>
                  <GameRoom />
                </HeaderLayout>
              } />
              <Route path="/admin" element={
                <HeaderLayout>
                  <AdminDashboard />
                </HeaderLayout>
              } />
              <Route path="/room/:roomId/stats" element={
                <HeaderLayout>
                  <PlayerStatsPage />
                </HeaderLayout>
              } />
            </Routes>
          </div>
          <Toaster />
        </Router>
      </div>
    </>
  );
}

export default App;