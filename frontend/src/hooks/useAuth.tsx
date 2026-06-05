import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { authApi } from '../lib/api';

type Role = 'client' | 'restaurateur' | 'admin';

interface Profile {
  id: string;
  email: string;
  name: string;
  role: Role;
}

interface AuthContextType {
  user: { id: string; email: string } | null;
  profile: Profile | null;
  token: string | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string, role: Role) => Promise<void>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  token: null,
  loading: false,
  signIn: async () => {},
  signUp: async () => {},
  signOut: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<{ id: string; email: string } | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Check for existing token in local storage on mount
  useEffect(() => {
    const savedToken = localStorage.getItem('auth_token');
    const savedProfile = localStorage.getItem('auth_profile');
    if (savedToken && savedProfile) {
      setToken(savedToken);
      setProfile(JSON.parse(savedProfile));
      setUser({
        id: JSON.parse(savedProfile).id,
        email: JSON.parse(savedProfile).email,
      });
    }
    setLoading(false);
  }, []);

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      const data = await authApi.login(email, password);
      
      const token = data.token;
      const userProfile = {
        id: data.user.id,
        email: data.user.email,
        name: data.user.name,
        role: data.user.role as Role,
      };
      
      localStorage.setItem('auth_token', token);
      localStorage.setItem('auth_profile', JSON.stringify(userProfile));
      
      setToken(token);
      setProfile(userProfile);
      setUser({ id: userProfile.id, email: userProfile.email });
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, fullName: string, role: Role) => {
    setLoading(true);
    try {
      // Map roles to backend roles
      const backendRole = role === 'restaurant_owner' ? 'restaurateur' : role;
      
      await authApi.register(fullName, email, password, backendRole);
      
      // After registration, user needs to verify email, so don't sign in automatically
      // Instead, just let them know to check email
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_profile');
    setToken(null);
    setUser(null);
    setProfile(null);
  };

  return (
    <AuthContext.Provider value={{ user, profile, token, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
