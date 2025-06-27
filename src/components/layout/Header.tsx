import React from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { Mic, Menu, X, User, LogOut } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../store/AuthContext";

const Header: React.FC = () => {
  const { user, loading: authLoading, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const navigate = useNavigate();

  const isAuthenticated = !!user;

  const handleLogout = async () => {
    if (signOut) {
      await signOut();
      setMobileMenuOpen(false);
      navigate("/auth");
    } else {
      console.warn("signOut function not available in AuthContext.");
    }
  };

  return (
    <header className="bg-white border-b sticky top-0 z-40">
      <div className="container mx-auto px-4 flex justify-between items-center h-16">
        <Link
          to="/"
          className="flex items-center space-x-2 text-primary font-medium text-xl"
        >
          <Mic className="h-6 w-6" />
          <span>VoiceBloom</span>
        </Link>

        {/* Desktop Menu */}
        <nav className="hidden lg:flex items-center space-x-8">
          {isAuthenticated ? (
            <>
              <Link
                to="/record"
                className="text-foreground hover:text-primary transition-colors lg:hidden"
              >
                Practice
              </Link>
              <Link
                to="/community"
                className="text-foreground hover:text-primary transition-colors lg:hidden"
              >
                Community
              </Link>
              <Link
                to="/journal"
                className="text-foreground hover:text-primary transition-colors lg:hidden"
              >
                Journal
              </Link>
              <Link
                to="/profile"
                className="text-foreground hover:text-primary transition-colors lg:hidden"
              >
                Profile
              </Link>
              <button
                onClick={handleLogout}
                className="text-foreground hover:text-primary transition-colors flex items-center"
              >
                <LogOut className="h-4 w-4 mr-1" />
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/auth" className="btn-outline">
                Sign In
              </Link>
              <Link to="/auth?register=true" className="btn-primary">
                Get Started
              </Link>
            </>
          )}
        </nav>

        {/* Mobile Menu Button */}
        <button
          className="lg:hidden text-foreground p-2"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden border-t"
          >
            <nav className="flex flex-col py-4 px-4 bg-white">
              {isAuthenticated ? (
                <>
                  <div className="flex items-center space-x-2 px-4 py-2 mb-2">
                    <div className="bg-primary text-white rounded-full h-8 w-8 flex items-center justify-center">
                      <User className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{user?.username}</p>
                      <p className="text-xs text-muted-foreground">
                        {user?.email}
                      </p>
                    </div>
                  </div>
                  <Link
                    to="/record"
                    className="px-4 py-2 hover:bg-muted rounded-md"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Practice
                  </Link>
                  <Link
                    to="/community"
                    className="px-4 py-2 hover:bg-muted rounded-md"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Community
                  </Link>
                  <Link
                    to="/journal"
                    className="px-4 py-2 hover:bg-muted rounded-md"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Journal
                  </Link>
                  <Link
                    to="/profile"
                    className="px-4 py-2 hover:bg-muted rounded-md"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Profile
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="flex items-center px-4 py-2 hover:bg-muted rounded-md text-left"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/auth"
                    className="px-4 py-2 hover:bg-muted rounded-md"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/auth?register=true"
                    className="px-4 py-2 bg-primary text-white rounded-md mt-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Get Started
                  </Link>
                </>
              )}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;
