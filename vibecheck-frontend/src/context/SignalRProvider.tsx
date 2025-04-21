import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import * as signalR from "@microsoft/signalr";
import { useAuth } from './AuthProvider';

interface SignalRContextType {
  connection: signalR.HubConnection | null;
  isConnected: boolean;
  connecting: boolean;
  error: string | null;
  joinGameGroup: (gameCode: string) => Promise<boolean>;
  leaveGameGroup: (gameCode: string) => Promise<boolean>;
  connectToHub: () => Promise<void>;  // Added manual connection method
  onPlayerJoined: (callback: (participants: any[]) => void) => void;
  onPlayerLeft: (callback: (participants: any[]) => void) => void;
  onGameStateChanged: (callback: (gameStatus: string) => void) => void;
  onRoundStarted: (callback: (roundNumber: number, theme: string) => void) => void;
}

const SignalRContext = createContext<SignalRContextType>({
  connection: null,
  isConnected: false,
  connecting: false,
  error: null,
  joinGameGroup: async () => false,
  leaveGameGroup: async () => false,
  connectToHub: async () => {},  
  onPlayerJoined: () => {},
  onPlayerLeft: () => {},
  onGameStateChanged: () => {},
  onRoundStarted: () => {},
});

interface SignalRProviderProps {
  children: ReactNode;
}

export const SignalRProvider: React.FC<SignalRProviderProps> = ({ children }) => {
  const [connection, setConnection] = useState<signalR.HubConnection | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';
  const hubUrl = `${API_BASE_URL}/gameHub`;

  const initializeConnection = useCallback(async () => {
    if (connecting || isConnected || !user) {
      return;
    }
    
    setConnecting(true);
    setError(null);
    
    try {
      const newConnection = new signalR.HubConnectionBuilder()
        .withUrl(hubUrl, {
          skipNegotiation: true,
          transport: signalR.HttpTransportType.WebSockets,
          withCredentials: false
        })
        .withAutomaticReconnect()
        .build();
      
      newConnection.onreconnected(() => {
        setIsConnected(true);
      });
      
      newConnection.onclose(() => {
        setIsConnected(false);
      });
      
      await newConnection.start();
      
      setConnection(newConnection);
      setIsConnected(true);
      setConnecting(false);
    } catch (err) {
      console.error("Error connecting to game hub:", err);
      setError("Failed to connect to game server. Please try again later.");
      setConnecting(false);
    }
  }, [hubUrl, user, connecting, isConnected]);

  useEffect(() => {
    let isMounted = true;
    
    const createConnection = async () => {
      if (connecting || isConnected || !user) return;
      
      setConnecting(true);
      setError(null);
      
      try {
        const newConnection = new signalR.HubConnectionBuilder()
          .withUrl(hubUrl, {
            skipNegotiation: true,
            transport: signalR.HttpTransportType.WebSockets,
            withCredentials: false
          })
          .withAutomaticReconnect()
          .build();
        
        newConnection.onreconnected(() => {
          if (isMounted) {
            setIsConnected(true);
          }
        });
        
        newConnection.onclose(() => {
          if (isMounted) {
            setIsConnected(false);
          }
        });
        
        await newConnection.start();
        
        if (isMounted) {
          setConnection(newConnection);
          setIsConnected(true);
          setConnecting(false);
        }
      } catch (err) {
        if (isMounted) {
          console.error("Error connecting to game hub:", err);
          setError("Failed to connect to game server. Please try again later.");
          setConnecting(false);
        }
      }
    };
    
    if (user && !isConnected && !connecting) {
      createConnection();
    }
    
    return () => {
      isMounted = false;
      
      if (connection) {
        connection.stop().catch(err => {
          console.error("Error stopping connection:", err);
        });
      }
    };
  }, [hubUrl, user, connecting, isConnected]);

  const joinGameGroup = async (gameCode: string): Promise<boolean> => {
    if (!connection || !isConnected || !user) {
      console.error("Cannot join game: not connected or no user");
      return false;
    }
    
    if (!gameCode) {
      console.error("Game code is required to join a game group");
      return false;
    }
    
    try {
      await connection.invoke("JoinGame", gameCode, user.id);
      return true;
    } catch (err) {
      console.error("Error joining game group:", err);
      setError("Failed to join game. Please try again.");
      return false;
    }
  };

  const leaveGameGroup = async (gameCode: string): Promise<boolean> => {
    if (!connection || !isConnected || !user) {
      return false;
    }
    
    try {
      await connection.invoke("LeaveGame", gameCode, user.id);
      return true;
    } catch (err) {
      console.error("Error leaving game group:", err);
      return false;
    }
  };

  const onPlayerJoined = (callback: (participants: any[]) => void) => {
    if (connection) {
      connection.on("PlayerJoined", callback);
    }
  };

  const onPlayerLeft = (callback: (participants: any[]) => void) => {
    if (connection) {
      connection.on("PlayerLeft", callback);
    }
  };

  const onGameStateChanged = (callback: (gameStatus: string) => void) => {
    if (connection) {
      connection.on("GameStateChanged", callback);
    }
  };

  const onRoundStarted = (callback: (roundNumber: number, theme: string) => void) => {
    if (connection) {
      connection.on("RoundStarted", callback);
    }
  };

  const value = {
    connection,
    isConnected,
    connecting,
    error,
    joinGameGroup,
    leaveGameGroup,
    connectToHub: initializeConnection,
    onPlayerJoined,
    onPlayerLeft,
    onGameStateChanged,
    onRoundStarted,
  };

  return (
    <SignalRContext.Provider value={value}>
      {children}
    </SignalRContext.Provider>
  );
};

export const useSignalR = () => useContext(SignalRContext);
