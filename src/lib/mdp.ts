// MDP Types and Core Logic

export type CellType = 'empty' | 'goal' | 'danger' | 'obstacle';
export type Action = 'up' | 'down' | 'left' | 'right';

export interface Cell {
  type: CellType;
  value: number;
  policy: Action | null;
  row: number;
  col: number;
}

export interface MDPState {
  grid: Cell[][];
  rows: number;
  cols: number;
  gamma: number;
  goalReward: number;
  dangerReward: number;
  stepCost: number;
  transitionProbability: number;
  iteration: number;
  converged: boolean;
  delta: number;
}

export const ACTIONS: Action[] = ['up', 'down', 'left', 'right'];

export const ACTION_DELTAS: Record<Action, [number, number]> = {
  up: [-1, 0],
  down: [1, 0],
  left: [0, -1],
  right: [0, 1],
};

export const PERPENDICULAR_ACTIONS: Record<Action, Action[]> = {
  up: ['left', 'right'],
  down: ['left', 'right'],
  left: ['up', 'down'],
  right: ['up', 'down'],
};

// Create initial grid
export function createInitialGrid(rows: number, cols: number): Cell[][] {
  const grid: Cell[][] = [];
  
  for (let r = 0; r < rows; r++) {
    const row: Cell[] = [];
    for (let c = 0; c < cols; c++) {
      row.push({
        type: 'empty',
        value: 0,
        policy: null,
        row: r,
        col: c,
      });
    }
    grid.push(row);
  }
  
  return grid;
}

// Create default 4x4 grid world
export function createDefaultGrid(): Cell[][] {
  const grid = createInitialGrid(4, 4);
  
  // Set goal state (top-right corner)
  grid[0][3].type = 'goal';
  
  // Set danger state
  grid[1][3].type = 'danger';
  
  // Set obstacles
  grid[1][1].type = 'obstacle';
  
  return grid;
}

// Get next state given current position and action
function getNextState(
  grid: Cell[][],
  row: number,
  col: number,
  action: Action
): [number, number] {
  const [dr, dc] = ACTION_DELTAS[action];
  const newRow = row + dr;
  const newCol = col + dc;
  
  // Check bounds
  if (newRow < 0 || newRow >= grid.length || newCol < 0 || newCol >= grid[0].length) {
    return [row, col];
  }
  
  // Check obstacle
  if (grid[newRow][newCol].type === 'obstacle') {
    return [row, col];
  }
  
  return [newRow, newCol];
}

// Get reward for a state
function getReward(cell: Cell, goalReward: number, dangerReward: number, stepCost: number): number {
  if (cell.type === 'goal') return goalReward;
  if (cell.type === 'danger') return dangerReward;
  return stepCost;
}

// Calculate expected value for an action
function calculateActionValue(
  grid: Cell[][],
  row: number,
  col: number,
  action: Action,
  gamma: number,
  transitionProb: number,
  goalReward: number,
  dangerReward: number,
  stepCost: number
): number {
  let expectedValue = 0;
  
  // Intended direction (80%)
  const [intendedRow, intendedCol] = getNextState(grid, row, col, action);
  const intendedCell = grid[intendedRow][intendedCol];
  const intendedReward = getReward(intendedCell, goalReward, dangerReward, stepCost);
  expectedValue += transitionProb * (intendedReward + gamma * intendedCell.value);
  
  // Perpendicular directions (20% split)
  const perpActions = PERPENDICULAR_ACTIONS[action];
  const perpProb = (1 - transitionProb) / 2;
  
  for (const perpAction of perpActions) {
    const [perpRow, perpCol] = getNextState(grid, row, col, perpAction);
    const perpCell = grid[perpRow][perpCol];
    const perpReward = getReward(perpCell, goalReward, dangerReward, stepCost);
    expectedValue += perpProb * (perpReward + gamma * perpCell.value);
  }
  
  return expectedValue;
}

// Value Iteration - Single Step
export function valueIterationStep(state: MDPState): MDPState {
  const { grid, gamma, transitionProbability, goalReward, dangerReward, stepCost } = state;
  const newGrid = grid.map(row => row.map(cell => ({ ...cell })));
  let maxDelta = 0;
  
  for (let r = 0; r < grid.length; r++) {
    for (let c = 0; c < grid[0].length; c++) {
      const cell = grid[r][c];
      
      // Skip terminal and obstacle states
      if (cell.type === 'goal' || cell.type === 'danger' || cell.type === 'obstacle') {
        if (cell.type === 'goal') newGrid[r][c].value = goalReward;
        if (cell.type === 'danger') newGrid[r][c].value = dangerReward;
        continue;
      }
      
      // Find best action
      let bestValue = -Infinity;
      let bestAction: Action = 'up';
      
      for (const action of ACTIONS) {
        const value = calculateActionValue(
          grid, r, c, action, gamma, transitionProbability,
          goalReward, dangerReward, stepCost
        );
        
        if (value > bestValue) {
          bestValue = value;
          bestAction = action;
        }
      }
      
      const delta = Math.abs(newGrid[r][c].value - bestValue);
      maxDelta = Math.max(maxDelta, delta);
      
      newGrid[r][c].value = bestValue;
      newGrid[r][c].policy = bestAction;
    }
  }
  
  return {
    ...state,
    grid: newGrid,
    iteration: state.iteration + 1,
    delta: maxDelta,
    converged: maxDelta < 0.0001,
  };
}

