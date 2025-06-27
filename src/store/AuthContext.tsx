import React from "react";
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import supabase from "../utils/supabaseClient";
import { User as SupabaseUser } from "@supabase/supabase-js";

interface User extends SupabaseUser {
  username?: string;
  location?: string;
}

interface AuthContextType {
  user: User | null;
  session: any | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  const isMounted = React.useRef(true);
  const initialLoadHandled = React.useRef(false);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const signOut = useCallback(async () => {
    console.log("Attempting to sign out...");
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.log("Error signing out:", error.message);
    } else {
      console.log("Successfully signed out");
    }
  }, []);

  useEffect(() => {
    let unsubscribeAuthListener: (() => void) | undefined;

    const handleAuthStateChange = (
      event: string,
      currentSession: any | null
    ) => {
      console.log("Auth Event from Listener:", event);
      console.log("Current Session from Listener:", currentSession);

      if (!isMounted.current) return;

      if (currentSession) {
        setSession(currentSession);
        setUser(currentSession.user as User);
      } else {
        setSession(null);
        setUser(null);
      }

      if (!initialLoadHandled.current) {
        setLoading(false);
        initialLoadHandled.current = true;
        console.log(
          "AuthProvider: Initial auth state determined. Loading set to false."
        );
      }
    };

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(handleAuthStateChange);
    unsubscribeAuthListener = subscription?.unsubscribe;
    console.log("Auth context listener set up.");

    const timeoutId = setTimeout(() => {
      if (!initialLoadHandled.current && isMounted.current) {
        setLoading(false);
        initialLoadHandled.current = true;
        console.warn(
          "AuthContext: Initial session check timed out, setting loading to false."
        );
      }
    }, 5000);

    return () => {
      clearTimeout(timeoutId);
      if (unsubscribeAuthListener) {
        unsubscribeAuthListener();
        console.log("Auth Listener Unsubscribed.");
      }
    };
  }, []);

  const value = { user, session, loading, signOut };

  if (loading) {
    return <div>Loading authentication...</div>;
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
