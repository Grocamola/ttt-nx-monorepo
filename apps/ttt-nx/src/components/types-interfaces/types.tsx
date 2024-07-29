export interface signinResponseType {
    success: boolean,
    authData? : AuthData,
    error: string
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


export interface moveResponseType { 
    board: (number | "X" | "O")[][],
    nextPlayer: "X" | "O",
    moves: (number | string)[][],
    winner: "X" | "O" | "",
    isTie: boolean,
    winnerClass: string
}

export interface newGameResponseType { 
    board: (number | "X" | "O")[][],
    nextPlayer: "X" | "O",
    moves: (number | string)[][],
    winner: "X" | "O" | "",
    isTie: boolean,
    winnerClass: string,
    score: {playerX: number, playerO: number}
}

export interface gameStartType {
    board: (number | "X" | "O")[][],
    currentPlayer: "X" | "O"
    moves: (number | string)[][]
    players: {X: string, O: string}
}


export interface FormData {
    username: string;
    password: string;
}


export interface ChatMessage {
    sender: string;
    message: string;
}