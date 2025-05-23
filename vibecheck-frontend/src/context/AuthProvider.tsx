import { createContext, useState, useContext, useEffect } from 'react';
import { User } from '../types/user';
import { LoginResponse } from '../types/auth';
import { isTokenExpired } from '../utils/jwtUtils';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

const AuthContext = createContext<{
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  loading: boolean;
  signIn: (username: string) => Promise<boolean>;
  signOut: () => void;
}>({
  isAuthenticated: false,
  user: null,
  token: null,
  loading: true,
  signIn: async () => false,
  signOut: () => {}
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const signIn = async (username: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/Users/Login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username })
      });
      
      if (!response.ok) {
        throw new Error('Login failed');
      }
      
      const data: LoginResponse = await response.json();
      
      const userData: User = {
        id: data.user.userId,
        username: data.user.username,
        avatar: "/avatars/1.png"
      };
      
      localStorage.setItem('auth_token', data.token);
      localStorage.setItem('auth_user', JSON.stringify(userData));
      
      setToken(data.token);
      setUser(userData);
      setIsAuthenticated(true);
      return true;
    } catch (error) {
      console.error("Sign in failed:", error);
      return false;
    }
  };

  const signOut = async () => {    
    if (user?.id && token) {
      try {
        const response = await fetch(`${API_BASE_URL}/api/Users/Logout`, {
          method: 'POST',
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json' 
          },
          body: JSON.stringify(user?.id)
        });
  
        if (!response.ok) {
          console.error("Logout API failed:", response.statusText);
        }
      }
      catch (error) {
        console.error("Sign out API call failed:", error);
      }
    }
    
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    setToken(null);
    setIsAuthenticated(false);
    setUser(null);
  };

  // Initialize auth state on mount/reload
  useEffect(() => {
    const initializeAuth = () => {
      const storedToken = localStorage.getItem('auth_token');
      const storedUser = localStorage.getItem('auth_user');
      
      if (storedToken && storedUser) {
        try {
          const userData = JSON.parse(storedUser);
          
          if (isTokenExpired(storedToken)) {            
            if (userData?.id) {
              fetch(`${API_BASE_URL}/api/Users/Logout`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData.id)
              }).catch(err => {
                console.error("Logout API failed during token expiration:", err);
              });
            }
            
            localStorage.removeItem('auth_token');
            localStorage.removeItem('auth_user');
            setToken(null);
            setIsAuthenticated(false);
            setUser(null);
          } else {
            setToken(storedToken);
            setUser(userData);
            setIsAuthenticated(true);
          }
        } catch (err) {
          console.error("Error processing stored auth data:", err);
          localStorage.removeItem('auth_token');
          localStorage.removeItem('auth_user');
          setToken(null);
          setIsAuthenticated(false);
          setUser(null);
        }
      } else {
        setToken(null);
        setIsAuthenticated(false); 
        setUser(null);
      }
      
      setLoading(false);
    };
    
    initializeAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ 
      isAuthenticated, 
      user, 
      token, 
      loading, 
      signIn, 
      signOut,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}