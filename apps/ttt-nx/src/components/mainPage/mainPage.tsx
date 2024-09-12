import React, { ReactElement, useEffect, useState } from 'react';
import socket from '../utils/socket/socket';

import LoginForm from '../loginForm/loginForm';
import { signinResponseType } from '../utils/types-interfaces/types';

// eslint-disable-next-line @nx/enforce-module-boundaries
import { Styles } from '../../../../../libs/styles/styles/src/lib/styles';
import './mainPage.css';
import Board from './board/board';

const MainPage = (): ReactElement => {
  const [username, setUsername] = useState<string | null>(null);
  const [activeUsers, setActiveUsers] = useState<string[]>([]);
  const [gameStart, setGameStart] = useState<boolean>(false)
  const [invitation, setInvitation] = useState<{
    from: string;
    to: string;
  } | null>(null);

  const handleSendInvitation = (toUsername: string) => {
    if (username) {
      socket.emit('send-invitation', { from: username, to: toUsername });
    }
  };

  const handleAcceptInvitation = () => {
    if (invitation) {
      socket.emit('accept-invitation', invitation);
      setInvitation(null);
    }
  };

  const handleDeclineInvitation = () => {
    setInvitation(null); // Clear invitation
  };

  const logoutHandler = () => {
    socket.emit('user-logout', { username });

    clearState();
  };

  const clearState = () => {
    setUsername('');
  };

  useEffect(() => {
    socket.on('game-notification', (data: string) => setGameStart(true))
  },[])

  useEffect(() => {
    socket.on('signin-response', (data: signinResponseType) => {
      setUsername(data.authData?.record.username || null);
    });

    socket.on('activeUsers', (data: string[]) => {
      console.log('Active users:', data);
      setActiveUsers(data);
    });

    socket.on('receive-invitation', (data: { from: string; to: string }) => {
      console.log('Receive invitation:', data);
      if (data.to === username) {
        setInvitation(data);
      }
    });

    socket.on('game-end', (data: string) => {
      console.log(data);
      setGameStart(false)
      clearState();
    });

    socket.on('new-game-notification', (data: string) => setGameStart(true))

    return () => {
      socket.off('signin-response');
      socket.off('activeUsers');
      socket.off('receive-invitation');
      socket.off('game-end');
    };
  }, [username]);

  return (
    <div>
      {(username === "" || !username) && !gameStart && (
        <div>
          {!username && <div className={Styles()} />}
          <div className="loginForm--container" data-testid="login-form">
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
      {username && username.length > 1 && activeUsers.length > 0 && !gameStart && (
        <div>
          <div className={Styles()} />
          <div className="loginForm--container">
            <ul>
              {activeUsers.map((user, index) => (
                <li className="usernameInvite" key={index}>
                  <div>{user}</div>
                  {user !== username ? (
                    <button onClick={() => handleSendInvitation(user)}>
                      Play
                    </button>
                  ) : (
                    <p style={{ margin: 0 }}>Me</p>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
      {gameStart && (
        <>
          <button className="button logout-btn" onClick={logoutHandler}>
            Logout
          </button>

          <Board username={username} gameStart={gameStart} />
        </>
      )}
    </div>
  );
};

export default MainPage;
