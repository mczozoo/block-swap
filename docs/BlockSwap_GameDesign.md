# Block Swap — Game Design Document (Prototype Version)

## 1. Core Pitch
**Block Swap** is a casual logic puzzle where players swap tiles on a grid to recreate a target pattern. The game is designed for both mobile and desktop browsers, using simple tap or click interactions. The goal is to solve as many puzzles as possible, each requiring careful observation and minimal moves.

## 2. Core Mechanic
- Each level shows a **target pattern** (arrangement of colors, symbols, or icons).
- The player has a **scrambled version** of the same grid.
- By **tapping two tiles**, the player swaps their positions.
- When all tiles match the target pattern, the level is complete.

## 3. Controls
- **Tap or click** two tiles to swap them.
- Optional future enhancement: **drag to swap** (for mobile polish).
- No continuous touch, multi-touch, or keyboard input required.

## 4. Visuals (Prototype)
- Simple grid layout with clear tile boundaries.
- Colored squares or basic icons as placeholder visuals.
- Target pattern displayed above or beside the grid.
- Minimal HUD: level number, move counter, and restart button.

## 5. Difficulty & Progression
- Start with a **3x3 grid** (easy) → progress to 4x4 and 5x5.
- Later add obstacles like **locked tiles** (cannot be swapped).
- Introduce **limited-move challenges** for advanced levels.

## 6. Prototype Goals
Validate that the **swap mechanic feels intuitive and satisfying**.
For MVP success:
- Levels are completable without confusion.
- Players enjoy replaying to optimize move count.
- Minimal UI and graphics are sufficient to understand the concept.

## 7. Level System (Prototype)
- Level data can be stored as a 2D array of IDs.
- The target and scrambled versions are stored separately.
- MVP: static handcrafted levels (3–5 total). Later: random shuffling that ensures solvability.

## 8. Scoring & Feedback
- Count number of swaps per level.
- Optional star rating system (3 stars = solved under par moves).
- Visual feedback: small pop animation or glow on solved tiles.
- “Level Complete” panel with next button.

## 9. Monetization Plan (Post-Validation)
- **Interstitial ads** after every 3–4 completed levels.
- **Rewarded ads** for a single hint (highlight two correct tiles to swap).
- Future: cosmetic themes (tile skins, patterns).

## 10. Accessibility & UX
- Large tap areas for mobile users.
- High contrast colors and simple shapes.
- No time limits in MVP.
- Clear “undo” and “restart” buttons.

## 11. Prototype Build Plan

### Phase A — MVP (1–2 Days)
**Goal:** Functional prototype proving the fun of swapping tiles.

1. **Grid Setup**
   - Implement N×N grid (start with 3×3).
   - Store tiles as objects with `id`, `row`, `col`, `targetRow`, `targetCol`.
   - Draw tiles with color or placeholder icons.

2. **Swap Mechanic**
   - First tap: select tile (highlight it).
   - Second tap: swap with first tile.
   - Deselect both after swap.

3. **Win Condition**
   - After each swap, check if all tiles are in target positions.
   - On success → show “Level Complete” panel.

4. **Level Data**
   - Hardcode 3–5 small puzzles in JSON or array form.
   - Each level: target + scrambled layout.

5. **UI**
   - Simple top bar: Level #, Moves, Restart button.
   - “Next Level” and “Restart” panels on completion.

6. **Code Structure (Recommended)**
```
/src
  main.js          # entry point
  game-loop.js     # update/render cycle
  grid.js          # tile logic and win checking
  input.js         # tap/click management
  ui.js            # HUD and panels
  levels.js        # level data
  config.js        # constants (grid size, colors, etc.)
index.html
style.css
```

### Phase B — Feedback & Polish (1 Day)
- Add tile highlight when selected.
- Add small pop animation on correct placement.
- Add soft sound effects (swap, complete).
- Tune difficulty progression (3×3 → 4×4).

### Phase C — Optional Add-ons
- **Hints:** show two tiles that should be swapped (for rewarded ad later).
- **Locked tiles:** static obstacles for advanced levels.
- **Daily Challenge:** single shuffled puzzle per day (for retention).

## 12. Tuning Parameters (MVP Defaults)
- Grid size: 3×3 (expandable to 5×5).
- Tile size: dynamic (fit to screen with padding).
- Animation duration: 0.15s swap, 0.25s solve pop.
- Max moves (optional): 20 for 3×3, 40 for 4×4.
- Colors: 6–8 distinct hues with good contrast.

## 13. Playtest Criteria
A successful MVP should show:
- Avg session length ≥ 3 minutes.
- Level completion rate ≥ 70%.
- ≥ 80% of testers understand controls without tutorial.
- Most players replay at least one level to improve score.

## 14. Expansion Ideas (Post-Prototype)
- Larger grids (6×6+).
- Pattern variants: symbols, flags, emojis.
- Unlockable themes (via rewarded ads).
- Procedural generation ensuring solvable puzzles.
- Add “limited swaps” and “time attack” modes.

---

**Summary:**  
Block Swap combines the immediate clarity of “swap-to-solve” with endless variety and instant accessibility. Its tap-only control scheme ensures perfect playability across desktop and mobile, while its small grid logic enables rapid iteration and scaling after validation.
