import React, {useEffect, useState} from 'react';
import './App.css';
import Display from "../Display";
import {makeCells, openMultipleCells} from "../../makeCells";
import CellButton from "../CellButton";
import {Cell, Smile, CellValue, CellState} from "../../makeCells/types";
import {COLUMNS, ROWS} from "../../makeCells/constants";

const App: React.FC = () => {
    const [cells, setCells] = useState<Cell[][]>(makeCells())
    const [smile, setSmile] = useState<Smile>(Smile.smile)
    const [time, setTimer] = useState<number>(0)
    const [gameOn, setGameOn] = useState<boolean>(false)
    const [bombCounter, setBombCounter] = useState<number>(40);
    const [hasLost, setHasLost] = useState<boolean>(false);
    const [hasWon, setHasWon] = useState<boolean>(false);

    useEffect(() => {
        if (gameOn && time < 999) {
            const timer = setInterval(() => {
                setTimer(time + 1);
            }, 1000);

            return () => {
                clearInterval(timer);
            };
        }
    }, [gameOn, time]);

    useEffect(() => {
        if (hasLost) {
            setGameOn(false);
            setSmile(Smile.lost);
        }
    }, [hasLost]);

    useEffect(() => {
        if (hasWon) {
            setGameOn(false);
            setSmile(Smile.won);
            setBombCounter(0)
        }
    }, [hasWon]);

    useEffect(() => {
        const handleMousedown = (): void => {
            setSmile(Smile.oh)
        }
        const handleMouseUp = (): void => {
            setSmile(Smile.smile)
        }
        window.addEventListener("mousedown", handleMousedown)
        window.addEventListener("mouseup", handleMouseUp)

        return () => {
            window.removeEventListener("mousedown", handleMousedown);
            window.removeEventListener("mouseup", handleMouseUp);
        };
    }, [])

    const cellClick = (rowParam: number, colParam: number) => ():void => {
        let newCells = cells.slice();

        if (!gameOn) {
            let isABomb = newCells[rowParam][colParam].value === CellValue.bomb;
            while (isABomb) {
                newCells = makeCells();
                if (newCells[rowParam][colParam].value !== CellValue.bomb) {
                    isABomb = false;
                    break;
                }
            }
            setGameOn(true);
        }

        const currentCell = newCells[rowParam][colParam];

        if ([CellState.flagged, CellState.visible].includes(currentCell.state)) {
            return;
        }

        if (currentCell.value === CellValue.bomb) {
            setHasLost(true);
            newCells[rowParam][colParam].red = true;
            newCells = showAllBombs();
            setCells(newCells);
            return;
        } else if (currentCell.value === CellValue.none) {
            newCells = openMultipleCells(newCells, rowParam, colParam);
        } else {
            newCells[rowParam][colParam].state = CellState.visible;
        }

        let safeOpenCellsExists = false;
        for (let row = 0; row < ROWS; row++) {
            for (let col = 0; col < COLUMNS; col++) {
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
            setHasWon(true);
        }

        setCells(newCells);
    }

    const handleCellContext = (rowParam: number, colParam: number) => (
        e: React.MouseEvent<HTMLDivElement, MouseEvent>
    ): void => {
        e.preventDefault();

        if (!gameOn) {
            return;
        }

        const currentCells = cells.slice();
        const currentCell = cells[rowParam][colParam];

        if (currentCell.state === CellState.visible) {
            return;
        } else if (currentCell.state === CellState.open) {
            currentCells[rowParam][colParam].state = CellState.flagged;
            setCells(currentCells);
            setBombCounter(bombCounter - 1);
        } else if (currentCell.state === CellState.flagged) {
            currentCells[rowParam][colParam].state = CellState.question;
            setCells(currentCells);
            setBombCounter(bombCounter + 1);
        } else if (currentCell.state === CellState.question) {
            currentCells[rowParam][colParam].state = CellState.open;
            setCells(currentCells);
        }
    };

    const handleFaceClick = (): void => {
        setGameOn(false);
        setTimer(0);
        setCells(makeCells());
        setHasLost(false);
        setBombCounter(40)
        setHasWon(false);
    };

    const mapCells =(): React.ReactNode => {
        return cells.map((it, rowIndex) => {
            return it.map((it, colIndex) =>
                <CellButton
                key={`${rowIndex}-${colIndex}`}
                state={it.state}
                value={it.value}
                row={rowIndex}
                col={colIndex}
                onClick={cellClick}
                onContext={handleCellContext}
                red={it.red}
                />)
        })
    }

    const showAllBombs = (): Cell[][] => {
        const currentCells = cells.slice();
        return currentCells.map(row =>
            row.map(cell => {
                if (cell.value === CellValue.bomb) {
                    return {
                        ...cell,
                        state: CellState.visible
                    };
                }

                return cell;
            })
        );
    };

    return (
        <div className="App">
            <div className="Header">
                <Display value={bombCounter}/>
                <div className="Smile" onClick={handleFaceClick}>
                    <span role="img" aria-label="smile">
                        {smile}
                    </span>
                </div>
                <Display value={time}/>
            </div>
            <div className={`Body ${
                hasLost ? "disabled" : ""
            }`}
            >{mapCells()}</div>
        </div>
    );
}

export default App;
