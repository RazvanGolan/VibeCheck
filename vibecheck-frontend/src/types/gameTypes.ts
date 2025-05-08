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
  rounds: number;
  timePerRound: number;
  playersLimit: number;
  gameMode: string;
  status: string;
  participants: UserDto[];
};