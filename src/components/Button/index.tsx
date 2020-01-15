import React from 'react';
import { CellValue, CellState } from '../../types/index';
import './Button.scss';

interface ButtonProps {
  row: number,
  col: number,
  state: CellState,
  value: CellValue,
  onClick(rowParam: number, colParam: number): (e: React.MouseEvent) => void,
  onContext(rowParam: number, colParam: number): (...args: any[]) => void,
  clicked?: boolean,
  // (e: React.MouseEvent) => void,
}

const Button: React.FC<ButtonProps> = ({row, col, state, value, onClick, onContext, clicked}) => {

  const renderContent = () => {
    if (state === CellState.visible) {
      if (value === CellValue.bomb) return <span role="image" ariel-label="bomb">💣</span>
      return value === CellValue.none ? null : value;
    } else if (state === CellState.flagged) {
      return <span role="image" ariel-label="flag">🚩</span>
    }
    
  }
  

  return (
    <div
      className={`Button ${state === CellState.visible ? 'visible' : ''} value-${value} ${clicked ? 'red' : ''}`}
      onClick={onClick(row, col)}
      onContextMenu={onContext(row, col)}
    >
      {renderContent()}
    </div>
  )
}

export default Button;