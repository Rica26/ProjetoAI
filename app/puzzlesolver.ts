import { isSolved, isSolvable, PuzzleState } from "./puzzleLogic";

const getValidMoves = (state: PuzzleState, gridRow: number, gridCol: number): PuzzleState[] => {
  const emptyIndex = state.findIndex((piece) => piece === null);
  const emptyRow = Math.floor(emptyIndex / gridCol);
  const emptyCol = emptyIndex % gridCol;

  const directions = [
    { row: -1, col: 0 }, //cima
    { row: 1, col: 0 }, //baixo
    { row: 0, col: -1 },
    { row: 0, col: 1 },
  ];

  const moves: PuzzleState[] = [];

  for (const { row: dRow, col: dCol } of directions) {
    const newRow = emptyRow + dRow;
    const newCol = emptyCol + dCol;
    if (newRow >= 0 && newRow < gridRow && newCol >= 0 && newCol < gridCol) {
      const newEmptyIndex = newRow * gridCol + newCol;
      const newState = [...state];
      [newState[emptyIndex], newState[newEmptyIndex]] = [newState[newEmptyIndex], newState[emptyIndex]];
      moves.push(newState);
    }
  }
  return moves;
};

const manhattanDistance = (state: PuzzleState, gridRow: number, gridCol: number, targetState: PuzzleState): number => {
  let distance = 0;
  for (let i = 0; i < state.length; i++) {
    if (state[i] !== null) {
      const currentRow = Math.floor(i / gridCol);
      const currentCol = i % gridCol;
      const targetIndex = targetState.indexOf(state[i])!;
      const targetRow = Math.floor(targetIndex / gridCol);
      const targetCol = targetIndex % gridCol;
      distance += Math.abs(currentRow - targetRow) + Math.abs(currentCol - targetCol);
    }
  }
  return distance;
};

export const aStarSolve = (
  initialState: PuzzleState,
  targetState: PuzzleState,
  gridRow: number,
  gridCol: number
): PuzzleState[] | null => {
  const openList: { state: PuzzleState; path: PuzzleState[]; g: number; h: number; f: number }[] = [];
  const closedList = new Set<string>();

  openList.push({
    state: initialState,
    path: [],
    g: 0,
    h: manhattanDistance(initialState, gridRow, gridCol, targetState),
    f: manhattanDistance(initialState, gridRow, gridCol, targetState),
  });

  while (openList.length > 0) {
    openList.sort((a, b) => a.f - b.f);
    const current = openList.shift()!;

    if (isSolved(current.state, targetState)) {
      return current.path;
    }

    closedList.add(JSON.stringify(current.state));
    const validMoves = getValidMoves(current.state, gridRow, gridCol);
    for (const move of validMoves) {
      const moveKey = JSON.stringify(move);

      if (!closedList.has(moveKey)) {
        const g = current.g + 1;
        const h = manhattanDistance(move, gridRow, gridCol, targetState);
        const f = g + h;

        openList.push({
          state: move,
          path: [...current.path, move],
          g,
          h,
          f,
        });
      }
    }
  }
  return null;
};

export const bfsSolve = (
  initialState: PuzzleState,
  targetState: PuzzleState,
  gridRow: number,
  gridCol: number
): PuzzleState[] | null => {
  if (!isSolvable(initialState, gridCol)) {
    console.log("Puzzle is not solvable");
    return null;
  }

  const queue: { state: PuzzleState; path: PuzzleState[] }[] = [{ state: initialState, path: [] }];
  const visited = new Set<string>();
  visited.add(JSON.stringify(initialState));

  while (queue.length > 0) {
    const { state, path } = queue.shift()!;

    if (isSolved(state, targetState)) {
      return path;
    }

    const validMoves = getValidMoves(state, gridRow, gridCol);
    for (const move of validMoves) {
      const moveKey = JSON.stringify(move);
      if (!visited.has(moveKey)) {
        visited.add(moveKey);
        queue.push({
          state: move,
          path: [...path, move],
        });
      }
    }
  }

  console.log("No solution found");
  return null;
};

export const idaStarSolve = (
  initialState: PuzzleState,
  targetState: PuzzleState,
  gridRow: number,
  gridCol: number
): PuzzleState[] | null => {
  const maxDepth = 1000; // Defina um limite de profundidade
  let threshold = manhattanDistance(initialState, gridRow, gridCol, targetState);
  let solutionPath: PuzzleState[] = []; // Inicializa o caminho da solução

  // Função recursiva de busca em profundidade iterativa (IDA*)
  const search = (state: PuzzleState, g: number, path: PuzzleState[], threshold: number): number => {
    const f = g + manhattanDistance(state, gridRow, gridCol, targetState);

    if (f > threshold) return f; // Retorna o valor de f se exceder o limite

    if (isSolved(state, targetState)) {
      solutionPath = [...path, state]; // Atualiza o caminho com a solução encontrada
      return -1; // Retorna -1 para indicar que encontrou a solução
    }

    let min = Infinity;

    // Pegando os movimentos válidos
    const validMoves = getValidMoves(state, gridRow, gridCol);
    for (const move of validMoves) {
      // Evita estados repetidos no caminho
      if (!path.includes(move)) {
        const newPath = [...path, state];
        const result = search(move, g + 1, newPath, threshold); // Chama recursão

        if (result === -1) return -1; // Se encontrou a solução, retorna
        if (result < min) min = result; // Atualiza o valor mínimo de threshold
      }
    }

    return min; // Retorna o melhor limite encontrado
  };

  // Loop principal do IDA*, que aumenta o threshold até encontrar a solução
  while (true) {
    const result = search(initialState, 0, [], threshold); // Chama a busca com threshold atual

    if (result === -1) {
      return solutionPath; // Se encontrou a solução, retorna o caminho
    }

    if (result === Infinity || result > maxDepth) {
      return null; // Retorna null se atingiu o limite máximo de profundidade
    }

    threshold = result; // Atualiza o threshold e tenta novamente
  }
};
