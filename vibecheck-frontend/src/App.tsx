import './App.css';
import Layout from './components/layout/Layout';
import MainPage from './components/MainPage';
import Login from './components/Login';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthProvider';

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
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
    </AuthProvider>
    </div>
  );
}

export default App;
