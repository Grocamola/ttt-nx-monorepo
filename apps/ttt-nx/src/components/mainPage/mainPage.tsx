import { ReactElement, useEffect, useState } from "react";
import socket from '../socket/socket';
import './mainPage.css';
import LoginForm from "../loginForm/loginForm";
import { signinResponseType, moveResponseType, gameStartType } from '../types-interfaces/types';

const MainPage = (): ReactElement => {
    const [username, setUsername] = useState<string | null>(null);
    const [activeUsers, setActiveUsers] = useState<string[]>([]);
    const [board, setBoard] = useState<(number | "X" | "O")[][]>([]);
    const [players, setPlayers] = useState({ X: '', O: '' });
    const [player, setPlayer] = useState<"X" | "O">('X');
    const [moves, setMoves] = useState<(number | string)[][]>([]);
    const [winner, setWinner] = useState<"X" | "O" | "tie" | "">('')
    const [invitation, setInvitation] = useState<{ from: string, to: string } | null>(null);

    const boxClickHandler = (e: React.MouseEvent<HTMLDivElement>) => {
        const value = e.currentTarget.getAttribute('data-value');
        const rowIndex = Number(e.currentTarget.getAttribute('data-row'));
        const colIndex = Number(e.currentTarget.getAttribute('data-col'));
        let currentPlayer = player;

        if (value !== "X" && value !== "O") {
            console.log(currentPlayer, username, players);
            if (currentPlayer === "X" && username === players.O) return;
            if (currentPlayer === "O" && username === players.X) return;

            socket.emit('move', { rowIndex, colIndex, currentPlayer });
        }
    };

    const handleSendInvitation = (toUsername: string) => {
        if (username) {
            socket.emit('send-invitation', { from: username, to: toUsername });
        }
    };

    const handleAcceptInvitation = () => {
        if (invitation) {
            socket.emit('accept-invitation', invitation);
            setInvitation(null);
            setBoard([[1, 2, 3], [4, 5, 6], [7, 8, 9]]);
            setMoves([]);
            setPlayer('X'); // Reset to player X
        }
    };

    const handleDeclineInvitation = () => {
        setInvitation(null); // Clear invitation
    };

    useEffect(() => {
        socket.on('signin-response', (data: signinResponseType) => {
            console.log('Signin response:', data);
            setUsername(data.authData?.record.username || null);
        });

        socket.on('game-start', (data: gameStartType) => {
            console.log('Game start:', data);
            setBoard(data.board);
            setPlayer(data.currentPlayer);
            setMoves(data.moves);
            setPlayers(data.players);
        });

        socket.on('activeUsers', (data: string[]) => {
            console.log('Active users:', data);
            setActiveUsers(data);
        });

        socket.on('receive-invitation', (data: { from: string, to: string }) => {
            console.log('Receive invitation:', data);
            if (data.to === username) {
                setInvitation(data);
            }
        });

        return () => {
            socket.off('signin-response');
            socket.off('game-start');
            socket.off('activeUsers');
            socket.off('receive-invitation');
        };
    }, [username, player]);

    useEffect(() => {
        socket.on('move-response', (data: moveResponseType) => {
            console.log('Move response:', data);
            setBoard(data.board);
            setPlayer(data.nextPlayer);
            setMoves(data.moves);
            data.isTie === true && setWinner("tie")
            data.winner !== "" && setWinner(data.winner)
        });

        return () => {
            socket.off('move-response');
        };
    }, []);

    return (
        <>
            {!username && (
                <div>
                    <div className="modal" />
                    <div className="loginForm--container">
                        <LoginForm />
                    </div>
                </div>
            )}
            {invitation && (
                <div className="invitation">
                    <p>{invitation.from} wants to play with you!</p>
                    <button onClick={handleAcceptInvitation}>Accept</button>
                    <button onClick={handleDeclineInvitation}>Decline</button>
                </div>
            )}
            {username && activeUsers.length > 0 && board.length < 2 && (
                <div>
                    <div className="modal" />
                    <div className="loginForm--container">
                        <ul>
                            {activeUsers.map((user, index) => (
                                <li className="usernameInvite" key={index}>
                                    <div>{user}</div>
                                    <button onClick={() => handleSendInvitation(user)}>Play</button>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}
            {board.length > 0 && (
                <>
                    <div className="board-title">
                        {winner !== "" ? 
                            <p>Player {winner} Won!</p> : 
                            <p className="mainpage--title">Player {player}'s turn</p>}
                    </div>
                    <div className="board">
                        <div className="board-history">
                            <h4>Moves</h4>
                            <ul>
                                {moves.length > 0 && moves.map((move, index) => (
                                    <li key={index}>{`${move[0]} : row ${move[1]}, col ${move[2]}`}</li>
                                ))}
                            </ul>
                        </div>
                        <div className="board-board">
                            {board.map((row, rowIndex) =>
                                row.map((box, colIndex) => (
                                    <div key={`${rowIndex}-${colIndex}`}
                                        className="board--box"
                                        onClick={boxClickHandler}
                                        data-value={box}
                                        data-row={rowIndex}
                                        data-col={colIndex}>
                                        {box === "X" || box === "O" ? box : null}
                                    </div>
                                ))
                            )}
                        </div>
                        <div className="board-chat">
                            <h4>Message here:</h4>
                        </div>
                    </div>
                </>
            )}
        </>
    );
};

export default MainPage;
