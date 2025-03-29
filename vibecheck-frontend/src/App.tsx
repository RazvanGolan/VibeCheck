import React from 'react';
import './App.css';
import Login from './components/Login';
//  import CreateRoom from './components/CreateRoom';        TO BE IMPLEMENTED 
import { BrowserRouter, Routes, Route } from 'react-router-dom';

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<MainPage />} />
          <Route path="/login" element={<Login />} />
           {/* <Route path="/create-room" element={<CreateRoom />} />    TO BE IMPLEMENTED   */}
        </Routes>
      </BrowserRouter>
    </div>
  );
}

const MainPage = () => {
  return (
    <div>
      <h1>VibeCheck Homepage</h1>
      {/* CHANNGE THIS */}
    </div>
  );
};

export default App;
