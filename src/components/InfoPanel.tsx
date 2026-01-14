import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export function InfoPanel() {
  return (
    <div className="glass-panel p-6">
      <Tabs defaultValue="mdp" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-muted mb-4">
          <TabsTrigger value="mdp">MDP</TabsTrigger>
          <TabsTrigger value="value">Value Iter.</TabsTrigger>
          <TabsTrigger value="policy">Policy Iter.</TabsTrigger>
        </TabsList>
        
        <TabsContent value="mdp" className="text-sm space-y-4 text-muted-foreground">
          <div>
            <h4 className="font-semibold text-foreground mb-2">MDP Definition</h4>
            <ul className="space-y-1 ml-4 list-disc">
              <li><strong>States (S):</strong> Each grid cell</li>
              <li><strong>Actions (A):</strong> Up, Down, Left, Right</li>
              <li><strong>Transition P(s'|s,a):</strong> 80% intended, 10% each perpendicular</li>
              <li><strong>Rewards:</strong> Goal: +10, Danger: -10, Step: -0.1</li>
              <li><strong>γ:</strong> Discount factor (adjustable)</li>
            </ul>
          </div>
        </TabsContent>
        
        <TabsContent value="value" className="text-sm space-y-4 text-muted-foreground">
          <div>
            <h4 className="font-semibold text-foreground mb-2">Value Iteration</h4>
            <p className="mb-2">
              Iteratively updates value function until convergence, then extracts policy.
            </p>
            <ol className="space-y-1 ml-4 list-decimal">
              <li>Initialize V(s) = 0 for all states</li>
              <li>For each state, compute V(s) using Bellman update</li>
              <li>Repeat until max|Δ| &lt; θ (convergence)</li>
              <li>Extract optimal policy from final values</li>
            </ol>
          </div>
          <div>
            <h4 className="font-semibold text-foreground mb-2">Complexity</h4>
            <p>O(|S|²|A|) per iteration</p>
          </div>
        </TabsContent>
        
        <TabsContent value="policy" className="text-sm space-y-4 text-muted-foreground">
          <div>
            <h4 className="font-semibold text-foreground mb-2">Policy Iteration</h4>
            <p className="mb-2">
              Alternates between policy evaluation and policy improvement.
            </p>
            <ol className="space-y-1 ml-4 list-decimal">
              <li>Initialize random policy π</li>
              <li><strong>Evaluate:</strong> Compute V<sup>π</sup>(s) for current policy</li>
              <li><strong>Improve:</strong> Update π(s) = argmax<sub>a</sub> Q(s,a)</li>
              <li>Repeat until policy is stable</li>
            </ol>
          </div>
          <div>
            <h4 className="font-semibold text-foreground mb-2">Complexity</h4>
            <p>Fewer iterations than VI, but each is O(|S|³)</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
