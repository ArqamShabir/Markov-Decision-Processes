import { Cell } from '@/lib/mdp';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface IterationSnapshot {
  iteration: number;
  grid: Cell[][];
  delta: number;
  timestamp: number;
}

interface IterationHistoryProps {
  history: IterationSnapshot[];
  currentIteration: number;
  onSelectIteration: (index: number) => void;
}

export function IterationHistory({ history, currentIteration, onSelectIteration }: IterationHistoryProps) {
  if (history.length === 0) {
    return (
      <div className="glass-panel p-4 text-center text-muted-foreground text-sm">
        <p>No iterations yet. Press Step or Run to begin!</p>
      </div>
    );
  }

  return (
    <div className="glass-panel p-4">
      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
        Iteration History
      </h3>
      <div className="space-y-2 max-h-48 overflow-y-auto scrollbar-thin">
        {history.map((snapshot, index) => {
          const isActive = index === currentIteration - 1;
          const deltaChange = index > 0 
            ? snapshot.delta - history[index - 1].delta 
            : 0;
          
          return (
            <button
              key={snapshot.iteration}
              onClick={() => onSelectIteration(index)}
              className={cn(
                'w-full flex items-center justify-between p-2 rounded-md transition-all',
                'hover:bg-muted/50',
                isActive && 'bg-primary/20 border border-primary/50'
              )}
            >
              <div className="flex items-center gap-2">
                <span className={cn(
                  'w-6 h-6 rounded-full flex items-center justify-center text-xs font-mono font-bold',
                  isActive ? 'bg-primary text-primary-foreground' : 'bg-muted'
                )}>
                  {snapshot.iteration}
                </span>
                <span className="text-sm">Iteration {snapshot.iteration}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-muted-foreground">
                  Δ {snapshot.delta.toFixed(4)}
                </span>
                {deltaChange < -0.001 && (
                  <TrendingDown className="w-3 h-3 text-accent" />
                )}
                {deltaChange > 0.001 && (
                  <TrendingUp className="w-3 h-3 text-destructive" />
                )}
                {Math.abs(deltaChange) <= 0.001 && index > 0 && (
                  <Minus className="w-3 h-3 text-muted-foreground" />
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export type { IterationSnapshot };
