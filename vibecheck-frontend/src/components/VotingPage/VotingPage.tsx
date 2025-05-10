import { useState, useEffect, useRef } from 'react';
import { Vote } from '../../types/vote';
import './VotingPage.css';

// Mock data for static display
const mockVotes: Vote[] = [
  {
    id: "1",
    song: {
      id: "781592622",
      title: "Never Gonna Give You Up",
      previewUrl: "https://cdnt-preview.dzcdn.net/api/1/1/7/2/b/0/72b6f8a61730789a9360439ed0cd920c.mp3?hdnea=exp=1745588479~acl=/api/1/1/7/2/b/0/72b6f8a61730789a9360439ed0cd920c.mp3*~data=user_id=0,application_id=42~hmac=c679d23427f630d2a73d67a4648143ee00ecd9835a4d585c1b86b3fbb1813189",
      artistName: "Rick Astley",
      albumName: "The Best of Me",
      albumCoverSmall: "https://cdn-images.dzcdn.net/images/cover/fe779e632872f7c6e9f1c84ffa7afc33/56x56-000000-80-0-0.jpg",
      albumCoverBig: "https://cdn-images.dzcdn.net/images/cover/fe779e632872f7c6e9f1c84ffa7afc33/500x500-000000-80-0-0.jpg"
    },
    user: {
      id: "user1",
      username: "MusicMaster",
      avatar: "/avatars/1.png"
    },
    votes: 3,
    hasUserVoted: false
  },
  {
    id: "2",
    song: {
      id: "2404839565",
      title: "Ciocolata",
      previewUrl: "https://cdnt-preview.dzcdn.net/api/1/1/e/9/e/0/e9e18161782a3fa845dd3839a0e33c2b.mp3?hdnea=exp=1745588577~acl=/api/1/1/e/9/e/0/e9e18161782a3fa845dd3839a0e33c2b.mp3*~data=user_id=0,application_id=42~hmac=ff07d890c8f459470918b620093bf3ad71e5d5ffb724c1fe01df259e3d46fc00",
      artistName: "Tzanca Uraganu",
      albumName: "Ciocolata",
      albumCoverSmall: "https://cdn-images.dzcdn.net/images/cover/d4db5f5d0652e2b9bfc93e89c9e5b564/56x56-000000-80-0-0.jpg",
      albumCoverBig: "https://cdn-images.dzcdn.net/images/cover/d4db5f5d0652e2b9bfc93e89c9e5b564/500x500-000000-80-0-0.jpg"
    },
    user: {
      id: "user2",
      username: "BeatBopper",
      avatar: "/avatars/1.png"
    },
    votes: 3,
    hasUserVoted: false
  },
  {
    id: "3",
    song: {
      id: "10199904",
      title: "Animal I Have Become",
      previewUrl: "https://cdnt-preview.dzcdn.net/api/1/1/6/3/d/0/63d0024de74cabf4a18f29cc9d82043b.mp3?hdnea=exp=1745588618~acl=/api/1/1/6/3/d/0/63d0024de74cabf4a18f29cc9d82043b.mp3*~data=user_id=0,application_id=42~hmac=7d12b94347e94de574c4ca405f8a9b2510b89588af141931b269fc10e6b88460",
      artistName: "Three Days Grace",
      albumName: "One-X",
      albumCoverSmall: "https://cdn-images.dzcdn.net/images/cover/c7f57c5507ba7753412f52371b475806/56x56-000000-80-0-0.jpg",
      albumCoverBig: "https://cdn-images.dzcdn.net/images/cover/c7f57c5507ba7753412f52371b475806/500x500-000000-80-0-0.jpg"
    },
    user: {
      id: "user3",
      username: "RockRebel",
      avatar: "/avatars/1.png"
    },
    votes: 7,
    hasUserVoted: false
  }
];

