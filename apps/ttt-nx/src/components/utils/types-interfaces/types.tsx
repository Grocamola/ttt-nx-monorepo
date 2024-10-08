import { z } from 'zod';

export interface signinResponseType {
  success: boolean;
  authData?: AuthData;
  error: string;
}
interface AuthData {
  record: RecordData;
  token: string;
}
interface RecordData {
  collectionId: string;
  collectionName: string;
  created: string;
  email: string;
  emailVisibility: boolean;
  id: string;
  updated: string;
  username: string;
  verified: boolean;
}

interface BaseGameResponse {
  board: (number | 'X' | 'O')[][];
  nextPlayer: 'X' | 'O';
  moves: (number | string)[][];
  winner: 'X' | 'O' | '';
  isTie: boolean;
  winnerClass: string;
}

export interface moveResponseType extends BaseGameResponse {}

export interface newGameResponseType extends BaseGameResponse {
  score: { playerX: number; playerO: number };
}

export interface gameStartType {
  board: (number | 'X' | 'O')[][];
  currentPlayer: 'X' | 'O';
  moves: (number | string)[][];
  players: { X: string; O: string };
}


export interface ChatMessage {
  sender: string;
  message: string;
}


export const formCheck = z
  .object({
    username: z.string().min(3).max(20).trim(),
    password: z.string().min(3).max(20).trim(),
  })
  .required();


export type FormErrors = {
  username?: string;
  password?: string;
};
      