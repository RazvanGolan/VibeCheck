import './MainPage.css';
import { useAuth } from '../context/AuthProvider';

function MainPage() {
    const { isAuthenticated, user } = useAuth();

    return (
        <div className="container">
            <div className="start-playing">
                <div className="start-playing-content">
                    <h1 className="hero-title">Battle with Music, Win with Taste</h1>
                    <p className="hero-subtitle">Compete with friends to find the perfect song for any moment. Vote, rank, and crown the ultimate music curator!</p>
                    <button className="play-button">Start Playing</button>
                </div>
            </div>
            <div className="into">
                <h2 className="section-title">How VibeCheck Works</h2>
                <div className="steps-container">
                    <div className="step">
                        <div className="step-number">
                            <img src="/assets/icons/group-icon.png" alt="Group" className="step-icon" />
                        </div>
                        <h3 className="step-title">Rally Your Crew</h3>
                        <p className="step-description">Create a room and invite your friends to join the musical showdown</p>
                    </div>
                    <div className="step">
                        <div className="step-number">
                            <img src="/assets/icons/sound-icon.png" alt="Music" className="step-icon" />
                        </div>
                        <h3 className="step-title">Pick Your Songs</h3>
                        <p className="step-description">Choose the perfect track that matches the round's theme</p>
                    </div>
                    <div className="step">
                        <div className="step-number">
                            <img src="/assets/icons/vote-icon.png" alt="Vote" className="step-icon" />
                        </div>
                        <h3 className="step-title">Vote for the Best</h3>
                        <p className="step-description">Listen to every entry and vote for the track that nails the vibe</p>
                    </div>
                </div>
            </div>
            <div className="live-games">

            </div>
            <div className="create-account">

            </div>
        </div>
    );
}

export default MainPage;
