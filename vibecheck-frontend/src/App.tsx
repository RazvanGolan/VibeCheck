import './App.css';
import Layout from './components/Layout/Layout';
import MainPage from './components/MainPage/MainPage';
import Login from './components/LoginPage/Login';
import CreateGame from './components/CreateGame/CreateGame';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthProvider';
import ProtectedRoute from './context/ProtectedRoute';

function App() {
  return (
    <div className="App">
    <AuthProvider>
      <BrowserRouter>
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
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
    </AuthProvider>
    </div>
  );
}

export default App;
