import { useState, useEffect, useCallback, useRef } from 'react';
import { Header } from '@/components/Header';
import { GridWorld } from '@/components/GridWorld';
import { ControlPanel } from '@/components/ControlPanel';
import { InfoPanel } from '@/components/InfoPanel';
import { GridEditor } from '@/components/GridEditor';
import { StepExplanation } from '@/components/StepExplanation';
import { ConvergenceGraph } from '@/components/ConvergenceGraph';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  MDPState,
  CellType,
  Cell,
  createInitialState,
  valueIterationStep,
  policyIterationStep,
} from '@/lib/mdp';

const Index = () => {
  const [state, setState] = useState<MDPState>(createInitialState());
  const [algorithm, setAlgorithm] = useState<'value' | 'policy'>('value');
  const [showValues, setShowValues] = useState(true);
  const [showPolicy, setShowPolicy] = useState(true);
  const [showDelta, setShowDelta] = useState(true);
  const [isRunning, setIsRunning] = useState(false);
  const [selectedTool, setSelectedTool] = useState<CellType | null>(null);
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null);
  const [previousGrid, setPreviousGrid] = useState<Cell[][] | null>(null);
  const [deltaHistory, setDeltaHistory] = useState<number[]>([]);
  const runTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const handleStep = useCallback(() => {
    setState((prev) => {
      // Store previous grid for comparison
      setPreviousGrid(prev.grid.map(row => row.map(cell => ({ ...cell }))));
      
      const stepFn = algorithm === 'value' ? valueIterationStep : policyIterationStep;
      const newState = stepFn(prev);
      
      // Add delta to history
      setDeltaHistory(h => [...h, newState.delta]);
      
      return newState;
    });
  }, [algorithm]);

  const handleReset = useCallback(() => {
    setIsRunning(false);
    setPreviousGrid(null);
    setDeltaHistory([]);
    setSelectedCell(null);
    setState((prev) => ({
      ...createInitialState(),
      gamma: prev.gamma,
      grid: prev.grid.map(row => 
        row.map(cell => ({
          ...cell,
          value: 0,
          policy: null,
        }))
      ),
    }));
  }, []);

  const handleGammaChange = useCallback((gamma: number) => {
    setState((prev) => ({ ...prev, gamma }));
    handleReset();
  }, [handleReset]);

  const handleAlgorithmChange = useCallback((newAlgorithm: 'value' | 'policy') => {
    setAlgorithm(newAlgorithm);
    handleReset();
  }, [handleReset]);

  const handleCellClick = useCallback((row: number, col: number) => {
    if (selectedTool) {
      setState((prev) => {
        const newGrid = prev.grid.map((r, ri) =>
          r.map((cell, ci) => {
            if (ri === row && ci === col) {
              return { ...cell, type: selectedTool, value: 0, policy: null };
            }
            return cell;
          })
        );
        return { ...prev, grid: newGrid, iteration: 0, converged: false, delta: 0 };
      });
      setPreviousGrid(null);
      setDeltaHistory([]);
    } else {
      // Select cell for explanation
      setSelectedCell(prev => 
        prev?.row === row && prev?.col === col ? null : { row, col }
      );
    }
  }, [selectedTool]);

  const handleRun = useCallback(() => {
    setIsRunning((prev) => !prev);
  }, []);

  // Auto-run effect
  useEffect(() => {
    if (!isRunning || state.converged) {
      if (runTimerRef.current) {
        clearInterval(runTimerRef.current);
        runTimerRef.current = null;
      }
      if (state.converged) setIsRunning(false);
      return;
    }

    if (!runTimerRef.current) {
      handleStep();
      runTimerRef.current = setInterval(() => {
        handleStep();
      }, 1000);
    }

    return () => {
      if (runTimerRef.current) {
        clearInterval(runTimerRef.current);
        runTimerRef.current = null;
      }
    };
  }, [isRunning, state.converged, handleStep]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-[1fr,360px] gap-6">
          {/* Main Grid Area */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <GridEditor 
                selectedTool={selectedTool}
                onToolSelect={setSelectedTool}
              />
              <div className="flex items-center gap-2">
                <Switch
                  id="show-delta"
                  checked={showDelta}
                  onCheckedChange={setShowDelta}
                />
                <Label htmlFor="show-delta" className="text-sm cursor-pointer">Show Changes</Label>
              </div>
            </div>
            
            <GridWorld
              grid={state.grid}
              previousGrid={previousGrid}
              showValues={showValues}
              showPolicy={showPolicy}
              animatePolicy={!state.converged}
              showDelta={showDelta}
              selectedCell={selectedCell}
              onCellClick={handleCellClick}
            />
            
            {/* Step Explanation */}
            <StepExplanation 
              state={state}
              algorithm={algorithm}
              selectedCell={selectedCell}
            />
            
            {/* Convergence Graph */}
            <ConvergenceGraph deltaHistory={deltaHistory} />
            
            <InfoPanel />
          </div>

          {/* Control Panel Sidebar */}
          <div className="lg:sticky lg:top-6 h-fit space-y-4">
            <ControlPanel
              algorithm={algorithm}
              onAlgorithmChange={handleAlgorithmChange}
              gamma={state.gamma}
              onGammaChange={handleGammaChange}
              showValues={showValues}
              onShowValuesChange={setShowValues}
              showPolicy={showPolicy}
              onShowPolicyChange={setShowPolicy}
              onStep={handleStep}
              onRun={handleRun}
              onReset={handleReset}
              isRunning={isRunning}
              iteration={state.iteration}
              converged={state.converged}
              delta={state.delta}
            />
          </div>
        </div>
      </main>

      <footer className="border-t border-border/50 py-4 text-center text-sm text-muted-foreground">
      </footer>
    </div>
  );
};

export default Index;
