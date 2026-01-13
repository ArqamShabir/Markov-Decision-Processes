import { Cell, CellType } from '@/lib/mdp';
import { GridCell } from './GridCell';

interface GridWorldProps {
  grid: Cell[][];
  previousGrid?: Cell[][] | null;
  showValues: boolean;
  showPolicy: boolean;
  showDelta?: boolean;
  selectedCell?: { row: number; col: number } | null;
  onCellClick?: (row: number, col: number) => void;
}

export function GridWorld({ 
  grid, 
  previousGrid,
  showValues, 
  showPolicy, 
  showDelta = false,
  selectedCell,
  onCellClick 
}: GridWorldProps) {
  // Calculate min and max values for heatmap
  const allValues = grid.flat()
    .filter(cell => cell.type === 'empty')
    .map(cell => cell.value);
  
  const minValue = allValues.length > 0 ? Math.min(...allValues) : 0;
  const maxValue = allValues.length > 0 ? Math.max(...allValues) : 0;

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
              showDelta={showDelta}
              minValue={minValue}
              maxValue={maxValue}
              previousValue={previousGrid?.[rowIdx]?.[colIdx]?.value}
              isSelected={selectedCell?.row === rowIdx && selectedCell?.col === colIdx}
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
