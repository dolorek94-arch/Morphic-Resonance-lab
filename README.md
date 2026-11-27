# Morphic Resonance Lab

Experimental organic graphics technology. Resonance changes geometry, transfers between bodies and leaves decaying material memory. This repository is a graphics laboratory, with no game systems or engine migration.

## Local development

Requires Node.js 20.11 or newer (validated with 24.22.0).

```powershell
node scripts/serve.mjs
```

Open http://localhost:8000/ (or ?scene=lab) for the form laboratory. The earlier landscape remains at http://localhost:8000/?scene=world. No npm install or build step is needed. Three.js r170 is vendored with its MIT license; the current application runs without a CDN. Archived versions still use their original CDN imports.

```powershell
node --test
```

WASD moves relative to the camera. Click the canvas to capture the mouse, Escape releases it. Space sends an impulse; R restores the starting state. When Pointer Lock is unavailable, hold the left mouse button and drag to look. Desktop is the only development target; touch input and the mobile quality profile have been removed.

## Form laboratory

Select a target material (A soft, B dense, C long memory) and send an impulse. Only the selected body is directly excited. In the default held-connection mode, observe simulated form waves travelling along the existing necks before neighboring materials respond. Enable Zeitlupe for .35-speed simulation. Uncheck Verbindungen halten to restore automatic growth/retraction; this uses a latent neighbor graph. A is bean-shaped, B a dense rounded block, C a thin tapered membrane. The meters show reaction and retained memory. Emission is off by default; toggle it only for comparison. Reset clears body and internal chain state. The user confirmed merging, separation and return to rest in 0.8. The refined forms, necks, retraction and new resting/connected ground shadows have been observed in a local browser without captured console errors. Shadow visibility uses the same changing form field; the Shadows checkbox provides a direct-shadow comparison. Ambient occlusion remains enabled. User style feedback and camera/depth edge checks remain pending.

## Development status

0.9.0 is a desktop development candidate. Twenty-three Node tests pass. User-run 0.7.0 and 0.7.1 landscape captures are documented in docs/DEVELOPMENT.md; full graphical acceptance remains pending. Read [development status](docs/DEVELOPMENT.md) for evidence, limitations and the remaining acceptance checks. Do not equate numerical tests with full graphical acceptance.

The original 0.6 remains at `v06.html`, alongside archives 0.1–0.5. GitHub Pages continues to serve the root of main; this development work should be reviewed before main is updated.

## Structure

- `src/main.js`: application lifecycle
- `src/config.js`: version, seed and navigation configuration
- `src/world.js`, `src/lab.js`: landscape and focused form experiment
- `src/oscillators.js`, `src/simulation.js`: numerical integration and geometry updates
- `src/rendering/`: renderer, materials and GLSL source
- `src/input.js`, `src/navigation.js`: desktop input and collision approximation
- `src/ui.js`, `src/profiling.js`: controls and measurement
- `tests/`: offline regression and scene construction checks

## Profiling

Select a scene, resize the browser, then press **60 s messen**. It resets simulation and camera, fixes resonance strength at 1, disables navigation during capture, fixes target A, emission off, shadows on, held connections and normal simulation speed in the lab, and emits one impulse at simulation second 1. Leave the tab foregrounded. Resetting, resizing or hiding the tab cancels the capture.

Compare 1920×1080 and 2560×1440 **browser viewport sizes** at the fixed desktop quality. Record canvas dimensions, drawing-buffer dimensions and pixel ratio separately. The canvas occupies part of the viewport. Results include mean/p50/p95/p99 frame intervals, average FPS, draw calls, triangles, and geometry/texture counts. GPU utilization, VRAM bytes and temperature require external tools; they are not inferred from FPS.

## Third party dependency

`vendor/three.module.js` is Three.js r170 from the official mrdoob/three.js repository, blob `6bc781491ae24ffd29ee22c8f019cdb67c2c61b7`. License: [MIT](vendor/THREE-LICENSE.txt).
