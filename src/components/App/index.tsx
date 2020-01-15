import React, { useState, useEffect } from 'react';
import NumberDisplay from '../NumberDisplay';
import Button from '../Button';
import { generateCells, openMultipleCells } from '../../utils';
import { Face, Cell, CellState, CellValue } from '../../types/index';
import './App.scss'
import { MAX_ROWS, MAX_COLS } from '../../constants/index';

const App: React.FC = () => {
  const [cells, setCells] = useState<Cell[][]>(generateCells());
  const [face, setFace] = useState<Face>(Face.smile);
  let [time, setTime] = useState<number>(0);
  const [live, setLive] = useState<boolean>(false);
  const [bombCounter, setBombCounter] = useState<number>(10);
  const [lost, setLost] = useState<boolean>(false);
  const [won, setWon] = useState<boolean>(false);

  useEffect(() => {
    const handleMouseDown = (): void => {
      setFace(Face.oh);
    };

    const handleMouseUp = (): void => {
      setFace(Face.smile);
    };

    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
    }
  }, [])

  useEffect(() => {
    if(live && time < 999) {
      const timer = setInterval(() => {setTime(time + 1)}, 1000);
      return () => clearInterval(timer);
    }
  }, [live, time])

  useEffect(() => {
    if (lost) setFace(Face.lost)
    setLive(false)
  }, [lost])

  useEffect(() => {
    if (won) setFace(Face.won)
    setLive(false)
  }, [won])

  const handleCellClick = (rowParam: number, colParam: number) => (): void => {
    let newCells = cells.slice();

    // start the game
    if (!live) {
      let isABomb = newCells[rowParam][colParam].value === CellValue.bomb;
      while (isABomb) {
        newCells = generateCells();
        if (newCells[rowParam][colParam].value !== CellValue.bomb) {
          isABomb = false;
          break;
        }
      }
      setLive(true);
    }

    const currentCell = newCells[rowParam][colParam];

    if ([CellState.flagged, CellState.visible].includes(currentCell.state)) {
      return;
    }

    if (currentCell.value === CellValue.bomb) {
      setLost(true);
      newCells[rowParam][colParam].clicked = true;
      newCells = showAllBombs();
      setCells(newCells);
      return;
    } else if (currentCell.value === CellValue.none) {
      newCells = openMultipleCells(newCells, rowParam, colParam);
    } else {
      newCells[rowParam][colParam].state = CellState.visible;
    }

    // Check to see if you have won
    let safeOpenCellsExists = false;
    for (let row = 0; row < MAX_ROWS; row++) {
      for (let col = 0; col < MAX_COLS; col++) {
        const currentCell = newCells[row][col];

        if (
          currentCell.value !== CellValue.bomb &&
          currentCell.state === CellState.open
        ) {
          safeOpenCellsExists = true;
          break;
        }
      }
    }

    if (!safeOpenCellsExists) {
      newCells = newCells.map(row =>
        row.map(cell => {
          if (cell.value === CellValue.bomb) {
            return {
              ...cell,
              state: CellState.flagged
            };
          }
          return cell;
        })
      );
      setWon(true);
    }

    setCells(newCells);
  };

  const handleContextCellClick = (rowParam: number, colParam: number) => (e: React.MouseEvent<HTMLDivElement, MouseEvent>): void => {
    e.preventDefault();
    if (!live) return;
    const currentCell = cells[rowParam][colParam];
    const currentCells = [...cells];

    if (currentCell.state === CellState.visible) return;
    else if(currentCell.state === CellState.open) {
      currentCells[rowParam][colParam].state = CellState.flagged;
      setBombCounter(bombCounter - 1)
      setCells(currentCells)
    } else if(currentCell.state === CellState.flagged) {
      currentCells[rowParam][colParam].state = CellState.open;
      setBombCounter(bombCounter + 1)
      setCells(currentCells)
    }
  }

  const handleFaceClick = (): void => {
    setLive(false);
    setTime(0);
    setCells(generateCells());
    setLost(false);
    setWon(false);
  }



  const renderCells = (): React.ReactNode => {
    return cells.map((row, rowIndex) => row.map((cell, colIndex) => (
      <Button
        state={cell.state}
        value={cell.value}
        row={rowIndex}
        col={colIndex}
        clicked={cell.clicked}
        key={`${rowIndex}_${colIndex}`}
        onClick={handleCellClick}
        onContext={handleContextCellClick}
      />
    )));
  }

  const showAllBombs = (): Cell[][] => {
    const currentCells = [...cells];
    return currentCells.map(row => row.map((cell) => {
      if (cell.value === CellValue.bomb) {
        return {
          ...cell,
          state: CellState.visible,
        }
      };

      return cell;
    }))
  }

  return (
    <div className="App">
      <div className="Header">
        <NumberDisplay value={bombCounter} />
        <div className="Face" onClick={handleFaceClick}>
          <span role="image" ariel-label="face">{face}</span>
        </div>
        <NumberDisplay value={time} />
      </div>
      <div className="Body">{renderCells()}</div>
    </div>
  )
}

export default App;