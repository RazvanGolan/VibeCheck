import React from 'react';
import './Header.css';

function Header() {
    return (
        <header className="header">
            <div className="logo-small">
                <span className="music-icon">♪</span>
                <span>VibeCheck</span>
            </div>
            {/* Navigation links would go here */}
        </header>
    );
}

export default Header;