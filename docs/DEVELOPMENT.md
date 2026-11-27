# Development status 2026-11-27

## Spatial transport and travelling form waves 0.9.0

The user accepted 0.8.2 shadows as visually plausible and appropriately attached to the objects. Version 0.9 keeps that shared-field lighting while replacing direct lab-body coupling with a one-dimensional spring chain along each neck.

Each link has eight cells (seven internal masses), shared endpoint bodies, spring coefficient 12 and internal mass .2. Internal damping is .09 and weak restoring stiffness .15. Existing endpoint material coefficients remain. The generic integrator now supports optional mass, with mass 1 preserving the landscape path. A targeted impulse still changes only the selected body at injection; all other states respond through the graph. Standard strength-1 numerical sampling at displacement threshold .01 found B at about .96 simulation seconds and C at about 2.09 seconds; these are model observations, not physical material constants.

Interpolated local displacement and velocity bend the neck and vary its radius. Geometry now uses eight tapered segments per link (16 total); the same arrays feed visible surfaces, normals and shadows. Radius is clamped to remain positive. Adjacent segments use a small within-neck union before one body attachment union to reduce stationary junction lumps.

The default held-connection mode exposes the wave on already formed necks without light emission. Unchecking it restores the automatic growth/retraction envelope. A .35-speed slow-motion checkbox affects simulation only; navigation remains normal speed. Reset clears internal displacement, velocity and memory in addition to body state. Benchmarks force held connections, shadows on, emission off, normal simulation speed and target A.

Automatic growth retains the original logical-neighbor assumption: numerical transport remains available on the latent chain even before the whole visible neck is built. No wave surface is rendered in gaps, but visibility is not an energy-aware physical connectivity constraint. Held mode is the reference for assessing travel. Physically gated attachment/fracture is outside this implementation.

Validation: 23 Node tests pass. New tests check ordered internal-cell arrival and later body response, fixed-graph mechanical energy decay, downstream-stiffness influence on later upstream response, spatially varying held-neck geometry, 30/60/180 Hz consistency and full internal reset. Existing automatic connection, memory, impulse stress, shadow-data and navigation checks remain green. The weaker attenuated second-link activation is expected under the new chain, so its regression bound changed from .65 to .55; a standard impulse reaches approximately .62 and still closes the neck.

The local browser showed held necks at rest, automatic-mode separation, slow-motion excitation with A reacting before B/C, spatial neck thickening/bending and matching shadows without captured warning/error console entries. The final 60-second run at 2545×940 (viewport 2560×1305, pixel ratio 1) completed with 10,799 frames / 60,001.3 ms: 179.979 FPS, mean 5.556 ms, p50/p95 5.6 ms and p99 5.7 ms. Conditions: held connections, shadows on, emission off, normal simulation speed, one impulse into A after 1 simulation second. Full JSON: docs/benchmarks/2026-11-27-lab-0.9.0-waves.json. No warning/error console entries were captured. The browser also observed C-target excitation followed by B/A reaction and a successful full reset. Frame intervals appear capped near 180 FPS and do not measure GPU cost; this single-impulse capture is not a sustained-excitation stress benchmark.

Open visual checks: user judgement of travel readability, the smaller second-link wave, extreme camera angles and sustained multi-impulse GPU cost. Boundary response is a simplified damped mechanical model, not validated real-world physics.

## Shared-field lighting and shadows 0.8.2

The user supplied 0.8.1 screenshots of separate and connected forms plus a completed 60-second capture at 2545×940: approximately 179.98 FPS, mean 5.56 ms and p99 5.7 ms. These results describe 0.8.1.

Version 0.8.2 extracts one common GLSL form field for the body and ground materials. Ground shadow rays and surface self-shadow rays trace that same current field, including neck segment positions/radii, signed deformation and decaying memory. Conservative local box intersections avoid marching rays that miss the group. Soft penumbrae are an approximation with fixed step budgets (48 surface / 72 floor), bias .035 and shared normalized light direction. This is local raymarched visibility, not a Three.js shadow map or a physically validated light transport model.

The floor and bodies share key-light and sky-fill colors. Three short normal samples add restrained ambient occlusion in tight regions. The new Shadows checkbox starts enabled and toggles direct shadow visibility; ambient occlusion stays enabled. Benchmark capture forces shadows on in the lab, emission off and target A. The older landscape rendering path is unchanged.

Validation: 17 Node tests and authored-JavaScript syntax checks pass. Integration tests verify identical live field uniform references across camera/floor materials, updating neck/deformation data after excitation, normalized light direction, matching proxy bounds and switching shadows without changing neck geometry. A local browser rendered resting shadows, connected neck shadows and the off comparison without captured warning/error console entries. Initial small-viewport readings are not benchmarks. The matched-size 60-second run completed with shadows enabled at 2545×940, pixel ratio 1, viewport 2560×1305: 10,797 frames / 60,001.3 ms, 179.946 FPS, mean 5.557 ms, p50/p95 5.6 ms and p99 5.7 ms. No warning/error console entries were captured. Full result: docs/benchmarks/2026-11-27-lab-0.8.2-shadows.json. These capped-looking frame intervals do not measure GPU workload or imply zero extra GPU cost. The capture uses one impulse after 1 simulation second and mostly measures the subsequent idle state; sustained repeated excitation still needs profiling.

