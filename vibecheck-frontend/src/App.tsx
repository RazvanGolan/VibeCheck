import './App.css';
import Layout from './components/Layout/Layout';
import MainPage from './components/MainPage/MainPage';
import Login from './components/LoginPage/Login';
import CreateGame from './components/CreateGame/CreateGame';
<<<<<<< HEAD
import SongSelect from './components/SongSelect/SongSelect';
=======
import GameLobby from './components/GameLobby/GameLobby';
>>>>>>> 8039af23a3e34a75aae5bff3773d5d4d9b95855b
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthProvider';
import { SignalRProvider } from './context/SignalRProvider';
import ProtectedRoute from './context/ProtectedRoute';
import GameLobby from './components/GameLobby/GameLobby';

function App() {
  return (
    <div className="App">
    <AuthProvider>
      <BrowserRouter>
        <SignalRProvider>
          <Routes>
            <Route path="/" element={
              <Layout>
                <MainPage />
              </Layout>
            } />
            <Route path="/login" element={
              <Layout hideProfileSection={true}>
                <Login /> 
              </Layout> 
            } />
             <Route path="/creategame" element={
              <ProtectedRoute>
                <CreateGame />
              </ProtectedRoute>
            } />
            <Route path="/lobby/:roomCode" element={
              <ProtectedRoute>
                <GameLobby />
              </ProtectedRoute>
            } />
            <Route path="/lobby/:gameId" element={
              <ProtectedRoute>
                <Layout>
                  <GameLobby />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/select" element={
              <ProtectedRoute>
                <Layout>
                  <SongSelect />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </SignalRProvider>
        </BrowserRouter>
    </AuthProvider>
    </div>
  );
}

export default App;
