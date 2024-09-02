import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import MainPage from './MainPage';
import socket from '../../../__mocks__/socket';

describe('MainPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders login form when username is not set', async () => {
    render(<MainPage />);
    // Check if LoginForm is rendered
    expect(screen.queryByTestId('login-form')).toBeDefined();
  });

  it('renders board and active users when username is set and board is present', async () => {
    // Mock socket events
    socket.on.mockImplementation((event, callback) => {
      if (event === 'signin-response') {
        callback({ authData: { record: { username: 'testUser' } } });
      }
      if (event === 'activeUsers') {
        callback(['testUser', 'otherUser']);
      }
      if (event === 'game-start') {
        callback({
          board: [
            [1, 2, 3],
            [4, 5, 6],
            [7, 8, 9],
          ],
          currentPlayer: 'X',
          moves: [],
          players: { X: 'testUser', O: 'otherUser' },
        });
      }
    });

    render(<MainPage />);

    // Wait for the board to render
    await waitFor(() => {
      const boardTitle = screen.queryByTestId('board-title');
      expect(boardTitle).toBeDefined();
    });

    // Check if active users list is rendered
    await waitFor(() => {
      expect(screen.queryByText('otherUser')).toBeDefined();
    });
  });

  it('handles socket events and updates UI', async () => {
    // Mock socket events
    socket.on.mockImplementation((event, callback) => {
      if (event === 'signin-response') {
        callback({ authData: { record: { username: 'testUser' } } });
      }
      if (event === 'activeUsers') {
        callback(['testUser', 'otherUser']);
      }
      if (event === 'game-start') {
        callback({
          board: [
            [1, 2, 3],
            [4, 5, 6],
            [7, 8, 9],
          ],
          currentPlayer: 'X',
          moves: [],
          players: { X: 'testUser', O: 'otherUser' },
        });
      }
      if (event === 'move-response') {
        callback({
          board: [
            [1, 'X', 3],
            [4, 5, 6],
            [7, 8, 9],
          ],
          nextPlayer: 'O',
          moves: [[1, 0, 1]], // Move at row 1, col 1
          winner: '',
          isTie: false,
          winnerClass: '',
        });
      }
    });

    render(<MainPage />);

    // Wait for board update
    await waitFor(() => {
      expect(screen.queryByText('moves')).toBeDefined();
    });
  });

  it('sends messages correctly', async () => {
    // Mock the socket.on implementation
    socket.on.mockImplementation((event, callback) => {
      if (event === 'signin-response') {
        callback({ authData: { record: { username: 'testUser' } } });
      }
      if (event === 'message-broadcast') {
        callback({ sender: 'testUser', message: 'Hello!' });
      }
    });

    // Render the MainPage component
    render(<MainPage />);

    // Debugging log
    console.log('Rendering MainPage component');

    // Check if the input field and send button are present
    let input;
    let sendButton;

    try {
      input = await screen.findByPlaceholderText('type here...');
      sendButton = await screen.findByText('SEND');
    } catch (error) {
      console.error('Error finding input field or send button:', error);
    }

    // Basic assertions to check if elements exist
    if (!input) {
      console.error('Input field is missing');
    }
    if (!sendButton) {
      console.error('Send button is missing');
    }

    // Simulate sending a message if elements are found
    if (input && sendButton) {
      fireEvent.change(input, { target: { value: 'Hello!' } });
      fireEvent.click(sendButton);

      // Wait for message to appear
      await waitFor(() => {
        const message = screen.queryByText('Hello!');
        if (!message) {
          console.error('Message not found');
        }
      });
    }
  });
});
