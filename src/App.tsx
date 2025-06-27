import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Layout from "./components/layout/Layout";
import HomePage from "./pages/HomePage";
import RecordPage from "./pages/RecordPage";
import ProfilePage from "./pages/ProfilePage";
import CommunityPage from "./pages/CommunityPage";
import PrivateJournalPage from "./pages/PrivateJournalPage";
import AuthPage from "./pages/AuthPage";
import { Toaster } from "./components/ui/Toaster";
import { AuthProvider, useAuth } from "./store/AuthContext";

function App() {
  const { user, loading: authLoading } = useAuth();

  const handleLoginSuccess = () => {
    console.log(
      "Login/Signup attempt completed. AuthContext will update session."
    );
  };

  if (authLoading) {
    return (
      <div className="flex justify-center items-center h-screen text-lg text-gray-600">
        Loading application authentication...
      </div>
    );
  }

  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route
            path="/auth"
            element={
              user ? (
                <Navigate to="/record" replace />
              ) : (
                <AuthPage onLoginSuccess={handleLoginSuccess} />
              )
            }
          />
          {user ? (
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
