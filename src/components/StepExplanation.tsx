import { Cell, MDPState, ACTIONS, ACTION_DELTAS, PERPENDICULAR_ACTIONS } from '@/lib/mdp';
import { cn } from '@/lib/utils';
import { Info, Calculator, ArrowRight, Target, Zap } from 'lucide-react';

interface StepExplanationProps {
  state: MDPState;
  algorithm: 'value' | 'policy';
  selectedCell: { row: number; col: number } | null;
}

function getNextState(
  grid: Cell[][],
  row: number,
  col: number,
  action: string
): [number, number] {
  const deltas = ACTION_DELTAS[action as keyof typeof ACTION_DELTAS];
  if (!deltas) return [row, col];
  
  const [dr, dc] = deltas;
  const newRow = row + dr;
  const newCol = col + dc;
  
  if (newRow < 0 || newRow >= grid.length || newCol < 0 || newCol >= grid[0].length) {
    return [row, col];
  }
  
  if (grid[newRow][newCol].type === 'obstacle') {
    return [row, col];
  }
  
  return [newRow, newCol];
}

export function StepExplanation({ state, algorithm, selectedCell }: StepExplanationProps) {
  const { grid, gamma, iteration, transitionProbability, stepCost, goalReward, dangerReward } = state;

  if (iteration === 0) {
    return (
      <div className="glass-panel p-4">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-primary mt-0.5" />
          <div>
            <h3 className="font-semibold text-sm mb-2">Ready to Start</h3>
            <p className="text-sm text-muted-foreground">
              All cells start with value 0. The goal has reward +{goalReward} and danger has penalty {dangerReward}.
              Each step costs {stepCost}. Press <span className="font-semibold text-primary">Step</span> to begin learning!
            </p>
            <div className="mt-3 p-3 bg-muted/30 rounded-md">
              <p className="text-xs text-muted-foreground font-mono">
                {algorithm === 'value' 
                  ? 'V(s) ← max_a Σ P(s\'|s,a)[R(s,a,s\') + γV(s\')]'
                  : 'Policy Iteration: Evaluate → Improve → Repeat'
                }
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (selectedCell) {
    const cell = grid[selectedCell.row][selectedCell.col];
    
    if (cell.type !== 'empty') {
      return (
        <div className="glass-panel p-4">
          <div className="flex items-start gap-3">
            <Target className="w-5 h-5 text-accent mt-0.5" />
            <div>
              <h3 className="font-semibold text-sm mb-2">
                {cell.type === 'goal' ? 'Goal State' : cell.type === 'danger' ? 'Danger State' : 'Obstacle'}
              </h3>
              <p className="text-sm text-muted-foreground">
                {cell.type === 'goal' && `This is a terminal state with reward +${goalReward}. The agent stops here.`}
                {cell.type === 'danger' && `This is a terminal state with penalty ${dangerReward}. The agent stops here.`}
                {cell.type === 'obstacle' && 'The agent cannot enter this cell.'}
              </p>
            </div>
          </div>
        </div>
      );
    }

    // Calculate action values for explanation
    const actionValues: { action: string; value: number; details: string }[] = [];
    
    for (const action of ACTIONS) {
      const [intendedRow, intendedCol] = getNextState(grid, selectedCell.row, selectedCell.col, action);
      const intendedCell = grid[intendedRow][intendedCol];
      const perpActions = PERPENDICULAR_ACTIONS[action];
      
      let expectedValue = 0;
      let details = '';
      
      // Intended direction
      const intendedReward = intendedCell.type === 'goal' ? goalReward : 
                            intendedCell.type === 'danger' ? dangerReward : stepCost;
      const intendedContrib = transitionProbability * (intendedReward + gamma * intendedCell.value);
      expectedValue += intendedContrib;
      details += `${(transitionProbability * 100).toFixed(0)}% → (${intendedRow},${intendedCol}): ${intendedContrib.toFixed(3)}`;
      
      // Perpendicular directions
      const perpProb = (1 - transitionProbability) / 2;
      for (const perpAction of perpActions) {
        const [perpRow, perpCol] = getNextState(grid, selectedCell.row, selectedCell.col, perpAction);
        const perpCell = grid[perpRow][perpCol];
        const perpReward = perpCell.type === 'goal' ? goalReward : 
                          perpCell.type === 'danger' ? dangerReward : stepCost;
        const perpContrib = perpProb * (perpReward + gamma * perpCell.value);
        expectedValue += perpContrib;
      }
      
      actionValues.push({ action, value: expectedValue, details });
    }
    
    const bestAction = actionValues.reduce((a, b) => a.value > b.value ? a : b);

    return (
      <div className="glass-panel p-4">
        <div className="flex items-start gap-3">
          <Calculator className="w-5 h-5 text-primary mt-0.5" />
          <div className="flex-1">
            <h3 className="font-semibold text-sm mb-2">
              Cell ({selectedCell.row}, {selectedCell.col}) - Value: {cell.value.toFixed(3)}
            </h3>
            <p className="text-xs text-muted-foreground mb-3">
              Expected value for each action (transition prob: {(transitionProbability * 100).toFixed(0)}%, γ = {gamma}):
            </p>
            <div className="grid grid-cols-2 gap-2">
              {actionValues.map(av => (
                <div 
                  key={av.action}
                  className={cn(
                    'p-2 rounded text-xs font-mono',
                    av.action === bestAction.action 
                      ? 'bg-primary/20 border border-primary/50' 
                      : 'bg-muted/30'
                  )}
                >
                  <div className="flex justify-between items-center">
                    <span className="uppercase font-bold">{av.action}</span>
                    <span className={cn(
                      av.action === bestAction.action ? 'text-primary font-bold' : 'text-muted-foreground'
                    )}>
                      {av.value.toFixed(3)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-3 flex items-center gap-2 text-xs">
              <Zap className="w-3 h-3 text-accent" />
              <span className="text-muted-foreground">Best action:</span>
              <span className="font-bold uppercase text-accent">{bestAction.action}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-panel p-4">
      <div className="flex items-start gap-3">
        <Info className="w-5 h-5 text-primary mt-0.5" />
        <div>
          <h3 className="font-semibold text-sm mb-2">Iteration {iteration}</h3>
          <p className="text-sm text-muted-foreground">
            {algorithm === 'value' ? (
              <>
                <span className="font-semibold text-primary">Value Iteration</span>: Updated all state values by finding the best action at each state. 
                Max change (Δ) this iteration: <span className="font-mono font-bold">{state.delta.toFixed(6)}</span>
              </>
            ) : (
              <>
                <span className="font-semibold text-primary">Policy Iteration</span>: Evaluated current policy, then improved it by choosing better actions.
                Max value change: <span className="font-mono font-bold">{state.delta.toFixed(6)}</span>
              </>
            )}
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            💡 Click on any cell to see the detailed value calculation!
          </p>
        </div>
      </div>
    </div>
  );
}
