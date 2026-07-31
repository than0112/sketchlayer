# ADR 001: Unarchive SketchLayer and implement Phase 1

- Date: 2026-08-01
- Status: Accepted
- Decision owner: Repository owner

## Context

SketchLayer was initialized in a sealed state because the original validation gate had not passed. On 2026-08-01, the repository owner explicitly instructed Codex to formally unarchive the project and implement Phase 1 directly.

## Decision

Phase 1 implementation is authorized. The original interview, external-evidence, WIP, and cooling-period requirements are waived as launch blockers by an explicit owner decision. They remain useful product-discovery work and are deferred rather than represented as completed research.

The implementation remains deliberately narrow: an embeddable, AI-readable visual annotation layer rather than a general-purpose whiteboard.

## Consequences

- Phase 1 engineering work can proceed immediately.
- Product validation debt remains visible in `tasks.md`.
- Future scope expansion still requires evidence; this exception does not automatically authorize Phase 2 or Phase 3.
