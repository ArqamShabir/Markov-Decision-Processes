import { Cell } from '@/lib/mdp';
import { cn } from '@/lib/utils';
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight, TrendingUp, TrendingDown } from 'lucide-react';

interface CellUpdateTrackerProps {
  previousGrid: Cell[][] | null;
  currentGrid: Cell[][];
  showOnlyChanged?: boolean;
}

export function CellUpdateTracker({ previousGrid, currentGrid, showOnlyChanged = true }: CellUpdateTrackerProps) {
  if (!previousGrid) {
    return (
      <div className="glass-panel p-4">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Cell Value Changes
        </h3>
        <p className="text-sm text-muted-foreground text-center py-4">
          Run the first iteration to see changes
        </p>
      </div>
    );
  }

  const changes: {
    row: number;
    col: number;
    oldValue: number;
    newValue: number;
    oldPolicy: string | null;
    newPolicy: string | null;
    delta: number;
  }[] = [];

  for (let r = 0; r < currentGrid.length; r++) {
    for (let c = 0; c < currentGrid[0].length; c++) {
      const prev = previousGrid[r][c];
      const curr = currentGrid[r][c];
      
      if (curr.type === 'empty') {
        const delta = curr.value - prev.value;
        if (!showOnlyChanged || Math.abs(delta) > 0.0001 || prev.policy !== curr.policy) {
          changes.push({
            row: r,
            col: c,
            oldValue: prev.value,
            newValue: curr.value,
            oldPolicy: prev.policy,
            newPolicy: curr.policy,
            delta,
          });
        }
      }
    }
  }

  const policyIcons = {
    up: ArrowUp,
    down: ArrowDown,
    left: ArrowLeft,
    right: ArrowRight,
  };

  return (
    <div className="glass-panel p-4">
      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
        Cell Value Changes ({changes.length} cells)
      </h3>
      
      {changes.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-4">
          No changes in this iteration (converged)
        </p>
      ) : (
        <div className="space-y-2 max-h-64 overflow-y-auto scrollbar-thin">
          {changes.map((change, index) => {
            const OldIcon = change.oldPolicy ? policyIcons[change.oldPolicy as keyof typeof policyIcons] : null;
            const NewIcon = change.newPolicy ? policyIcons[change.newPolicy as keyof typeof policyIcons] : null;
            const policyChanged = change.oldPolicy !== change.newPolicy;
            
            return (
              <div
                key={`${change.row}-${change.col}`}
                className={cn(
                  'p-2 rounded-md border transition-all',
                  change.delta > 0 
                    ? 'bg-accent/10 border-accent/30' 
                    : change.delta < 0 
                      ? 'bg-destructive/10 border-destructive/30'
                      : 'bg-muted/50 border-border/50'
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-sm font-bold">
                    Cell ({change.row}, {change.col})
                  </span>
                  <div className="flex items-center gap-1">
                    {change.delta > 0 ? (
                      <TrendingUp className="w-3 h-3 text-accent" />
                    ) : change.delta < 0 ? (
                      <TrendingDown className="w-3 h-3 text-destructive" />
                    ) : null}
                    <span className={cn(
                      'font-mono text-xs',
                      change.delta > 0 ? 'text-accent' : change.delta < 0 ? 'text-destructive' : 'text-muted-foreground'
                    )}>
                      {change.delta >= 0 ? '+' : ''}{change.delta.toFixed(4)}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between mt-1 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">Value:</span>
                    <span className="font-mono text-muted-foreground">{change.oldValue.toFixed(3)}</span>
                    <span className="text-muted-foreground">→</span>
                    <span className="font-mono font-bold">{change.newValue.toFixed(3)}</span>
                  </div>
                  
                  {policyChanged && NewIcon && (
                    <div className="flex items-center gap-1">
                      <span className="text-muted-foreground">Policy:</span>
                      {OldIcon && <OldIcon className="w-3 h-3 text-muted-foreground" />}
                      <span className="text-muted-foreground">→</span>
                      <NewIcon className="w-3 h-3 text-primary" />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
