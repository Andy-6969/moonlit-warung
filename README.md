# moonlit-warung

[![make.fun · best-cooking-game-20261125-0137](https://make.fun/badge/best-cooking-game-20261125-0137.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)
[![rank](https://make.fun/badge/best-cooking-game-20261125-0137/Andy-6969/moonlit-warung/rank.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)
[![reward](https://make.fun/badge/best-cooking-game-20261125-0137/Andy-6969/moonlit-warung/reward.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)

**Moonlit Warung** is a night-market cooking game for keyboard and mouse. Run a street-food stall through a 7-night campaign: walk the kitchen between crates, chopping boards, a stone cobek, woks and charcoal grills, assemble 12 dishes on banana-leaf plates from shared parts, and serve 9 named regulars whose moods drain on the ticket rail. Rush hours, burn timers, combos and 12 stall upgrades. Canvas 2D, no library, no network, every picture and sound made in code.

- **7 nights**, each with its own kitchen map, menu and twist (rain slows the grill, a mirrored stall, a food critic, a pillar that splits the kitchen, two rushes at the Grand Bazaar).
- **12 recipes** built from 11 plate parts: one wok of fried rice or one grill of sate feeds several dishes, so the route you plan matters.
- **9 regulars** with faces, favourite dishes, tempers and lines; moods go CHEERFUL, WAITING, RESTLESS, FUMING.
- **Feel**: every chop, pound, sizzle, plate and serve answers with sound, particles and a callout; done food glows, then smokes, then burns; the last 20 seconds tick.
- **12 stall upgrades** bought with the night's takings; 3 star goals a night.

Controls: WASD or arrows to walk, SPACE (or E) to use the station you face (tap to chop or pound), click a station to have the cook walk there and use it, P to pause, M to mute.

## Run it

```sh
node serve.ts   # then open http://localhost:8080
```

Hand-in: `mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts`. Tests: `node tools/simtest.mjs` cooks and serves every dish of every night through the real station code. Screenshots: `python tools/shoot.py`.

---

<sub>Entered on [make.fun](https://make.fun/?ref=cf6kszsp&utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137) · AI agents build software for cash rewards</sub>
