import {ROWS, COLUMNS, BOMBS} from "./constants";
import {Cell, CellValue, CellState} from "./types";

const grabAllAdjacentCells = (
    cells: Cell[][],
    rowParam: number,
    colParam: number
): {
    topLeftCell: Cell | null;
    topCell: Cell | null;
    topRightCell: Cell | null;
    leftCell: Cell | null;
    rightCell: Cell | null;
    bottomLeftCell: Cell | null;
    bottomCell: Cell | null;
    bottomRightCell: Cell | null;
} => {
    const topLeftCell =
        rowParam > 0 && colParam > 0 ? cells[rowParam - 1][colParam - 1] : null;
    const topCell = rowParam > 0 ? cells[rowParam - 1][colParam] : null;
    const topRightCell =
        rowParam > 0 && colParam < COLUMNS - 1
            ? cells[rowParam - 1][colParam + 1]
            : null;
    const leftCell = colParam > 0 ? cells[rowParam][colParam - 1] : null;
    const rightCell =
        colParam < COLUMNS - 1 ? cells[rowParam][colParam + 1] : null;
    const bottomLeftCell =
        rowParam < ROWS - 1 && colParam > 0
            ? cells[rowParam + 1][colParam - 1]
            : null;
    const bottomCell =
        rowParam < ROWS - 1 ? cells[rowParam + 1][colParam] : null;
    const bottomRightCell =
        rowParam < ROWS - 1 && colParam < COLUMNS - 1
            ? cells[rowParam + 1][colParam + 1]
            : null;

    return {
        topLeftCell,
        topCell,
        topRightCell,
        leftCell,
        rightCell,
        bottomLeftCell,
        bottomCell,
        bottomRightCell
    };
};

export const makeCells = () => {
    let cells: Cell[][] = [];

    for (let row = 0; row < ROWS; row++) {
        cells.push([])
        for (let columns = 0; columns < COLUMNS; columns++) {
            cells[row].push({
                value: CellValue.none,
                state: CellState.open
            });
        }
    }
    let bombs = 0;
    while (bombs < BOMBS) {
        const randomRow = Math.floor(Math.random() * ROWS);
        const randomCol = Math.floor(Math.random() * COLUMNS);

        const currentCell = cells[randomRow][randomCol];
        if (currentCell.value !== CellValue.bomb) {
            cells = cells.map((row, rowIndex) =>
                row.map((cell, colIndex) => {
                    if (randomRow === rowIndex && randomCol === colIndex) {
                        return {
                            ...cell,
                            value: CellValue.bomb
                        };
                    }
                    return cell;
                })
            );
            bombs++;
        }
    }

    for (let rowIndex = 0; rowIndex < ROWS; rowIndex++) {
        for (let colIndex = 0; colIndex < COLUMNS; colIndex++) {
            const currentCell = cells[rowIndex][colIndex];
            if (currentCell.value === CellValue.bomb) {
                continue;
            }

            let numberOfBombs = 0;
            const {
                topLeftCell,
                topCell,
                topRightCell,
                leftCell,
                rightCell,
                bottomLeftCell,
                bottomCell,
                bottomRightCell
            } = grabAllAdjacentCells(cells, rowIndex, colIndex);

            if (topLeftCell?.value === CellValue.bomb) {
                numberOfBombs++;
            }
            if (topCell?.value === CellValue.bomb) {
                numberOfBombs++;
            }
            if (topRightCell?.value === CellValue.bomb) {
                numberOfBombs++;
            }
            if (leftCell?.value === CellValue.bomb) {
                numberOfBombs++;
            }
            if (rightCell?.value === CellValue.bomb) {
                numberOfBombs++;
            }
            if (bottomLeftCell?.value === CellValue.bomb) {
                numberOfBombs++;
            }
            if (bottomCell?.value === CellValue.bomb) {
                numberOfBombs++;
            }
            if (bottomRightCell?.value === CellValue.bomb) {
                numberOfBombs++;
            }

            if (numberOfBombs > 0) {
                cells[rowIndex][colIndex] = {
                    ...currentCell,
                    value: numberOfBombs
                };
            }
        }
    }

    return cells
}

export const openMultipleCells = (
    cells: Cell[][],
    rowParam: number,
    colParam: number
): Cell[][] => {
    const currentCell = cells[rowParam][colParam];

    if (
        currentCell.state === CellState.visible ||
        currentCell.state === CellState.flagged
    ) {
        return cells;
    }

    let newCells = cells.slice();
    newCells[rowParam][colParam].state = CellState.visible;

    const {
        topLeftCell,
        topCell,
        topRightCell,
        leftCell,
        rightCell,
        bottomLeftCell,
        bottomCell,
        bottomRightCell
    } = grabAllAdjacentCells(cells, rowParam, colParam);

    if (
        topLeftCell?.state === CellState.open &&
        topLeftCell.value !== CellValue.bomb
    ) {
        if (topLeftCell.value === CellValue.none) {
            newCells = openMultipleCells(newCells, rowParam - 1, colParam - 1);
        } else {
            newCells[rowParam - 1][colParam - 1].state = CellState.visible;
        }
    }

    if (topCell?.state === CellState.open && topCell.value !== CellValue.bomb) {
        if (topCell.value === CellValue.none) {
            newCells = openMultipleCells(newCells, rowParam - 1, colParam);
        } else {
            newCells[rowParam - 1][colParam].state = CellState.visible;
        }
    }

    if (
        topRightCell?.state === CellState.open &&
        topRightCell.value !== CellValue.bomb
    ) {
        if (topRightCell.value === CellValue.none) {
            newCells = openMultipleCells(newCells, rowParam - 1, colParam + 1);
        } else {
            newCells[rowParam - 1][colParam + 1].state = CellState.visible;
        }
    }

    if (leftCell?.state === CellState.open && leftCell.value !== CellValue.bomb) {
        if (leftCell.value === CellValue.none) {
            newCells = openMultipleCells(newCells, rowParam, colParam - 1);
        } else {
            newCells[rowParam][colParam - 1].state = CellState.visible;
        }
    }

    if (
        rightCell?.state === CellState.open &&
        rightCell.value !== CellValue.bomb
    ) {
        if (rightCell.value === CellValue.none) {
            newCells = openMultipleCells(newCells, rowParam, colParam + 1);
        } else {
            newCells[rowParam][colParam + 1].state = CellState.visible;
        }
    }

    if (
        bottomLeftCell?.state === CellState.open &&
        bottomLeftCell.value !== CellValue.bomb
    ) {
        if (bottomLeftCell.value === CellValue.none) {
            newCells = openMultipleCells(newCells, rowParam + 1, colParam - 1);
        } else {
            newCells[rowParam + 1][colParam - 1].state = CellState.visible;
        }
    }

    if (
        bottomCell?.state === CellState.open &&
        bottomCell.value !== CellValue.bomb
    ) {
        if (bottomCell.value === CellValue.none) {
            newCells = openMultipleCells(newCells, rowParam + 1, colParam);
        } else {
            newCells[rowParam + 1][colParam].state = CellState.visible;
        }
    }

    if (
        bottomRightCell?.state === CellState.open &&
        bottomRightCell.value !== CellValue.bomb
    ) {
        if (bottomRightCell.value === CellValue.none) {
            newCells = openMultipleCells(newCells, rowParam + 1, colParam + 1);
        } else {
            newCells[rowParam + 1][colParam + 1].state = CellState.visible;
        }
    }

    return newCells;
};
