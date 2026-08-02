# Canvas engine evaluation — 2026-08-02

**Decision:** retain SketchLayer's focused Canvas 2D renderer. Keep `perfect-freehand` as an optional Pro-only brush engine. Do not adopt a full editor SDK for 0.x.

## Measurement method

Competitor versions and package metadata were read from npm on 2026-08-02. Minified JavaScript and gzip figures come from the Bundlephobia public API on the same day; they are comparative entry-package estimates, not a substitute for a consuming application's production build. SketchLayer figures are from this repository's `npm run build` output and exclude React/React DOM, which are peer dependencies.

| Option | Version | License | Entry JS / gzip | Published unpacked size | Fit for an AI-readable annotation layer |
| --- | ---: | --- | ---: | ---: | --- |
| SketchLayer core | 0.2.0 | MIT | 17.69 KB / **6.47 KB** | — | Best fit: only annotations, semantic metadata, JSON and Canvas 2D. |
| SketchLayer Pro | 0.2.0 | MIT | 164.08 KB / **43.21 KB** | — | Fits advanced annotation only; lazy/optional entry preserves core. |
| tldraw | 5.2.5 | tldraw license | 1.72 MB / 508 KB | 14.36 MB | Powerful but far beyond scope; production license key and full-editor weight are a poor default embed. |
| Excalidraw | 0.18.1 | MIT | 1.12 MB / 353 KB | 46.80 MB | Embeddable React editor, but its hand-drawn whiteboard model, fonts and full UI conflict with the narrow annotation layer. |
| Fabric.js | 7.4.0 | MIT | 299 KB / 92 KB | 22.22 MB | Viable only when object transforms, selection, SVG or a richer object model become proven needs. |
| perfect-freehand | 1.2.3 | MIT | 4.40 KB / 2.03 KB | 112 KB | Excellent low-level stroke-outline utility; intentionally has no canvas UI, selection or semantic export. |

## Integration and gap analysis

| Option | Embedding model | What it solves | Why it is not the 0.x default |
| --- | --- | --- | --- |
| tldraw | React SDK with editor/store/custom-shape APIs | Full canvas editing, assets and collaboration foundations | Introduces a general editor, separate document model, substantial runtime and a production licensing decision. |
| Excalidraw | React component | Ready-made drawing UI, elements and `.excalidraw` document format | Requires adapting its element semantics into agent instructions and accepting a full whiteboard interaction model. |
| Fabric.js | Canvas object abstraction | Object hit-testing, transforms, JSON/SVG serialization and events | Adds a richer object model than the product needs before selection/move/resize is validated. |
| perfect-freehand | Pure geometry function | Pressure-sensitive outline points with configurable smoothing | Does not provide a workspace, renderer, persistence, target resolver or annotation protocol; SketchLayer supplies these. |

## Evidence and sources

- [tldraw licensing](https://tldraw.dev/community/license) requires a valid production license key and distinguishes commercial/hobby use.
- [tldraw releases](https://tldraw.dev/releases) documents a regularly breaking minor-release cadence; its [starter kits](https://tldraw.dev/starter-kits/overview) demonstrate the broad editor scope.
- [Excalidraw's npm package](https://www.npmjs.com/package/@excalidraw/excalidraw) documents direct React embedding and its font-hosting consideration; its [MIT license](https://github.com/excalidraw/excalidraw/blob/master/LICENSE) permits commercial integration.
- [Fabric.js documentation](https://fabricjs.com/docs/why-fabric/) describes an object-based Canvas abstraction with serialization and SVG export; its [npm package](https://www.npmjs.com/package/fabric) lists the current browser-module integration.
- [perfect-freehand's npm documentation](https://www.npmjs.com/package/perfect-freehand) describes its `getStroke` geometry API, pressure handling and MIT license.
- Bundle estimates are reproducible through the [Bundlephobia API](https://bundlephobia.com/): `tldraw`, `@excalidraw/excalidraw`, `fabric`, and `perfect-freehand`.

## Revisit triggers

Reconsider Fabric.js only after validation shows that object-level move/resize/selection is necessary for successful agent feedback. Reconsider a full SDK only if three validated users require collaboration or a general editing surface and the product scope is consciously changed. Neither condition is currently evidenced.
