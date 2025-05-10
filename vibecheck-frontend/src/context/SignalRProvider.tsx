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
  connectToHub: () => Promise<void>;
  onPlayerJoined: (callback: (participants: any[]) => void) => void;
  onPlayerLeft: (callback: (participants: any[]) => void) => void;
  onGameStateChanged: (callback: (gameStatus: string) => void) => void;
  onRoundStarted: (callback: (roundNumber: number, theme: string) => void) => void;
  onGameStarted: (callback: (gameData: any) => void) => void;
  removeEventListener: (eventName: string) => void;
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
  onGameStarted: () => {},
  removeEventListener: () => {}
});

interface SignalRProviderProps {
  children: ReactNode;
}
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';
const hubUrl = `${API_BASE_URL}/gameHub`;

export const SignalRProvider: React.FC<SignalRProviderProps> = ({ children }) => {
  const [connection, setConnection] = useState<signalR.HubConnection | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

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
        .configureLogging(signalR.LogLevel.Warning) // Only log warnings and errors
        .withAutomaticReconnect([0, 2000, 5000, 10000, 15000, 30000])
        .build();
      
      newConnection.onreconnecting(() => {
        setIsConnected(false);
      });
      
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
  }, [user, connecting, isConnected]);

  const removeEventListener = useCallback((eventName: string) => {
    if (connection) {
      connection.off(eventName);
    }
  }, [connection]);

  useEffect(() => {    
    const createConnection = async () => {
      if (connecting || isConnected || !user) return;
      
      await initializeConnection();
    };
    
    if (user && !isConnected && !connecting) {
      createConnection();
    }
    
    return () => {
    };
  }, [user, connecting, isConnected, initializeConnection]);

  const joinGameGroup = async (gameCode: string): Promise<boolean> => {
    if (!connection || !isConnected || !user) {
      return false;
    }
    
    if (!gameCode) {
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

  const onPlayerJoined = useCallback((callback: (participants: any[]) => void) => {
    if (connection) {
      // Remove any existing handlers first to avoid duplicates
      removeEventListener("PlayerJoined");
      connection.on("PlayerJoined", (participants) => {
        callback(participants);
      });
    }
  }, [connection, removeEventListener]);

  const onPlayerLeft = useCallback((callback: (participants: any[]) => void) => {
    if (connection) {
      // Remove any existing handlers first to avoid duplicates
      removeEventListener("PlayerLeft");
      connection.on("PlayerLeft", (participants) => {
        callback(participants);
      });
    }
  }, [connection, removeEventListener]);

  const onGameStateChanged = useCallback((callback: (gameStatus: string) => void) => {
    if (connection) {
      // Remove any existing handlers first to avoid duplicates
      removeEventListener("GameStateChanged");
      connection.on("GameStateChanged", (gameStatus) => {
        callback(gameStatus);
      });
    }
  }, [connection, removeEventListener]);

  const onRoundStarted = useCallback((callback: (roundNumber: number, theme: string) => void) => {
    if (connection) {
      // Remove any existing handlers first to avoid duplicates
      removeEventListener("RoundStarted");
      connection.on("RoundStarted", (roundNumber, theme) => {
        callback(roundNumber, theme);
      });
    }
  }, [connection, removeEventListener]);

  const onGameStarted = useCallback((callback: (gameData: any) => void) => {
    if (connection) {
      // Remove any existing handlers first to avoid duplicates
      removeEventListener("GameStarted");
      connection.on("GameStarted", (gameData) => {
        callback(gameData);
      });
    }
  }, [connection, removeEventListener]);

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
    onGameStarted,
    removeEventListener
  };

  return (
    <SignalRContext.Provider value={value}>
      {children}
    </SignalRContext.Provider>
  );
};

export const useSignalR = () => useContext(SignalRContext);
