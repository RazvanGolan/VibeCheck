import { Song } from './song';
import { User } from './user';

export interface Vote {
  id: string;
  song: Song;
  user: User;
  votes: number;
  hasUserVoted?: boolean; // To track if the current user has voted for this submission
}
