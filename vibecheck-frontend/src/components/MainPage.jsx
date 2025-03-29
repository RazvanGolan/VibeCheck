import React, { useState } from 'react';
import './MainPage.css';

function MainPage() {
    const [isAuthentificated, setIsAuthentificated] = useState(false);

    return (
        <div className='main-page'>
            <h1>Welcome to the Main Page</h1>
            <p>This is the main content of the page.</p>
        </div>
    );
}

export default MainPage;
