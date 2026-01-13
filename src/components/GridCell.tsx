import { Cell, Action } from '@/lib/mdp';
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Target, Skull, Square } from 'lucide-react';
import { cn } from '@/lib/utils';

interface GridCellProps {
  cell: Cell;
  showValues: boolean;
  showPolicy: boolean;
  minValue: number;
  maxValue: number;
  onClick?: () => void;
  previousValue?: number;
  isSelected?: boolean;
  showDelta?: boolean;
}

const PolicyArrow = ({ action }: { action: Action }) => {
  const icons = {
    up: ArrowUp,
    down: ArrowDown,
    left: ArrowLeft,
    right: ArrowRight,
  };
  const Icon = icons[action];
  return <Icon className="w-6 h-6 policy-arrow" />;
};

function getValueColor(value: number, minValue: number, maxValue: number): string {
  if (minValue === maxValue) return 'bg-muted';
  
  const range = maxValue - minValue;
  const normalized = (value - minValue) / range;
  
  // Cold (blue) to Warm (red) gradient
  if (normalized < 0.5) {
    // Blue to neutral
    const intensity = Math.round((1 - normalized * 2) * 100);
    return `bg-primary/${Math.max(20, intensity)}`;
  } else {
    // Neutral to red
    const intensity = Math.round((normalized - 0.5) * 2 * 100);
    return `bg-destructive/${Math.max(20, intensity)}`;
  }
}

export function GridCell({ 
  cell, 
  showValues, 
  showPolicy, 
  minValue, 
  maxValue, 
  onClick,
  previousValue,
  isSelected,
  showDelta = false,
}: GridCellProps) {
  const getCellStyle = () => {
    switch (cell.type) {
      case 'goal':
        return 'bg-accent/30 border-accent border-2';
      case 'danger':
        return 'bg-destructive/30 border-destructive border-2';
      case 'obstacle':
        return 'bg-muted border-muted-foreground/20';
      default:
        if (showValues && cell.value !== 0) {
          return 'border-border/50';
        }
        return 'bg-card border-border/50';
    }
  };

  const getValueBackground = () => {
    if (cell.type !== 'empty' || !showValues) return {};
    
    if (cell.value === 0) return {};
    
    const normalized = maxValue !== minValue 
      ? (cell.value - minValue) / (maxValue - minValue) 
      : 0.5;
    
    const hue = 200 - normalized * 200;
    const saturation = 70;
    const lightness = 20 + normalized * 15;
    
    return {
      backgroundColor: `hsl(${hue}, ${saturation}%, ${lightness}%)`,
    };
  };

  const getCellIcon = () => {
    switch (cell.type) {
      case 'goal':
        return <Target className="w-8 h-8 text-accent" />;
      case 'danger':
        return <Skull className="w-8 h-8 text-destructive" />;
      case 'obstacle':
        return <Square className="w-8 h-8 text-muted-foreground/50 fill-muted-foreground/30" />;
      default:
        return null;
    }
  };

  const delta = previousValue !== undefined ? cell.value - previousValue : 0;
  const hasChanged = Math.abs(delta) > 0.0001;

  return (
    <div
      onClick={onClick}
      className={cn(
        'grid-cell aspect-square cursor-pointer relative',
        'transition-all duration-300 ease-out',
        'hover:scale-105 hover:z-10 hover:shadow-lg hover:shadow-primary/20',
        'rounded-md overflow-hidden',
        getCellStyle(),
        isSelected && 'ring-2 ring-primary ring-offset-2 ring-offset-background scale-105 z-20',
        hasChanged && showDelta && 'animate-pulse'
      )}
      style={getValueBackground()}
    >
      {/* Delta indicator */}
      {showDelta && hasChanged && cell.type === 'empty' && (
        <div className={cn(
          'absolute top-0 left-0 right-0 text-center text-[9px] font-mono py-0.5',
          delta > 0 ? 'bg-accent/40 text-accent' : 'bg-destructive/40 text-destructive'
        )}>
          {delta > 0 ? '+' : ''}{delta.toFixed(3)}
        </div>
      )}
      
      <div className="flex flex-col items-center justify-center w-full h-full p-2">
        {getCellIcon()}
        
        {cell.type === 'empty' && (
          <>
            {showPolicy && cell.policy && (
              <div className="absolute">
                <PolicyArrow action={cell.policy} />
              </div>
            )}
            
            {showValues && (
              <div className={cn(
                'value-display absolute bottom-1 right-1',
                'text-[10px] opacity-80 font-mono',
                cell.value >= 0 ? 'text-accent' : 'text-destructive'
              )}>
                {cell.value.toFixed(2)}
              </div>
            )}
          </>
        )}
        
        {(cell.type === 'goal' || cell.type === 'danger') && showValues && (
          <div className={cn(
            'value-display text-xs mt-1 font-mono font-bold',
            cell.type === 'goal' ? 'text-accent' : 'text-destructive'
          )}>
            {cell.type === 'goal' ? '+10' : '-10'}
          </div>
        )}
      </div>
    </div>
  );
}
