import './Header.css';
import { useAuth } from '../../../context/AuthProvider';

function Header({ hideProfileSection = false }) {
    const { isAuthenticated, user, signIn, signOut } = useAuth();

    return (
        <header className="header">
            <div className="logo-small">
                <span className="music-icon">♪</span>
                <span className="title">VibeCheck</span>
            </div>

            {!hideProfileSection && (
                isAuthenticated ? (
                    <div className="user-profile">
                        <div className="avatar-container">
                            <img 
                                src={user?.avatar} 
                                alt="User avatar"
                                className="user-avatar" 
                            />
                            <img 
                                src="/assets/icons/dropdown-arrow.png" 
                                alt="Dropdown" 
                                className="dropdown-arrow"
                            />
                        </div>
                        <div className="dropdown-menu">
                            <div className="dropdown-item" onClick={signOut}>
                                Sign Out
                            </div>
                        </div>
                    </div>
                ) : (
                    <button onClick={signIn} className="sign-in-button">Sign In</button>
                )
            )}
        </header>
    );
}

export default Header;