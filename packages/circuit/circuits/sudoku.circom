pragma circom 2.0.8;

include "utils.circom";
include "circomlib/gates.circom";

template sudoku() {
    signal input packedPuzzle[2];
    signal input solution[81];
    signal output solved;

    component unpacker = UnpackDigits(2, 41);
    unpacker.packedPuzzle <== packedPuzzle;

    component puzzleValidator = IsValidPuzzle();
    component solutionValidator = IsValidSolution();
    component solutionPuzzleMatcher = IsValidSolutionOfPuzzle();

    for (var i = 0; i < 81; i++) {
        puzzleValidator.puzzle[i] <== unpacker.digits[i];
        solutionValidator.solution[i] <== solution[i];
        solutionPuzzleMatcher.solution[i] <== solution[i];
        solutionPuzzleMatcher.puzzle[i] <== unpacker.digits[i];
    }

    component multiAnd = MultiAND(3);
    multiAnd.in[0] <== puzzleValidator.result;
    multiAnd.in[1] <== solutionValidator.result;
    multiAnd.in[2] <== solutionPuzzleMatcher.result;

    solved <== multiAnd.out;
}

component main {public [packedPuzzle]} = sudoku();