const VotingPage = () => {
  const [votes, setVotes] = useState<Vote[]>(mockVotes);
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number>(30 * votes.length); // 30 seconds for every song
  const [userHasVoted, setUserHasVoted] = useState<boolean>(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Mock SignalR data - this would come from your SignalR connection
  const roundNumber = 1;
  const theme = "Road Trip Vibes";

  useEffect(() => {
    // Sort votes by count (descending)
    const sortedVotes = [...votes].sort((a, b) => b.votes - a.votes);
    setVotes(sortedVotes);

    // Check if user has already voted
    const hasVoted = sortedVotes.some(vote => vote.hasUserVoted);
    setUserHasVoted(hasVoted);
  }, [votes]);

  useEffect(() => {
    audioRef.current = new Audio();
    audioRef.current.addEventListener('ended', () => {
      setCurrentlyPlaying(null);
    });

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.removeEventListener('ended', () => {
          setCurrentlyPlaying(null);
        });
      }
    };
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // SignalR event handlers would be set up here
//   useEffect(() => {
//     if (signalR.connection) {
//       // Register for voting-related events
//       signalR.connection.on("VoteReceived", (updatedVotes: Vote[]) => {
//         setVotes(updatedVotes.sort((a, b) => b.votes - a.votes));
//       });

//       signalR.connection.on("VotingEnded", () => {
//         setTimeRemaining(0);
//       });

//       return () => {
//         signalR.connection.off("VoteReceived");
//         signalR.connection.off("VotingEnded");
//       };
//     }
//   }, [signalR.connection]);

  const handlePlayToggle = (vote: Vote) => {
    if (currentlyPlaying === vote.id) {
      if (audioRef.current) {
        audioRef.current.pause();
        setCurrentlyPlaying(null);
      }
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = vote.song.previewUrl;
        audioRef.current.play().catch(err => {
          console.error('Error playing audio:', err);
        });
        setCurrentlyPlaying(vote.id);
      }
    }
  };

  const handleVote = (voteId: string) => {
    // In a real implementation, you would call an API to register the vote
    // For now, we'll just update the local state
    if (userHasVoted) return;

    setVotes(prev => prev.map(vote => {
      if (vote.id === voteId) {
        return { ...vote, votes: vote.votes + 1, hasUserVoted: true };
      }
      return vote;
    }).sort((a, b) => b.votes - a.votes));

    setUserHasVoted(true);

    // In real implementation, you would send the vote to the server via SignalR
    // if (signalR.connection) {
    //   signalR.connection.invoke("SubmitVote", gameId, voteId);
    // }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="voting-page-container">
      <div className="voting-header">
        <div className="round-info">
          <div className="round-number">Round {roundNumber}</div>
          <div className="theme">Theme: {theme}</div>
          <div className="time-remaining">⏱ {formatTime(timeRemaining)} remaining</div>
        </div>
        <h1 className="voting-title">Vote for the best song</h1>
        <p className="voting-instructions">
          Listen to each song and vote for the one that best fits the theme.
          {userHasVoted && <span className="voted-message"> You've cast your vote!</span>}
        </p>
      </div>

      <div className="vote-list">
        {votes.map((vote, index) => (
          <div key={vote.id} className={`vote-card ${vote.hasUserVoted ? 'user-voted' : ''}`}>
            <div className="vote-rank">{index + 1}</div>
            <div className="vote-content">
              <div className="song-details">
                <img
                  src={vote.song.albumCoverBig}
                  alt={`${vote.song.title} cover`}
                  className="song-cover"
                />
                <div className="song-info">
                  <h3 className="song-title" title={vote.song.title}>
                    {vote.song.title.length > 30 ? vote.song.title.substring(0, 27) + '...' : vote.song.title}
                  </h3>
                  <p className="song-artist" title={vote.song.artistName}>{vote.song.artistName}</p>
                  <div className="submitter-info">
                    <img 
                      src={vote.user.avatar} 
                      alt={`${vote.user.username}'s avatar`}
                      className="submitter-avatar" 
                    />
                    <span className="submitter-name">Submitted by <b>{vote.user.username}</b></span>
                  </div>
                </div>
              </div>
              
              <div className="vote-actions">
                <button
                  className={`song-preview-button ${currentlyPlaying === vote.id ? 'playing' : ''}`}
                  onClick={() => handlePlayToggle(vote)}
                >
                  {currentlyPlaying === vote.id ? (
                    <>
                      <span className="pause-icon">◼</span> Pause
                    </>
                  ) : (
                    <>
                      <span className="play-icon">▶</span> Play
                    </>
                  )}
                </button>
                
                <div className="vote-count">
                  <span className="votes">{vote.votes}</span>
                  <span className="vote-label">votes</span>
                </div>
                
                <button
                  className={`vote-button ${vote.hasUserVoted ? 'voted' : ''} ${userHasVoted && !vote.hasUserVoted ? 'disabled' : ''}`}
                  onClick={() => handleVote(vote.id)}
                  disabled={userHasVoted || timeRemaining === 0}
                >
                  {vote.hasUserVoted ? 'Voted ✓' : 'Vote'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {timeRemaining === 0 && (
        <div className="voting-results">
          <h2 className="results-title">Voting Complete!</h2>
          <p className="winner-announcement">
            The winner is "{votes[0].song.title}" by {votes[0].song.artistName}, submitted by {votes[0].user.username}!
          </p>
        </div>
      )}
    </div>
  );
};

export default VotingPage;
