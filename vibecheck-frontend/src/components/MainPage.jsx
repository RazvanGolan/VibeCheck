import './MainPage.css';
import { useAuth } from '../context/AuthProvider';

function MainPage() {
    const { isAuthenticated, user } = useAuth();

    return (
        <div className='main-page'>
            <h1>Welcome to the Main Page</h1>
            {isAuthenticated ? (
                <p>Hello, {user?.username}! Ready to discover new music?</p>
            ) : (
                <p>Sign in to discover personalized music recommendations.</p>
            )}
        </div>
    );
}

export default MainPage;
