import { createContext, useState, useContext } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  const signIn = async (username) => {
    try {
      // Mock API call - replace with actual API call to your .NET backend
      // const response = await fetch('api/auth/login', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ username })
      // });
      // const userData = await response.json();
      
      // For now, using mock data
      const userData = {
        id: 'user-' + Math.random().toString(36).substr(2, 9),
        username: "razvan golan",
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