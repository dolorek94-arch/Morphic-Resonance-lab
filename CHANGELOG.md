# Changelog

## 0.9.0 travelling-wave development candidate

Replaced direct lab coupling with eight-cell spring chains. Local simulated displacement/velocity now drive moving neck bulges, pinches and bends; materials influence downstream and returning response. Added held-connection Wellentest (default) and .35-speed slow motion, retaining automatic growth/retraction when held mode is off. Increased neck detail to 16 total segments, shared with shadows; reduced stationary junction swelling.

23 Node tests and syntax checks pass. Browser checks observed delayed response, changing neck profiles, held/automatic mode and matching shadows without captured console warnings/errors. The 60-second held-neck/shadow capture at 2545×940 completed at 179.979 FPS, mean 5.556 ms, p99 5.7 ms; full JSON is in docs/benchmarks/2026-11-27-lab-0.9.0-waves.json. Conditions and model limitations are documented in docs/DEVELOPMENT.md.

## 0.8.2 lighting development candidate

Raymarched ground shadows and surface self-shadowing trace the same dynamic form field as the bodies, including slim necks. Shared light direction/tints and restrained ambient occlusion improve depth cues. Added a direct-shadow comparison toggle; lab benchmark capture fixes shadows on. The landscape path is unchanged.

17 Node tests and syntax checks pass. Browser checks observed resting/connected shadows and the comparison toggle without captured console warnings/errors. Completed 60-second capture with shadows at 2545×940: 179.946 FPS, mean 5.557 ms, p99 5.7 ms. Full JSON is in docs/benchmarks/2026-11-27-lab-0.8.2-shadows.json. GPU utilization was not measured.

## 0.8.1 form-language development candidate

Slim, curved, tapered necks grow from opposing body interiors instead of swelling the entire cluster. A-B and B-C use different bend directions. Soft bean, dense rounded block and thin tapered membrane silhouettes distinguish the three materials; shading varies by material. The user-confirmed reversible lifecycle remains unchanged.

15 Node tests pass, including neck growth/retraction, midpoint connection, taper, asymmetric curves and bounds. Initial local browser validation observed distinct forms, thin connected necks, subsequent separation and reset without captured console warnings/errors at 1265×518. User style acceptance, depth edge cases and a new larger-resolution performance capture remain pending.

## 0.8.0 form-first development candidate

Default to the focused three-body lab. Targeted impulses, material-specific oscillator response, delayed neighbor excitation, decaying deformation memory and activation-driven smooth-union connections. Emission starts disabled; optional comparison toggle and per-body reaction/memory indicators. The landscape remains at ?scene=world. Strength now scales real excitation, and benchmark capture fixes target A and emission off.

12 Node tests pass. Numerical transfer/connection activation is verified; actual rendered joining/separation, shader/depth behavior and 0.8 performance still require a graphical run. Automatic inspection ended when the browser URL could not be identified confidently.

## 0.7.1 desktop development candidate

PC-only scope: removed touch joystick and mobile quality switching. Native desktop pixel ratio, fixed high lab quality, explicit mouse-drag fallback, drawing-buffer benchmark dimensions and PowerShell-compatible start instructions. Recorded the user's 60-second 0.7.0 landscape result (179.98 FPS at 1090×643); larger-resolution acceptance remains pending.

## 0.7.0 development candidate

Desktop/touch input, corrected camera-relative movement, geometry-aware collision approximation and a clear reset location. Modular source, offline Three r170, regression tests and measurement controls. Optional connected SDF form laboratory.

Eight offline tests pass. Browser/GPU/iPhone validation and performance matrix remain pending because localhost networking is blocked in the execution environment. See docs/DEVELOPMENT.md.

## 0.6 upstream snapshot

Hybrid polygon/local-SDF environment from upstream commit 9064bbe9ccf1598aa2903efa9525d7464ad9881a. Preserved as v06.html.

