import { ReactElement, useEffect, useState } from "react";
import socket from '../socket/socket';

import LoginForm from "../loginForm/loginForm";
import { signinResponseType, moveResponseType, gameStartType, ChatMessage, newGameResponseType } from '../types-interfaces/types';

import { Styles } from '../../../../../libs/styles/styles/src/lib/styles';
import './mainPage.css';

const MainPage = (): ReactElement => {
    const [username, setUsername] = useState<string | null>(null);
    const [activeUsers, setActiveUsers] = useState<string[]>([]);
    const [board, setBoard] = useState<(number | "X" | "O")[][]>([]);
    const [players, setPlayers] = useState({ X: '', O: '' });
    const [player, setPlayer] = useState<"X" | "O">('X');
    const [moves, setMoves] = useState<(number | string)[][]>([]);
    const [winner, setWinner] = useState<"X" | "O" | "tie" | "">('')
    const [score, setScore] = useState({playerX: 0, playerO: 0});
    const [winnerCheck, setWinnerCheck] = useState<string>('')
    const [invitation, setInvitation] = useState<{ from: string, to: string } | null>(null);

    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [message, setMessage] = useState<string>("");

    const boxClickHandler = (e: React.MouseEvent<HTMLDivElement>) => {
        const value = e.currentTarget.getAttribute('data-value');
        const rowIndex = Number(e.currentTarget.getAttribute('data-row'));
        const colIndex = Number(e.currentTarget.getAttribute('data-col'));
        let currentPlayer = player;

        if(winner !== "") return;

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

    const sendMessage = () => {
        socket.emit('new-message', { sender: username, message });
        setMessage(""); // Clear the input after sending the message
    };

    const logoutHandler = () => {
        socket.emit('user-logout', { username });

        clearState()
    }

    const newGameHandler = () => {
        socket.emit('new-game-request')
    }

    const clearState = () => { 
        setUsername('')
        setActiveUsers([])
        setBoard([])
        setPlayers({ X: '', O: '' })
        setMoves([])
        setWinner('')
        setWinnerCheck('')
        setInvitation(null)
        setMessages([])
    }

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

        socket.on('game-end', (data: string) => {
            console.log(data)
            clearState()
        })

        return () => {
            socket.off('signin-response');
            socket.off('game-start');
            socket.off('activeUsers');
            socket.off('receive-invitation');
            socket.off('game-end')
        };
    }, [username]);

    useEffect(() => {
        socket.on('move-response', (data: moveResponseType) => {
            console.log('Move response:', data);
            setBoard(data.board);
            setPlayer(data.nextPlayer);
            setMoves(data.moves);
            data.isTie === true && setWinner("tie");
            data.winner !== "" && setWinner(data.winner);
            data.winnerClass !== '' && setWinnerCheck(data.winnerClass)
        });

        socket.on('new-game-response', (data: newGameResponseType) => {
            console.log('Move response:', data);
            setBoard(data.board);
            setPlayer(data.nextPlayer);
            setMoves(data.moves);
            data.isTie === true ? setWinner("tie") : null;
            data.winner !== "" ? setWinner(data.winner) : setWinner('');
            data.winnerClass !== '' ? setWinnerCheck(data.winnerClass) : setWinnerCheck('')
            setScore(data.score)
        });

        socket.on('message-broadcast', (data: ChatMessage) => {
            setMessages(prev => [...prev, data]);
        });

        return () => {
            socket.off('move-response');
            socket.off('message-broadcast');
            socket.off('new-game-response')
        };
    }, []);

    return (
        <div className={Styles()}>
            {!username && (
                <div>
                    <div className="modal" />
                    <div className="loginForm--container"  data-testid="login-form">
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
                                    {user !== username ? <button onClick={() => handleSendInvitation(user)}>Play</button> : <p style={{margin: 0}}>Me</p>}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}
            {board.length > 0 && (
                <>
                    <button className="button logout-btn" onClick={logoutHandler}>Logout</button>
                    <div className="board-title">
                        {winner === "" ? 
                            (username === players[player]) ? <p>Your turn!</p> 
                            : <p className="mainpage--title">Player {player}'s turn</p> : 
                            winner === "tie" ? <p>Tie!</p> :
                            <p>Player {winner} Won!</p>
                        }
                    </div>
                    <div className="board">
                        <div className="board-history">
                            <h4>Moves</h4>
                            <ul>
                                {moves.length > 0 && moves.map((move, index) => (
                                    <li key={index}>{`${move[0]} : row ${move[1]}, col ${move[2]}`}</li>
                                ))}
                                {moves.length === 0 && <p>No moves yet.</p>}
                            </ul>
                        </div>
                        <div className="board-board">
                            <div className={`${winnerCheck !== '' && 'winner-check'} ${winnerCheck}`} />
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
                            <button className="button newPlay-btn" onClick={newGameHandler}>NEW PLAY</button>
                            {(score.playerX > 0 || score.playerO > 0) && <p className="score-display">{`Score X: ${score.playerX} - score O: ${score.playerO}`}</p>}
                        </div>
                        
                        <div className="board-chat">
                            <h4>Chat here</h4>
                            {username && <div className="ttt_messages">
                                {messages.map((msg, index) => (
                                <p key={index} className={msg.sender === username ? 'myMessage' : 'otherMessage'}>{msg.message}</p>
                                ))}
                            </div>}
                            {username && <div className="ttt_messageinputfields">
                                <div className="ttt_ChatInput">
                                <input
                                    type="text"
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    placeholder="type here..."
                                />
                                </div>
                                <div className="ttt_messageSendbtn">
                                <button onClick={sendMessage}>SEND</button>
                                </div>
                            </div>}
                        </div>
                    </div>
                    
                </>
            )}
        </div>
    );
};

export default MainPage;
