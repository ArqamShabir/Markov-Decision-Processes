import { Cell, CellType } from '@/lib/mdp';
import { Button } from '@/components/ui/button';
import { Target, Skull, Square, Eraser } from 'lucide-react';
import { cn } from '@/lib/utils';

interface GridEditorProps {
  selectedTool: CellType | null;
  onToolSelect: (tool: CellType | null) => void;
}

const tools: { type: CellType; icon: React.ReactNode; label: string; color: string }[] = [
  { type: 'goal', icon: <Target className="w-4 h-4" />, label: 'Goal', color: 'text-accent' },
  { type: 'danger', icon: <Skull className="w-4 h-4" />, label: 'Danger', color: 'text-destructive' },
  { type: 'obstacle', icon: <Square className="w-4 h-4" />, label: 'Wall', color: 'text-muted-foreground' },
  { type: 'empty', icon: <Eraser className="w-4 h-4" />, label: 'Clear', color: 'text-foreground' },
];

export function GridEditor({ selectedTool, onToolSelect }: GridEditorProps) {
  return (
    <div className="glass-panel p-4">
      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
        Edit Grid
      </h3>
      <div className="flex gap-2 flex-wrap">
        {tools.map(({ type, icon, label, color }) => (
          <Button
            key={type}
            variant={selectedTool === type ? 'default' : 'outline'}
            size="sm"
            onClick={() => onToolSelect(selectedTool === type ? null : type)}
            className={cn(
              'gap-1.5',
              selectedTool !== type && color
            )}
          >
            {icon}
            <span className="text-xs">{label}</span>
          </Button>
        ))}
      </div>
      <p className="text-xs text-muted-foreground mt-2">
        Click grid cells to place selected element
      </p>
    </div>
  );
}
