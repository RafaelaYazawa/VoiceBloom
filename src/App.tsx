import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./components/layout/Layout";
import HomePage from "./pages/HomePage";
import RecordPage from "./pages/RecordPage";
import ProfilePage from "./pages/ProfilePage";
import CommunityPage from "./pages/CommunityPage";
import PrivateJournalPage from "./pages/PrivateJournalPage";
import AuthPage from "./pages/AuthPage";
import { Toaster } from "./components/ui/Toaster";
import { useStore } from "./store/store";

function App() {
  const { isAuthenticated, authenticateUser } = useStore();
  const handleLoginSuccess = (user: any, accessToken?: string) => {
    const token =
      accessToken || user?.access_token || user.session?.access_token;
    if (!token) {
      console.warn("No token found", user);
      return;
    }
    authenticateUser(user, token);
  };

  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route
            path="/auth"
            element={<AuthPage onLoginSuccess={handleLoginSuccess} />}
          />
          {isAuthenticated ? (
            <>
              <Route path="/record" element={<RecordPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/community" element={<CommunityPage />} />
              <Route path="/journal" element={<PrivateJournalPage />} />
            </>
          ) : (
            <Route
              path="*"
              element={<AuthPage onLoginSuccess={handleLoginSuccess} />}
            />
          )}
        </Routes>
      </Layout>
      <Toaster />
    </Router>
  );
}

export default App;
