
describe('Tic-Tac-Toe App', () => {
  beforeEach(() => {
    // Navigate to the app's main page before each test
    cy.visit('/');
  });

  it('should allow user to log in', () => {
    // Interact with the login form
    cy.get('input[name="username"]').type('testUser');
    cy.get('input[name="password"]').type('password123');
    cy.get('button[type="submit"]').click();

    // Verify login success
    cy.contains('Welcome, testUser');
  });

  it('should display active users', () => {
    // Verify the active users list is displayed
    cy.get('.usernameInvite').should('be.visible');
  });

  it('should send and receive game invitations', () => {
    // Send an invitation
    cy.get('.usernameInvite').contains('otherUser').find('button').click();
    
    // Simulate the other user accepting the invitation
    cy.get('.invitation button').contains('Accept').click();

    // Verify the game board is displayed
    cy.get('.board').should('be.visible');
  });

  it('should allow players to make moves', () => {
    // Make a move
    cy.get('.board--box[data-row="0"][data-col="0"]').click();

    // Verify the move is reflected on the board
    cy.get('.board--box[data-row="0"][data-col="0"]').contains('X');
  });

  it('should display the winner when the game ends', () => {
    // Simulate a sequence of moves that results in a win
    cy.get('.board--box[data-row="0"][data-col="0"]').click(); // X
    cy.get('.board--box[data-row="1"][data-col="0"]').click(); // O
    cy.get('.board--box[data-row="0"][data-col="1"]').click(); // X
    cy.get('.board--box[data-row="1"][data-col="1"]').click(); // O
    cy.get('.board--box[data-row="0"][data-col="2"]').click(); // X wins

    // Verify the winner message is displayed
    cy.contains('Player X Won!');
  });

  it('should allow users to chat', () => {
    // Send a chat message
    cy.get('input[type="text"]').type('Hello!');
    cy.get('button').contains('SEND').click();

    // Verify the message is displayed in the chat
    cy.get('.ttt_messages').contains('Hello!');
  });

  it('should allow users to log out', () => {
    // Log out the user
    cy.get('.logout-btn').click();

    // Verify the user is logged out
    cy.contains('Sign in');
  });
});

