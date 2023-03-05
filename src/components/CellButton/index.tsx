import React from 'react';
import './CellButton.css'
import {CellState, CellValue} from "../../makeCells/types";

interface CellButtonProps {
    row: number;
    col: number;
    state: CellState;
    value: CellValue;
    onClick(rowParam: number, colParam: number): (...args: any[]) => void;
    onContext(rowParam: number, colParam: number): (...args: any[]) => void;
    red?: boolean;
}

const CellButton: React.FC<CellButtonProps> = ({row, col, state, value, onClick, onContext, red}) => {
    const renderContent = (): React.ReactNode => {
        if (state === CellState.visible) {
            if (value === CellValue.bomb) {
                return (
                    <span role="img" aria-label="bomb">
            💣
          </span>
                );
            } else if (value === CellValue.none) {
                return null;
            }

            return value;
        } else if (state === CellState.flagged) {
            return (
                <span role="img" aria-label="flag">
          🚩
        </span>
            );
        } else if (state === CellState.question) {
            return (
                <span className="question" aria-label="question">
          ?
        </span>
            );
        }

        return null;
    };

    return (
        <div className={`CellButton ${
            state === CellState.visible ? "visible" : ""
        } value-${value} ${red ? "red" : ""}`}
             onClick={onClick(row, col)}
             onContextMenu={onContext(row, col)}>
            {renderContent()}
        </div>
    );
}

export default CellButton;
