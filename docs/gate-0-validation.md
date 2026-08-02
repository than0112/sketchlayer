# Gate 0 validation protocol

**Status:** ready to run; no participant evidence has been collected yet.  
**Owner:** product owner  
**Scope:** validate the narrow loop: AI-generated UI → human visual annotation → structured instruction for an agent.

## Participants

Recruit three people who have edited or reviewed an AI-generated product interface in the last month. At least two must be React developers or product engineers; the third may be a designer who regularly gives UI feedback to an engineer or coding agent. Do not count friends who only give verbal interest.

## Method

Give every participant the same dashboard screen and five change requests: emphasize a metric, move a control, preserve an element, reduce prominence, and mark a problem. Ask them to complete the feedback using SketchLayer Pro without coaching. Record screen, time, exported JSON, and the agent's parsed instruction result.

Use the `AI Dashboard Feedback` example for familiarization only. The timed task must start on a new blank board with the supplied target image so the result is not pre-annotated.

## Success metrics

| Metric | Definition | Go threshold |
| --- | --- | --- |
| Task completion | Participant exports a valid JSON document for all five requests without facilitator intervention. | ≥ 2 of 3 participants |
| Completion time | Time from first annotation action to valid export, excluding reading the brief. | Median ≤ 3 minutes |
| Feedback correctness | Independent reviewer compares the requested change with `operation`, `target`, `note`, and severity in the export. | ≥ 12 of 15 requests correct (80%) |
| Agent parse rate | JSON validates and the receiving agent can create one unambiguous instruction per completed annotation. | ≥ 95% of completed annotations |
| Reuse intent | Participant answers “likely” or “very likely” to using this exact flow again. | ≥ 2 of 3 participants |
| External behavior evidence | A participant uses the export to make, request, or approve a real change outside the study. | ≥ 1 observed instance |

## Capture sheet

For each participant, retain only the following in `research/` (or the product research system):

- participant role and relevant AI-interface-review experience;
- start/end time and whether help was required;
- exported JSON plus schema-validation result;
- request-by-request correctness rating and reviewer rationale;
- agent parse result or failure category;
- reuse-intent response and one verbatim improvement request;
- link or screenshot proving any real downstream use.

Do not save personal data or production screenshots without explicit permission.

## Decision rule

- **Go:** all Go thresholds are met, including one external behavior instance. Freeze the agent annotation protocol before a 1.0 release.
- **Narrow:** completion works but correctness or time misses by at most one threshold. Restrict the product to the failing workflow and run another three-participant round after a targeted fix.
- **Archive:** fewer than two participants complete the flow, or the result does not lead to a real downstream action after the round. Do not add 0.3/0.4 scope.

## What this protocol does not prove

This does not validate collaboration, generic whiteboarding, diagramming, creator workflows, or replacement of a full design editor. Those remain explicitly out of scope.
