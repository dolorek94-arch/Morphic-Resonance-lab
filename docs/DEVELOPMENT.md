# Development status 2026-11-27

## Verified starting point

Upstream main was inspected through GitHub: commit `9064bbe9ccf1598aa2903efa9525d7464ad9881a`. It contained README.md, index.html and v01.html–v05.html, with no AGENTS.md or build tooling. The source matched the supplied handover.

A normal git clone failed because the execution environment could not resolve github.com. The seven upstream files were retrieved through the GitHub connector and committed as a **local source snapshot**, not a clone of the original commit history. The remote work is based on the actual upstream commit. Do not force-push the local snapshot branch to main; use a normal clone/fetch when network access is available.

The published 0.6 and 0.5 were opened in the in-app browser. Both rendered without captured warning/error console entries. Pulse was clicked in 0.6. The start view was substantially obscured by a nearby formation in both versions. Displayed instantaneous FPS values were observed but are not reported as benchmark results.

## Implemented candidate 0.7.0

- P0: preserved v06.html, moved reset position from (0,7) to the central clearing (0,0), bounded SDF hit acceptance by proxy exit, made fragment projection uniform explicit, enlarged proxy margin and matched distance-squared fog attenuation more closely to the world.
- P1: WASD, normalized diagonal movement, camera-relative direction corrected, click-to-Pointer-Lock, Escape, Space impulse and R reset. Blur/visibility/pointer-cancel clear input. Touch controls retained. Collision uses body size, conservative implicit bounds and height-aware static root/branch bounding boxes; movement substeps reduce tunneling and coincident centers escape.
- P2: separate modules for renderer/material/shaders/world/simulation/input/navigation/UI/profiling; shared version and seed; offline pinned Three r170; dependency-free Node server and tests.
- P3 experiment: optional small three-body form laboratory at ?scene=lab. A single SDF proxy combines all three bodies and curved continuous capsule connections, with coupling-controlled bridge thickness, energy-dependent form, emissive material structure and height-weighted distance fog. This is an experimental implementation, not visually approved. It does not replace the landscape's existing cylinder connections.
- P4 infrastructure: repeatable reset/camera/impulse setup and 60-second measurement with mean/percentile frame intervals and renderer counts. Lab quality adjusts 48/80 march steps; landscape keeps 64.
- P5: WebGPU remains deferred pending a stable, measured WebGL baseline.

## Validation completed

Node 24.22.0 / npm 11.19.1. All authored JavaScript passes node --check. npm test: 8 passing tests.

Tests exercise cardinal camera movement, collision at exact body centers, high-speed collision substeps, vertical separation and box interiors, transfer across coupled oscillators, sustained-impulse numerical stability, memory decay, actual Three.js construction/evolution of both scenes, finite transforms/vertices, clear spawn and deterministic seeded generation.

These tests instantiate the actual vendored Three.js scene objects, but do **not** create a GPU context or compile GLSL.

## Environment blocker

The Node development server reports listening on 127.0.0.1:8000. HTTP client access inside this execution environment fails with EACCES; the browser's localhost connection also times out. Node REPL additionally reports an unavailable CODEX_CLI_PATH. Python resolves to a nonfunctional Windows Store alias. No approvals or security settings were changed.

Consequently the revised 0.7 has **not** had a browser render/console/depth/Pointer-Lock test here. No iPhone test, 1080p/1440p 60-second capture, GPU load, VRAM measurement or temperature reading has been completed. Do not deploy this candidate as a validated release.

## Remaining acceptance work in priority order

1. Run npm run dev in a normal local terminal, open landscape and form lab. Inspect console; confirm both shader programs compile and the start view is clear.
2. Walk/turn at all headings; verify Pointer Lock and Escape, touch two-finger move/look, pulse and reset. Check near-plane traversal, polygon/SDF overlap and proxy borders from both sides.
3. Test collision in crowded areas. Static tube AABBs are conservative and can block empty space; dynamic cylinder bridges and floating decorations do not yet have detailed collisions.
4. Validate the form lab's connected silhouette during transfer and memory relaxation. Tune material differentiation and lighting after seeing the result. Current fog is an approximation, not volumetric fog.
5. Run the README measurement matrix, including actual iPhone Safari. Use an external GPU monitor for utilization/VRAM/temperature.
6. Add correct implicit-surface shadow rendering. The bodies currently write view depth but do not cast matching SDF shadows; polygon vertex displacement also lacks a matching custom depth material.
7. Only then decide whether to extend connected SDF groups into the landscape or measure a separate WebGPU/TSL prototype.

## Publication

Changes are intended for a development branch and draft review. Main/GitHub Pages should remain at the known 0.6 baseline until graphical checks pass.

