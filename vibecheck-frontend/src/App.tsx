import './App.css';
import Layout from './components/layout/Layout';
import MainPage from './components/MainPage';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<MainPage/>} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </div>
  );
}

export default App;
