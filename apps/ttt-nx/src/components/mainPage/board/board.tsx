import React from 'react';
import { useEffect, useMemo, useState } from 'react';
import socket from '../../utils/socket/socket';

import { ChatMessage, gameStartType, moveResponseType, newGameResponseType } from '../../utils/types-interfaces/types';



const Board = ({username, gameStart} : {username: string | null, gameStart: boolean}) => {

  const [board, setBoard] = useState<(number | 'X' | 'O')[][]>([]);
  const [winner, setWinner] = useState<'X' | 'O' | 'tie' | ''>('');
  const [score, setScore] = useState({ playerX: 0, playerO: 0 });
  const [winnerCheck, setWinnerCheck] = useState<string>('');
  const [moves, setMoves] = useState<(number | string)[][]>([]);
  const [players, setPlayers] = useState({ X: '', O: '' });
  const [player, setPlayer] = useState<'X' | 'O'>('X');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [message, setMessage] = useState<string>('');



  const boxClickHandler = (e: React.MouseEvent<HTMLDivElement>) => {
    const value = e.currentTarget.getAttribute('data-value');
    const rowIndex = Number(e.currentTarget.getAttribute('data-row'));
    const colIndex = Number(e.currentTarget.getAttribute('data-col'));
    const currentPlayer = player;

    if (winner !== '') return;

    if (value !== 'X' && value !== 'O') {
      console.log(currentPlayer, username, players);
      if (currentPlayer === 'X' && username === players.O) return;
      if (currentPlayer === 'O' && username === players.X) return;

      socket.emit('move', { rowIndex, colIndex, currentPlayer });
    }
  };

  const sendMessage = () => {
    socket.emit('new-message', { sender: username, message });
    setMessage(''); // Clear the input after sending the message
  };

  const newGameHandler = () => {
    socket.emit('new-game-request');
    setBoard([
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9],
    ]);
    setMoves([]);
    setPlayer('X'); // Reset to player X
  };

  useEffect(() => { 
    socket.on('game-start', (data: gameStartType) => {
        // newGameHandler();
        console.log('Game start:', data);
        setBoard(data.board);
        setPlayer(data.currentPlayer);
        setMoves(data.moves);
        setPlayers(data.players);
      });

      socket.on('move-response', (data: moveResponseType) => {
        console.log('Move response:', data);
        setBoard(data.board);
        setPlayer(data.nextPlayer);
        setMoves(data.moves);
        data.isTie === true && setWinner('tie');
        data.winner !== '' && setWinner(data.winner);
        data.winnerClass !== '' && setWinnerCheck(data.winnerClass);
      });
  
      socket.on('new-game-response', (data: newGameResponseType) => {
        console.log('new-game-response:', data);
        setBoard(data.board);
        setPlayer(data.nextPlayer);
        setMoves(data.moves);
        // data.isTie === true ? setWinner('tie') : null;
        data.winner !== '' ? setWinner(data.winner) : setWinner('');
        data.winnerClass !== ''
          ? setWinnerCheck(data.winnerClass)
          : setWinnerCheck('');
        setScore(data.score);
      });
  
      socket.on('message-broadcast', (data: ChatMessage) => {
        setMessages((prev) => [...prev, data]);
      });

  
      return () => {
        socket.off('move-response');
        socket.off('message-broadcast');
        socket.off('new-game-response');
        socket.off('game-start');
      };
    },[]);

    useMemo(() => {
        if(gameStart === false) { 
            setBoard([]);
            setPlayers({ X: '', O: '' });
            setMoves([]);
            setWinner('');
            setWinnerCheck('');
            setMessages([]);
        }
    },[gameStart])

  return (
    <React.Fragment>
      <div className="board-title">
        {winner === '' ? (
          username === players[player] ? (
            <p>Your turn!</p>
          ) : (
            <p className="mainpage--title">Player {player}'s turn</p>
          )
        ) : winner === 'tie' ? (
          <p>Tie!</p>
        ) : (
          <p>Player {winner} Won!</p>
        )}
      </div>
      <div className="board">
        <div className="board-history">
          <h4>Moves</h4>
          <ul>
            {moves.length > 0 &&
              moves.map((move, index) => (
                <li
                  key={index}
                >{`${move[0]} : row ${move[1]}, col ${move[2]}`}</li>
              ))}
            {moves.length === 0 && <p>No moves yet.</p>}
          </ul>
        </div>
        <div className="board-board">
          <div
            className={`${winnerCheck !== '' && 'winner-check'} ${winnerCheck}`}
          />
          {board.map((row, rowIndex) =>
            row.map((box, colIndex) => (
              <div
                key={`${rowIndex}-${colIndex}`}
                className="board--box"
                onClick={boxClickHandler}
                data-value={box}
                data-row={rowIndex}
                data-col={colIndex}
              >
                {box === 'X' || box === 'O' ? box : null}
              </div>
            ))
          )}
          <button className="button newPlay-btn" onClick={newGameHandler}>
            NEW PLAY
          </button>
          {(score.playerX > 0 || score.playerO > 0) && (
            <p className="score-display">{`Score X: ${score.playerX} - score O: ${score.playerO}`}</p>
          )}
        </div>

        <div className="board-chat">
          <h4>Chat here</h4>
          {username && (
            <div className="ttt_messages">
              {messages.map((msg, index) => (
                <p
                  key={index}
                  className={
                    msg.sender === username ? 'myMessage' : 'otherMessage'
                  }
                >
                  {msg.message}
                </p>
              ))}
            </div>
          )}
          {username && (
            <div className="ttt_messageinputfields">
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
            </div>
          )}
        </div>
      </div>
    </React.Fragment>
  );
};

export default Board;
