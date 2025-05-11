import { SongDto } from "./song";
import { UserDto } from "./user";

export type LiveGame = {
  id: string;
  gameMode: string;
  playerCount: number;
  maxPlayers: number;
  rounds: number;
  code: string;
  hostName: string;
}

export type GameDetails = {
  gameId: string;
  code: string;
  hostUserId: string;
  rounds: RoundDto[];
  currentRound: number;
  totalRounds: number;
  timePerRound: number;
  playersLimit: number;
  gameMode: string;
  status: string;
  participants: UserDto[];
};

export type RoundDto = {
  roundId: string;
  roundNumber: number;
  startTime: Date;
  endTime: Date;
  songs: SongDto[];
  theme: ThemeDto;
};

export type ThemeDto = {
  themeId: string;
  name: string;
  category: string;
};