
export const WinnerCheck = (board, winner, winnerClass, isTie) => {
    for (let col = 0; col < board.length; col++) {
      if (board[0][col] === board[1][col] && board[1][col] === board[2][col]) {
        winner = board[0][col];
        winnerClass = col === 0 ? 'col-left' : col === 1 ? 'col-center' : col === 2 ? 'col-right' : '';
      }
    }
    for (let row = 0; row < board.length; row++) {
      if (board[row][0] === board[row][1] && board[row][1] === board[row][2]) {
        winner = board[row][0];
        winnerClass = row === 0 ? 'row-up' : row === 1 ? 'row-center' : row === 2 ? 'row-down' : '';
      }
    }
    if (board[0][0] === board[1][1] && board[1][1] === board[2][2]) {
      winner = board[0][0];
      winnerClass = 'diagonal-left';
    }
    if (board[0][2] === board[1][1] && board[1][1] === board[2][0]) {
      winner = board[0][2];
      winnerClass = 'diagonal-right';
    }
    if (board.flat().every(cell => isNaN(cell))) {
      isTie = true;
    }
    return ({winner, winnerClass, isTie});
  }