Remaining checks: user style feedback, extreme viewpoints/near-plane cases, grazing thin-neck shadow precision and longer sustained excitation. The fixed-budget secondary rays and soft-shadow heuristic may miss fine grazing detail; no GPU time, utilization, VRAM bytes or temperature is inferred from frame intervals.

## Form-language refinement 0.8.1

User feedback confirms the 0.8 sequence: separate bodies merge after excitation, separate again, and return to their original shapes. This is the accepted behavioral baseline.

The next candidate replaces broad activation-dependent unions with narrow curved, tapered tendrils. Each pair grows two halves from the body interiors; the halves meet at the midpoint and retract as connection activation decays. A-B sags forward, B-C arches backward. Endpoint radius is about .32 and midpoint radius .13 before memory adjustment. Local smooth unions attach the necks without inflating the entire group. The shared endpoint/radius payload is generated in src/neck-geometry.js and sent to the shader as two vec4 arrays.

Material A now has an asymmetric bean-like outline and more yielding shear; B has a compact rounded-block norm, restrained deformation and stronger matte grain; C is a tapered, thinner membrane with a bent tip and longer-lived folds. Lighting adds restrained material-dependent highlights. Emission remains optional and off by default. Simulation/material coefficients and the verified reversible lifecycle are unchanged.

Validation: 15 Node tests and syntax checks pass. New tests verify absent/retracted neck payloads, separated early growth, meeting endpoints at full growth, pinched middle radii, opposite bend directions and proxy containment under strong excitation and memory. These tests validate generated geometry data and numerical behavior. A subsequent local in-app browser run at 1265×518 drawing-buffer resolution successfully rendered 0.8.1 with no captured warning/error console entries. Resting material silhouettes, targeted pulse response, thin connected necks, their later disappearance and a reset to zero reaction/memory were observed. This confirms initial shader/render behavior at that view; extreme camera angles, near-plane/depth edge cases and a new 60-second performance capture at larger desktop resolutions remain untested. The shader now evaluates additional neck segments, so 0.8 performance readings must not be reused as 0.8.1 measurements.

## Form-first laboratory 0.8.0

The default entry now opens the focused form lab; ?scene=world retains the landscape and ?scene=lab explicitly selects the lab. Three material profiles replace identical autonomous oscillators in the lab: A is soft and fast, B is dense and more damped, C retains deformation memory longer. The lab has no idle forcing. A selected impulse changes only the target body's velocity; transfer is produced by coupled integration.

The implicit field uses three individually deformed bodies with activation-dependent smooth-union widths. At rest the small union width leaves gaps; excitation increases blending to form necks, and decay separates the bodies again. Decaying memory affects size, asymmetry and surface lobes. Emission is off by default and can be toggled for comparison. The background/floor and lighting are deliberately subdued. A conservative collider protects the whole joining envelope. Navigation in this scene follows its flat floor.

Controls: select A/B/C, send an impulse, observe reaction and memory meters. Space uses the selected target. The strength slider now scales the actual impulse (including zero); benchmark capture fixes target A, strength 1 and emission off. Reset clears activity and connection history. The landscape retains its existing coefficients and spatial pulse, with slider scaling added.

Validation: 12 Node tests pass, and authored JavaScript passes syntax checking. Tests cover a silent idle state, injection into only the selected body, ordered threshold arrival A/B/C, growth and decay of the connection driver, slower memory relaxation in C, repeated maximum-strength pulses, full reset, both scene constructions and previous navigation regressions. These are numerical/scene tests, not evidence of rendered neck topology or GPU shader compilation.

Automatic graphical inspection was attempted using the user's existing Chrome project window. Computer Use stopped because it could not confidently identify the current browser URL. No further browser automation was attempted. Version 0.8 still needs visual confirmation of silhouette transitions, depth integration, proxy bounds and the no-emission appearance. Implicit shadows remain unimplemented.

The user's newer 0.7.1 screenshot shows a completed landscape capture at 2560×940 drawing-buffer resolution, pixel ratio 1, around 179.98 FPS and approximately 5.56 ms mean / 5.7 ms p99. That result describes 0.7.1 and this viewport, not 0.8 or a full 2560×1440 render.

## Desktop-only update 0.7.1

The user selected PC-only development on 2026-11-27. Touch controls, joystick and the mobile rendering profile are removed from the current application. Archived 0.1–0.6 stay unchanged. Current desktop rendering uses native device pixel ratio, with 80 steps in the form lab and 64 in landscape. Mouse drag is the supported fallback for embedded browsers that deny Pointer Lock.

The user supplied a screenshot of a completed 0.7.0 landscape measurement: high quality, 1090×643 canvas at pixel ratio 1, viewport 1105×893, 10,799 frames over about 60.001 s. Rounded results: 179.98 FPS, mean 5.556 ms, p50 5.6 ms, p95 5.6 ms, p99 5.7 ms, 52 draw calls, 52,308 triangles, 139 geometries and 1 texture. Source: user screenshot in the project conversation. This confirms a completed user-run render/capture at that viewport; it does not establish full-HD/1440p performance or GPU utilization. The screenshot also confirms that Pointer Lock was unavailable in the embedded browser.

Current acceptance scope is desktop only: verify both scenes, mouse/keyboard navigation and drag fallback, depth/near-plane behavior and collisions; then measure larger desktop viewports and external GPU utilization/VRAM. The earlier iPhone/mobile requirements below are historical and superseded. 0.7.1 removes the quality button and reports actual drawing-buffer dimensions. PowerShell setup instructions now call Node directly to avoid npm.ps1 execution-policy errors.

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

