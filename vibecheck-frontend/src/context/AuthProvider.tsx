import { createContext, useState, useContext } from 'react';
import { User } from '../types/user';

const AuthContext = createContext<{
  isAuthenticated: boolean;
  user: User | null;
  signIn: (username: string) => Promise<boolean>;
  signOut: () => void;
}>({
  isAuthenticated: false,
  user: null,
  signIn: async () => false,
  signOut: () => {}
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  const signIn = async (username: string) => {
    try {
      // Mock API call - replace with actual API call to your .NET backend
      // const response = await fetch('api/auth/login', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ username })
      // });
      // const userData = await response.json();
      
      // For now, using mock data
      const userData: User = {
        id: 'user-' + Math.random().toString(36).substr(2, 9),
        username: username,
        avatar: "/avatars/1.png" // Corrected path
      };
      
      setUser(userData);
      setIsAuthenticated(true);
      return true;
    } catch (error) {
      console.error("Sign in failed:", error);
      return false;
    }
  };

  const signOut = () => {
    setIsAuthenticated(false);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}