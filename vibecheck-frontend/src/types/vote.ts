export interface Vote {
  songId: string;
  voterUserId: string;
  voterUserName: string;
}

export interface SubmitVote {
  gameId: string;
  deezerSongId: string;
  voterUserId: string;
}