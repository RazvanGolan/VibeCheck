import './App.css';
import Layout from './components/layout/Layout';
import MainPage from './components/MainPage';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthProvider';

function App() {
  return (
    <div className="App">
    <AuthProvider>
      <BrowserRouter>
          <Layout>
            <Routes>
              <Route path="/" element={<MainPage/>} />
            </Routes>
          </Layout>
        </BrowserRouter>
    </AuthProvider>
    </div>
  );
}

export default App;