// Policy Iteration - Policy Evaluation
function policyEvaluation(
  grid: Cell[][],
  gamma: number,
  transitionProbability: number,
  goalReward: number,
  dangerReward: number,
  stepCost: number,
  maxIterations: number = 100
): Cell[][] {
  let newGrid = grid.map(row => row.map(cell => ({ ...cell })));
  
  for (let iter = 0; iter < maxIterations; iter++) {
    let maxDelta = 0;
    const tempGrid = newGrid.map(row => row.map(cell => ({ ...cell })));
    
    for (let r = 0; r < grid.length; r++) {
      for (let c = 0; c < grid[0].length; c++) {
        const cell = tempGrid[r][c];
        
        if (cell.type === 'goal' || cell.type === 'danger' || cell.type === 'obstacle') {
          if (cell.type === 'goal') tempGrid[r][c].value = goalReward;
          if (cell.type === 'danger') tempGrid[r][c].value = dangerReward;
          continue;
        }
        
        const policy = cell.policy || 'up';
        const newValue = calculateActionValue(
          newGrid, r, c, policy, gamma, transitionProbability,
          goalReward, dangerReward, stepCost
        );
        
        maxDelta = Math.max(maxDelta, Math.abs(cell.value - newValue));
        tempGrid[r][c].value = newValue;
      }
    }
    
    newGrid = tempGrid;
    if (maxDelta < 0.0001) break;
  }
  
  return newGrid;
}

// Policy Iteration - Single Step
export function policyIterationStep(state: MDPState): MDPState {
  const { grid, gamma, transitionProbability, goalReward, dangerReward, stepCost } = state;
  
  // Initialize random policy if first iteration
  let currentGrid = grid.map(row => row.map(cell => ({
    ...cell,
    policy: cell.policy || (cell.type === 'empty' ? 'up' as Action : null),
  })));
  
  // Policy Evaluation
  currentGrid = policyEvaluation(
    currentGrid, gamma, transitionProbability,
    goalReward, dangerReward, stepCost
  );
  
  // Policy Improvement
  let policyStable = true;
  const newGrid = currentGrid.map(row => row.map(cell => ({ ...cell })));
  
  for (let r = 0; r < currentGrid.length; r++) {
    for (let c = 0; c < currentGrid[0].length; c++) {
      const cell = currentGrid[r][c];
      
      if (cell.type === 'goal' || cell.type === 'danger' || cell.type === 'obstacle') {
        continue;
      }
      
      const oldPolicy = cell.policy;
      let bestValue = -Infinity;
      let bestAction: Action = 'up';
      
      for (const action of ACTIONS) {
        const value = calculateActionValue(
          currentGrid, r, c, action, gamma, transitionProbability,
          goalReward, dangerReward, stepCost
        );
        
        if (value > bestValue) {
          bestValue = value;
          bestAction = action;
        }
      }
      
      newGrid[r][c].policy = bestAction;
      
      if (oldPolicy !== bestAction) {
        policyStable = false;
      }
    }
  }
  
  // Calculate delta for visualization
  let maxDelta = 0;
  for (let r = 0; r < grid.length; r++) {
    for (let c = 0; c < grid[0].length; c++) {
      maxDelta = Math.max(maxDelta, Math.abs(grid[r][c].value - newGrid[r][c].value));
    }
  }
  
  return {
    ...state,
    grid: newGrid,
    iteration: state.iteration + 1,
    delta: maxDelta,
    converged: policyStable,
  };
}

// Run algorithm until convergence
export function runUntilConvergence(
  state: MDPState,
  algorithm: 'value' | 'policy',
  maxIterations: number = 1000
): MDPState {
  let currentState = { ...state };
  const stepFn = algorithm === 'value' ? valueIterationStep : policyIterationStep;
  
  for (let i = 0; i < maxIterations && !currentState.converged; i++) {
    currentState = stepFn(currentState);
  }
  
  return currentState;
}

// Get initial MDP state
export function createInitialState(): MDPState {
  return {
    grid: createDefaultGrid(),
    rows: 4,
    cols: 4,
    gamma: 0.9,
    goalReward: 10,
    dangerReward: -10,
    stepCost: -0.1,
    transitionProbability: 0.8,
    iteration: 0,
    converged: false,
    delta: 0,
  };
}
