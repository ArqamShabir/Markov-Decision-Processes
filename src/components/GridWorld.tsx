import { Cell, ACTION_DELTAS, Action } from '@/lib/mdp';
import { GridCell } from './GridCell';

interface GridWorldProps {
  grid: Cell[][];
  previousGrid?: Cell[][] | null;
  showValues: boolean;
  showPolicy: boolean;
  showDelta?: boolean;
  animatePolicy?: boolean;
  selectedCell?: { row: number; col: number } | null;
  onCellClick?: (row: number, col: number) => void;
}

export function GridWorld({ 
  grid, 
  previousGrid,
  showValues, 
  showPolicy, 
  showDelta = false,
  animatePolicy = true,
  selectedCell,
  onCellClick 
}: GridWorldProps) {
  const startCell = { row: grid.length - 1, col: 0 };
  const maxSteps = grid.length * grid[0].length;

  // Calculate min and max values for heatmap
  const allValues = grid.flat()
    .filter(cell => cell.type === 'empty')
    .map(cell => cell.value);
  
  const minValue = allValues.length > 0 ? Math.min(...allValues) : 0;
  const maxValue = allValues.length > 0 ? Math.max(...allValues) : 0;
  
  const pathOrderMap = new Map<string, number>();
  if (showPolicy) {
    let currentRow = startCell.row;
    let currentCol = startCell.col;
    const visited = new Set<string>();
    let steps = 0;

    while (steps < maxSteps) {
      const key = `${currentRow}-${currentCol}`;
      if (visited.has(key)) break;
      visited.add(key);

      const cell = grid[currentRow]?.[currentCol];
      if (!cell || cell.type !== 'empty' || !cell.policy) break;

      pathOrderMap.set(key, animatePolicy ? steps : 0);
      steps += 1;

      const [dr, dc] = ACTION_DELTAS[cell.policy as Action];
      const nextRow = currentRow + dr;
      const nextCol = currentCol + dc;

      if (
        nextRow < 0 ||
        nextRow >= grid.length ||
        nextCol < 0 ||
        nextCol >= grid[0].length ||
        grid[nextRow][nextCol].type === 'obstacle'
      ) {
        break;
      }

      if (grid[nextRow][nextCol].type === 'goal' || grid[nextRow][nextCol].type === 'danger') {
        break;
      }

      currentRow = nextRow;
      currentCol = nextCol;
    }
  }

  const policyDelayMap = new Map<string, number>();
  if (showPolicy) {
    let nonPathIndex = 0;
    const pathLength = pathOrderMap.size;
    grid.forEach((row, rowIdx) => {
      row.forEach((cell, colIdx) => {
        if (cell.type === 'empty' && cell.policy) {
          const key = `${rowIdx}-${colIdx}`;
          const pathOrder = pathOrderMap.get(key);
          if (pathOrder !== undefined) {
            policyDelayMap.set(key, pathOrder);
          } else {
            policyDelayMap.set(key, animatePolicy ? pathLength + nonPathIndex : 0);
            if (animatePolicy) {
              nonPathIndex += 1;
            }
          }
        }
      });
    });
  }

  return (
    <div className="glass-panel p-6">
      <div 
        className="grid gap-2"
        style={{
          gridTemplateColumns: `repeat(${grid[0]?.length || 4}, 1fr)`,
        }}
      >
        {grid.map((row, rowIdx) =>
          row.map((cell, colIdx) => (
            <GridCell
              key={`${rowIdx}-${colIdx}`}
              cell={cell}
              showValues={showValues}
              showPolicy={showPolicy}
              policyDelaySeconds={policyDelayMap.get(`${rowIdx}-${colIdx}`) ?? 0}
              showDelta={showDelta}
              minValue={minValue}
              maxValue={maxValue}
              previousValue={previousGrid?.[rowIdx]?.[colIdx]?.value}
              isSelected={selectedCell?.row === rowIdx && selectedCell?.col === colIdx}
              isStart={rowIdx === startCell.row && colIdx === startCell.col}
              isPath={pathOrderMap.has(`${rowIdx}-${colIdx}`)}
              pathDelaySeconds={pathOrderMap.get(`${rowIdx}-${colIdx}`) ?? 0}
              onClick={() => onCellClick?.(rowIdx, colIdx)}
            />
          ))
        )}
      </div>
      
      {/* Legend */}
      <div className="flex flex-wrap gap-4 mt-6 pt-4 border-t border-border/50 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-accent/30 border border-accent"></div>
          <span>Goal (+10)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-destructive/30 border border-destructive"></div>
          <span>Danger (-10)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-muted"></div>
          <span>Obstacle</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-card border border-border/50"></div>
          <span>Empty (-0.1/step)</span>
        </div>
      </div>
    </div>
  );
}
