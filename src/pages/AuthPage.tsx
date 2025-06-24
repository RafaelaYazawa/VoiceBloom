import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Mic, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { motion } from "framer-motion";
import { useStore } from "../store/store";
import supabase from "../utils/supabaseClient";
import { signUp } from "../utils/api";
import Button from "../components/ui/Button";

type Props = { onLoginSuccess: (user: any, token?: string) => void };

const AuthPage: React.FC<Props> = ({ onLoginSuccess }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const addToast = useStore((state) => state.addToast);

  const [isRegistering, setIsRegistering] = useState(
    new URLSearchParams(location.search).get("register") === "true"
  );
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const isRegister =
      new URLSearchParams(location.search).get("register") === "true";
    setIsRegistering(isRegister);
  }, [location.search]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    console.log("form submitted");

    if (isRegistering && password !== confirmPassword) {
      setError("Passwords do not match");
      addToast({
        title: "Passwords do not match",
        type: "error",
      });
      return;
    }

    try {
      if (isRegistering) {
        const data = await signUp(email, password);
        if (data.user) {
          console.log("Sign up successfully", data.user);
          onLoginSuccess(data.user);

          console.log("Full data response:", data);
          console.log("User:", data.user);
          console.log("Token:", data.session?.access_token);

          addToast({
            title: "Signed up successfuly",
            description: "Please verify your email",
            type: "success",
          });
          navigate("/signup");
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        if (data.session && data.user) {
          const token = data.session.access_token;
          console.log("Logged in successfully", data.user);
          console.log("Logged in successfully", data.session);
          onLoginSuccess(data.user, token);
          navigate("/record");
          console.log("Navigated!");
        }
      }
    } catch (err: any) {
      setError(err.message || "Authentication failed");
      addToast({
        title: err.message || "Authentication failed",
        type: "error",
      });
    }
  };

  // Demo authentication - in a real app, this would make API calls
  const toggleAuthMode = () => {
    setIsRegistering(!isRegistering);
    // Update URL without full page reload
    const newSearch = isRegistering ? "" : "?register=true";
    navigate({ search: newSearch }, { replace: true });
  };

  return (
    <div className="max-w-md mx-auto py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white p-8 rounded-lg shadow-sm border"
      >
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-primary/10 text-primary mb-4">
            <Mic className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-semibold">
            {isRegistering ? "Create Your Account" : "Welcome Back"}
          </h1>
          <p className="text-muted-foreground mt-2">
            {isRegistering
              ? "Join VoiceBloom and start building your speaking confidence"
              : "Sign in to continue your speaking practice"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="pl-10 w-full rounded-md border border-input py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="your.email@example.com"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium mb-1"
            >
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="pl-10 w-full rounded-md border border-input py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="••••••••"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Eye className="h-4 w-4 text-muted-foreground" />
                )}
              </button>
            </div>
          </div>

          {isRegistering && (
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium mb-1"
              >
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  id="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="pl-10 w-full rounded-md border border-input py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="••••••••"
                />
              </div>
            </div>
          )}

          <button type="submit" className="btn-primary w-full">
            {isRegistering ? "Create Account" : "Sign In"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">
            {isRegistering
              ? "Already have an account?"
              : "Don't have an account?"}{" "}
            <button
              type="button"
              onClick={toggleAuthMode}
              className="text-primary hover:underline font-medium"
            >
              {isRegistering ? "Sign In" : "Sign Up"}
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default AuthPage;
