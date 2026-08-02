# SketchLayer participant study kit

Use this sheet with the protocol in [Gate 0 validation](./gate-0-validation.md). Create one copy per participant. Do not send any production screen, recording, or personal details to a third party without permission.

## Participant profile

- ID: `P-__`
- Role: 
- Reviewed an AI-generated interface in the last 30 days: yes / no
- Usual feedback method: 
- Consent to retain an anonymized task recording and export: yes / no

## Moderator script

> You will review a generated dashboard and communicate five requested UI changes to an AI agent. Please use visual annotations as you naturally would. This is a product test, not a test of you. Think aloud if comfortable; I will not help unless the task cannot continue.

1. Open a **New blank board** and load the supplied dashboard image.
2. Read the five requests. Start the timer when the participant makes the first annotation.
3. Observe without directing the participant to a tool or metadata field.
4. Stop the timer when the participant sends or exports JSON.
5. Ask the exit questions below.

## Task brief

Use these exact change requests against the supplied dashboard image:

1. Increase emphasis on the Total Revenue metric.
2. Move the date-range control higher in the header.
3. Use green for the positive Active Users change.
4. Reduce the prominence of Recent Alerts.
5. Keep Add Data Source prominent; do not remove it.

## Observation record

| Request | Completed without help | Exported shape / operation | Target present | Note present | Severity | Reviewer correct? | Issue / quote |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | | | | | | | |
| 2 | | | | | | | |
| 3 | | | | | | | |
| 4 | | | | | | | |
| 5 | | | | | | | |

- Start time:
- Export time:
- Completion time:
- JSON schema validation: pass / fail
- Agent parse result: all instructions / partial / failed
- Assistance requested or provided:

## Exit questions

1. What felt natural or confusing?
2. Which annotation, if any, would the agent be most likely to misunderstand?
3. Would you use this workflow for your next AI-generated UI review? very unlikely / unlikely / neutral / likely / very likely
4. May we contact you about whether this export led to a real change or approval? yes / no

## Evidence checklist

- [ ] Anonymized export JSON retained.
- [ ] Timer and task-completion result recorded.
- [ ] Independent reviewer scored correctness.
- [ ] Agent parse result retained.
- [ ] Reuse-intent answer retained.
- [ ] If applicable, screenshot/link proving a real downstream change or approval retained.

## Round summary

After P-01 to P-03, calculate the thresholds in the validation protocol. Record the Go / Narrow / Archive decision and the evidence location; do not infer external behavior from stated intent.
