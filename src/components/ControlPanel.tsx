import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Play, Pause, RotateCcw, SkipForward, FastForward } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ControlPanelProps {
  algorithm: 'value' | 'policy';
  onAlgorithmChange: (algorithm: 'value' | 'policy') => void;
  gamma: number;
  onGammaChange: (gamma: number) => void;
  showValues: boolean;
  onShowValuesChange: (show: boolean) => void;
  showPolicy: boolean;
  onShowPolicyChange: (show: boolean) => void;
  onStep: () => void;
  onRun: () => void;
  onReset: () => void;
  isRunning: boolean;
  iteration: number;
  converged: boolean;
  delta: number;
}

export function ControlPanel({
  algorithm,
  onAlgorithmChange,
  gamma,
  onGammaChange,
  showValues,
  onShowValuesChange,
  showPolicy,
  onShowPolicyChange,
  onStep,
  onRun,
  onReset,
  isRunning,
  iteration,
  converged,
  delta,
}: ControlPanelProps) {
  return (
    <div className="glass-panel p-6 space-y-6">
      <div>
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Algorithm
        </h3>
        <Tabs value={algorithm} onValueChange={(v) => onAlgorithmChange(v as 'value' | 'policy')}>
          <TabsList className="grid w-full grid-cols-2 bg-muted">
            <TabsTrigger 
              value="value"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              Value Iteration
            </TabsTrigger>
            <TabsTrigger 
              value="policy"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              Policy Iteration
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Discount Factor (γ)
        </h3>
        <div className="space-y-2">
          <Slider
            value={[gamma]}
            onValueChange={([value]) => onGammaChange(value)}
            min={0}
            max={1}
            step={0.01}
            className="w-full"
          />
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">0</span>
            <span className="font-mono text-primary font-semibold">{gamma.toFixed(2)}</span>
            <span className="text-muted-foreground">1</span>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          Visualization
        </h3>
        <div className="flex items-center justify-between">
          <Label htmlFor="show-values" className="cursor-pointer">Show Values</Label>
          <Switch
            id="show-values"
            checked={showValues}
            onCheckedChange={onShowValuesChange}
          />
        </div>
        <div className="flex items-center justify-between">
          <Label htmlFor="show-policy" className="cursor-pointer">Show Policy</Label>
          <Switch
            id="show-policy"
            checked={showPolicy}
            onCheckedChange={onShowPolicyChange}
          />
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          Controls
        </h3>
        <div className="grid grid-cols-3 gap-2">
          <Button
            variant="outline"
            size="lg"
            onClick={onStep}
            disabled={converged || isRunning}
            className="flex-col h-auto py-3 gap-1"
          >
            <SkipForward className="w-5 h-5" />
            <span className="text-xs">Step</span>
          </Button>
          <Button
            variant={isRunning ? "destructive" : "default"}
            size="lg"
            onClick={onRun}
            disabled={converged && !isRunning}
            className="flex-col h-auto py-3 gap-1"
          >
            {isRunning ? <Pause className="w-5 h-5" /> : <FastForward className="w-5 h-5" />}
            <span className="text-xs">{isRunning ? 'Stop' : 'Run'}</span>
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={onReset}
            className="flex-col h-auto py-3 gap-1"
          >
            <RotateCcw className="w-5 h-5" />
            <span className="text-xs">Reset</span>
          </Button>
        </div>
      </div>

      <div className="pt-4 border-t border-border/50">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Statistics
        </h3>
        <div className="space-y-2 font-mono text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Iteration:</span>
            <span className="text-primary font-semibold">{iteration}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Max Δ:</span>
            <span className={cn(
              'font-semibold',
              delta < 0.001 ? 'text-accent' : 'text-foreground'
            )}>
              {delta.toFixed(6)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Status:</span>
            <span className={cn(
              'px-2 py-0.5 rounded text-xs font-semibold',
              converged 
                ? 'bg-accent/20 text-accent' 
                : 'bg-primary/20 text-primary'
            )}>
              {converged ? 'Converged' : 'Running'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
