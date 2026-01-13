# Grid-World MDP Visualizer (Value Iteration & Policy Iteration)

A small web-based project for visualizing **Markov Decision Processes (MDPs)** in a **Grid-World** environment.  
It demonstrates how **Value Iteration** and **Policy Iteration** converge to an optimal policy under stochastic transitions.

## Features
- Grid-world with obstacles and terminal states (Goal / Negative terminal)
- Stochastic transition model (e.g., 80% intended move, 20% random/slip)
- Value function visualization (numbers / heatmap)
- Policy visualization using directional arrows
- Step-by-step iteration view + Run / Reset controls
- Adjustable discount factor (γ)

## Algorithms
- **Value Iteration** (Bellman optimality updates until convergence)
- **Policy Iteration** (policy evaluation + policy improvement)

## How to Run
> Clone the repo
- Install dependencies: `npm install` 
- Start the app: `npm run dev` 
