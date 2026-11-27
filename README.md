# Morphic Resonance Lab

Experimental organic graphics technology. Resonance changes geometry, transfers between bodies and leaves decaying material memory. This repository is a graphics laboratory, with no game systems or engine migration.

## Local development

Requires Node.js 20.11 or newer (validated with 24.22.0).

```powershell
npm run dev
```

Open http://localhost:8000/ for the landscape, or http://localhost:8000/?scene=lab for the connected SDF experiment. No npm install or build step is needed. Three.js r170 is vendored with its MIT license; the current application runs without a CDN. Archived versions still use their original CDN imports.

```powershell
npm test
```

WASD moves relative to the camera. Click the canvas to capture the mouse, Escape releases it. Space sends an impulse; R restores the starting state. Touch joystick and drag-to-look remain available, including drag fallback when Pointer Lock is unavailable.

## Development status

0.7.0 is a development candidate. Eight Node tests pass; full graphical validation of 0.7 is pending. Read [development status](docs/DEVELOPMENT.md) for evidence, limitations and the remaining acceptance checks. Do not equate numerical tests with WebGL or iPhone validation.

The original 0.6 remains at `v06.html`, alongside archives 0.1–0.5. GitHub Pages continues to serve the root of main; this development work should be reviewed before main is updated.

## Structure

- `src/main.js`: application lifecycle
- `src/config.js`: version, seed and navigation configuration
- `src/world.js`, `src/lab.js`: landscape and focused form experiment
- `src/oscillators.js`, `src/simulation.js`: numerical integration and geometry updates
- `src/rendering/`: renderer, materials and GLSL source
- `src/input.js`, `src/navigation.js`: desktop/touch input and collision approximation
- `src/ui.js`, `src/profiling.js`: controls and measurement
- `tests/`: offline regression and scene construction checks

## Profiling

Select a scene and quality, resize the browser, then press **60 s messen**. It resets simulation and camera, fixes resonance strength at 1, disables navigation during capture, and emits one impulse at simulation second 1. Leave the tab foregrounded. Changing quality, resetting, resizing or hiding the tab cancels the capture.

Compare 1920×1080 and 2560×1440 **browser viewport sizes** at both qualities; record the reported canvas dimensions and pixel ratio separately. The canvas occupies part of the viewport. Results include mean/p50/p95/p99 frame intervals, average FPS, draw calls, triangles, and geometry/texture counts. GPU utilization, VRAM bytes and temperature require external tools; they are not inferred from FPS.

## Third party dependency

`vendor/three.module.js` is Three.js r170 from the official mrdoob/three.js repository, blob `6bc781491ae24ffd29ee22c8f019cdb67c2c61b7`. License: [MIT](vendor/THREE-LICENSE.txt).
