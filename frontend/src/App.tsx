// frontend/src/App.tsx
import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import HomePage from './pages/HomePage';
import GameRoom from './pages/GameRoom';
import PlayerStatsPage from './pages/PlayerStatsPage';
import AdminDashboard from './pages/AdminDashboard';
import Preloader from './components/Preloader';
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
          <main>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/room/:roomId" element={<GameRoom />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/room/:roomId/stats" element={<PlayerStatsPage />} />
            </Routes>
          </main>
          <Toaster />
        </Router>
      </div>
    </>
  );
}

export default App;