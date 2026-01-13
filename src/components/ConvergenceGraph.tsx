import { cn } from '@/lib/utils';

interface ConvergenceGraphProps {
  deltaHistory: number[];
  maxIterations?: number;
}

export function ConvergenceGraph({ deltaHistory, maxIterations = 30 }: ConvergenceGraphProps) {
  if (deltaHistory.length === 0) {
    return null;
  }

  const displayData = deltaHistory.slice(-maxIterations);
  const maxDelta = Math.max(...displayData, 0.001);
  const minDelta = Math.min(...displayData);
  
  const getHeight = (delta: number) => {
    if (maxDelta === minDelta) return 50;
    return Math.max(5, ((delta - minDelta) / (maxDelta - minDelta)) * 100);
  };

  return (
    <div className="glass-panel p-4">
      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
        Convergence Progress
      </h3>
      
      <div className="relative h-24 flex items-end gap-0.5">
        {displayData.map((delta, index) => (
          <div
            key={index}
            className="flex-1 min-w-[4px] max-w-[12px] transition-all duration-300 rounded-t group relative"
            style={{
              height: `${getHeight(delta)}%`,
              background: delta < 0.001 
                ? 'hsl(var(--accent))' 
                : delta < 0.1 
                  ? 'hsl(var(--primary))'
                  : 'hsl(var(--muted-foreground))',
            }}
          >
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-1.5 py-0.5 bg-popover text-popover-foreground text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap font-mono z-10 shadow-lg">
              Iter {deltaHistory.length - displayData.length + index + 1}: Δ={delta.toFixed(5)}
            </div>
          </div>
        ))}
      </div>
      
      <div className="flex justify-between text-[10px] text-muted-foreground mt-2 font-mono">
        <span>Iter {Math.max(1, deltaHistory.length - maxIterations + 1)}</span>
        <span>Δ scale: {minDelta.toFixed(4)} - {maxDelta.toFixed(4)}</span>
        <span>Iter {deltaHistory.length}</span>
      </div>
      
      <div className="flex items-center gap-4 mt-2 text-[10px]">
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-sm bg-muted-foreground"></div>
          <span className="text-muted-foreground">Large Δ</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-sm bg-primary"></div>
          <span className="text-muted-foreground">Medium Δ</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-sm bg-accent"></div>
          <span className="text-muted-foreground">Converging</span>
        </div>
      </div>
    </div>
  );
}
