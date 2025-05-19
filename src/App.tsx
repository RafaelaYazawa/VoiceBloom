import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import HomePage from './pages/HomePage';
import RecordPage from './pages/RecordPage';
import ProfilePage from './pages/ProfilePage';
import CommunityPage from './pages/CommunityPage';
import PrivateJournalPage from './pages/PrivateJournalPage';
import AuthPage from './pages/AuthPage';
import { Toaster } from './components/ui/Toaster';
import { useStore } from './store/store';

function App() {
  const { isAuthenticated } = useStore();

  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/auth" element={<AuthPage />} />
          {isAuthenticated ? (
            <>
              <Route path="/record" element={<RecordPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/community" element={<CommunityPage />} />
              <Route path="/journal" element={<PrivateJournalPage />} />
            </>
          ) : (
            <Route path="*" element={<AuthPage />} />
          )}
        </Routes>
      </Layout>
      <Toaster />
    </Router>
  );
}

export default App;