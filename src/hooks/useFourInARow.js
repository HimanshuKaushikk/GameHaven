import { useState, useEffect } from 'react';

const ROWS = 6;
const COLS = 7;

export function useFourInARow({ mode, onGameEnd }) {
  const [board, setBoard] = useState(Array.from({ length: ROWS }, () => Array(COLS).fill(0)));
  const [turn, setTurn] = useState(1);
  const [winner, setWinner] = useState(0);

  const checkWin = (b, r, c, player) => {
    const directions = [
      [0, 1], [1, 0], [1, 1], [1, -1]
    ];
    for (let [dr, dc] of directions) {
      let count = 1;
      for (let i = 1; i < 4; i++) {
        if (b[r + dr * i]?.[c + dc * i] === player) count++;
        else break;
      }
      for (let i = 1; i < 4; i++) {
        if (b[r - dr * i]?.[c - dc * i] === player) count++;
        else break;
      }
      if (count >= 4) return true;
    }
    return false;
  };

  const getValidRow = (b, col) => {
    let r = ROWS - 1;
    while (r >= 0 && b[r][col] !== 0) {
      r--;
    }
    return r;
  };

  const handleColumnPress = (col) => {
    if (winner !== 0) return;
    
    let r = getValidRow(board, col);
    if (r >= 0) {
      const newBoard = board.map(row => [...row]);
      newBoard[r][col] = turn;
      setBoard(newBoard);

      if (checkWin(newBoard, r, col, turn)) {
        setWinner(turn);
        setTimeout(() => onGameEnd(turn === 1 ? 1 : 2), 2000);
      } else {
        if (newBoard[0].every(c => c !== 0)) {
          setWinner(3);
          setTimeout(() => onGameEnd(0), 2000);
        } else {
          setTurn(turn === 1 ? 2 : 1);
        }
      }
    }
  };

  const getBestMove4 = (b) => {
    const colsCanPlay = [];
    for (let c = 0; c < COLS; c++) {
      if (b[0][c] === 0) colsCanPlay.push(c);
    }
    if (colsCanPlay.length === 0) return -1;

    // 1. Check if bot can win immediately
    for (let c of colsCanPlay) {
      let r = getValidRow(b, c);
      let testBoard = b.map(row => [...row]);
      testBoard[r][c] = 2;
      if (checkWin(testBoard, r, c, 2)) return c;
    }

    // 2. Check if player 1 can win, block it
    for (let c of colsCanPlay) {
      let r = getValidRow(b, c);
      let testBoard = b.map(row => [...row]);
      testBoard[r][c] = 1;
      if (checkWin(testBoard, r, c, 1)) return c;
    }
    
    // 3. Prevent opponent winning move trap (if playing above the next spot makes them win)
    const safeCols = [];
    for (let c of colsCanPlay) {
      let r = getValidRow(b, c);
      // If we play here, does the spot above it give opponent the win?
      if (r > 0) {
        let trapBoard = b.map(row => [...row]);
        trapBoard[r][c] = 2; // we play
        trapBoard[r - 1][c] = 1; // they play above
        if (checkWin(trapBoard, r - 1, c, 1)) {
          continue; // Dangerous!
        }
      }
      safeCols.push(c);
    }

    const playChoices = safeCols.length > 0 ? safeCols : colsCanPlay;

    // 4. Prefer center columns
    const centerCols = [3, 2, 4, 1, 5, 0, 6];
    for (let c of centerCols) {
      if (playChoices.includes(c)) return c;
    }
    
    return playChoices[0];
  };

  useEffect(() => {
    if (mode === 'bot' && turn === 2 && winner === 0) {
      setTimeout(() => {
        const bestCol = getBestMove4(board);
        if (bestCol !== -1) {
          handleColumnPress(bestCol);
        }
      }, 700);
    }
  }, [turn, mode, winner]);

  return { board, turn, winner, handleColumnPress, ROWS, COLS };
}
