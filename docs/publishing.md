# Publishing checklist

1. Confirm `name`, `version`, repository URL, and npm ownership. The registry returned `E404` for `sketchlayer` on 2026-08-01, but only a publish reserves the name.
2. Run `npm ci` from a clean checkout.
3. Run `npm test`, `npm run typecheck`, and `npm run package:check`.
4. Inspect `npm pack --dry-run`; only `dist-lib`, `docs`, `examples`, `README.md`, and `LICENSE` should ship.
5. Review dependency provenance and `npm audit` output.
6. Publish with npm provenance from protected CI, not a developer machine.
7. Tag the exact commit and attach release notes documenting API or schema changes.

The package build enforces a 35,000-byte uncompressed ESM budget. React, React DOM, and Phosphor icons remain external to the library bundle.
