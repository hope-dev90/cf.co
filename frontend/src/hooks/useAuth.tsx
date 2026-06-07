import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
import { authApi } from "../lib/api";

type Role = "client" | "restaurateur" | "admin";
type SignupRole = "client" | "restaurant_owner"; // For frontend UI

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
  signIn: (email: string, password: string) => Promise<Profile>;
  signUp: (
    email: string,
    password: string,
    fullName: string,
    role: SignupRole,
    restaurantData?: Record<string, unknown>,
  ) => Promise<{ message: string }>;
  signOut: () => void;
  logout: () => void; // Alias for signOut to maintain compatibility
  googleSignIn: (credential: string, role?: SignupRole) => Promise<Profile>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  token: null,
  loading: false,
  signIn: async () => ({ id: "", email: "", name: "", role: "client" }),
  signUp: async () => ({ message: "" }),
  signOut: () => {},
  logout: () => {},
  googleSignIn: async () => ({ id: "", email: "", name: "", role: "client" }),
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<{ id: string; email: string } | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Check for existing token in local storage on mount
  useEffect(() => {
    const savedToken = localStorage.getItem("auth_token");
    const savedProfile = localStorage.getItem("auth_profile");
    if (savedToken && savedProfile) {
      const parsedProfile = JSON.parse(savedProfile) as Profile;
      setToken(savedToken);
      setProfile(parsedProfile);
      setUser({
        id: parsedProfile.id,
        email: parsedProfile.email,
      });
    }
    setLoading(false);
  }, []);

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      const data = await authApi.login(email, password);

      const token = data.token as string;
      const userProfile = {
        id: data.user.id,
        email: data.user.email,
        name: data.user.name,
        role: data.user.role as Role,
      };

      localStorage.setItem("auth_token", token);
      localStorage.setItem("auth_profile", JSON.stringify(userProfile));

      setToken(token);
      setProfile(userProfile);
      setUser({ id: userProfile.id, email: userProfile.email });
      return userProfile;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (
    email: string,
    password: string,
    fullName: string,
    role: SignupRole,
    restaurantData?: Record<string, unknown>,
  ) => {
    setLoading(true);
    try {
      // Map roles to backend roles
      const backendRole = role === "restaurant_owner" ? "restaurateur" : role;

      const data = await authApi.register(
        fullName,
        email,
        password,
        backendRole,
        restaurantData,
      );

      return { message: data.message || "" };
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_profile");
    setToken(null);
    setUser(null);
    setProfile(null);
  };

  const googleSignIn = async (credential: string, role?: SignupRole) => {
    setLoading(true);
    try {
      const data = await authApi.googleLogin(credential, role);

      const token = data.token as string;
      const userProfile = {
        id: data.user.id,
        email: data.user.email,
        name: data.user.name,
        role: data.user.role as Role,
      };

      localStorage.setItem("auth_token", token);
      localStorage.setItem("auth_profile", JSON.stringify(userProfile));

      setToken(token);
      setProfile(userProfile);
      setUser({ id: userProfile.id, email: userProfile.email });
      return userProfile;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        token,
        loading,
        signIn,
        signUp,
        signOut,
        logout: signOut,
        googleSignIn,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
