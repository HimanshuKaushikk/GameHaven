import { useState, useEffect } from 'react';

export function useTicTacToe({ mode, onGameEnd }) {
  const [board, setBoard] = useState(Array(9).fill(null));
  const [isXNext, setIsXNext] = useState(true);
  const [winner, setWinner] = useState(null);

  const checkWinner = (squares) => {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8],
      [0, 3, 6], [1, 4, 7], [2, 5, 8],
      [0, 4, 8], [2, 4, 6]
    ];
    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i];
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return squares[a];
      }
    }
    if (!squares.includes(null)) return 'Draw';
    return null;
  };

  const minimax = (squares, depth, isMaximizing) => {
    const winner = checkWinner(squares);
    if (winner === 'O') return 10 - depth;
    if (winner === 'X') return -10 + depth;
    if (winner === 'Draw') return 0;

    let bestScore = isMaximizing ? -Infinity : Infinity;
    for (let i = 0; i < squares.length; i++) {
      if (!squares[i]) {
        squares[i] = isMaximizing ? 'O' : 'X';
        const score = minimax(squares, depth + 1, !isMaximizing);
        squares[i] = null;
        if (isMaximizing) {
          bestScore = Math.max(score, bestScore);
        } else {
          bestScore = Math.min(score, bestScore);
        }
      }
    }
    return bestScore;
  };

  const getBestMove = (squares) => {
    let bestScore = -Infinity;
    let move = -1;
    for (let i = 0; i < squares.length; i++) {
      if (!squares[i]) {
        squares[i] = 'O'; // Bot's move
        const score = minimax(squares, 0, false);
        squares[i] = null;
        if (score > bestScore) {
          bestScore = score;
          move = i;
        }
      }
    }
    // Fallback logic
    if (move === -1) {
      const emptyIndices = squares.map((v, idx) => v === null ? idx : null).filter(v => v !== null);
      if (emptyIndices.length > 0) move = emptyIndices[0];
    }
    return move;
  };

  const handlePress = (index) => {
    if (board[index] || winner) return;

    const newBoard = [...board];
    newBoard[index] = isXNext ? 'X' : 'O';
    setBoard(newBoard);
    setIsXNext(!isXNext);
  };

  useEffect(() => {
    const actWinner = checkWinner(board);
    if (actWinner && !winner) {
      setWinner(actWinner);
      setTimeout(() => {
        let winCode = 0;
        if (actWinner === 'X') winCode = 1;
        else if (actWinner === 'O') winCode = 2;
        onGameEnd(winCode);
      }, 1500);
      return;
    }

    if (mode === 'bot' && !isXNext && !winner) {
      const botTimer = setTimeout(() => {
        const bestMove = getBestMove([...board]);
        if (bestMove !== -1) {
          const newBoard = [...board];
          newBoard[bestMove] = 'O';
          setBoard(newBoard);
          setIsXNext(true);
        }
      }, 500);
      return () => clearTimeout(botTimer);
    }
  }, [board, isXNext, mode, winner]);

  return { board, isXNext, winner, handlePress };
}
