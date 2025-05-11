import { User } from "./user";
import { Vote } from "./vote";

export interface Song {
  id: string;
  title: string;
  previewUrl: string;
  artistName: string;
  albumName: string;
  albumCoverSmall: string;
  albumCoverBig: string;
  votes?: Vote[];
  users?: User[];
}

export interface SongDto {
  id: string;
  deezerSongId: string;
  title: string;
  previewUrl: string;
  artistName: string;
  albumName: string;
  albumCoverSmall: string;
  albumCoverBig: string;
  voteCount: number;
  votes?: Vote[];
  users?: User[];
}

export interface SongSubmission {
  id: string;
  deezerSongId: string;
  song: Song;
  users: User[];
  votes: number;
  hasUserVoted: boolean;
  votedBy?: string[];
}