import './App.css';
import Layout from './components/layout/Layout';
import MainPage from './components/MainPage/MainPage';
import Login from './components/LoginPage/Login';
import CreateGame from './components/CreateGame/CreateGame';
import SongSelect from './components/SongSelect/SongSelect';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthProvider';
import { SignalRProvider } from './context/SignalRProvider';
import ProtectedRoute from './context/ProtectedRoute';
import GameLobby from './components/GameLobby/GameLobby';
import VotingPage from './components/VotingPage/VotingPage';

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
                <Layout>
                  <CreateGame />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/lobby/:gameId" element={
              <ProtectedRoute>
                <Layout>
                  <GameLobby />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/select/:gameId" element={
              <ProtectedRoute>
                <Layout>
                  <SongSelect />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/vote/:gameId" element={
              <ProtectedRoute>
                <Layout>
                  <VotingPage />
                </Layout>
              </ProtectedRoute>
            } />
            {/* Redirect all other paths to the main page */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </SignalRProvider>
        </BrowserRouter>
    </AuthProvider>
    </div>
  );
}

export default App;
