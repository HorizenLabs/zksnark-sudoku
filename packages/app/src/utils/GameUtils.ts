import { makepuzzle, solvepuzzle } from 'sudoku';

function nullToZero(board: number[]) {
  return board.map((number) => (number === null ? 0 : number + 1));
}

function zeroToNull(board: number[]) {
  return board.map((number) => (number === 0 ? null : number - 1));
}

export function generatePuzzle(): number[] {
  const puzzle = makepuzzle();
  return nullToZero(puzzle);
}

export function getSolutionOfPuzzle(puzzle: number[]): number[] {
  const solution = solvepuzzle(zeroToNull(puzzle));
  return nullToZero(solution);
}

export function packDigits(puzzleArray: string | any[]) {
  const packed = [];
  let current = BigInt(0);
  let shift = 0;

  for (let i = 0; i < puzzleArray.length; i++) {
    current |= BigInt(puzzleArray[i]) << BigInt(shift);
    shift += 4;

    if (shift >= 64) {
      packed.push(current);
      current = BigInt(0);
      shift = 0;
    }
  }

  if (shift > 0) packed.push(current);
  return packed;
}
