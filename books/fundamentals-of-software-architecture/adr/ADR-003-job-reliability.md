# ADR-003: Accept At-Most-Once Job Delivery for Current Volume

**Date:** 2026-05-17
**Status:** accepted
**System:** Synergym (synergym_next)

## Context

Synergym has 6 background job classes:

| Job | Trigger | Failure consequence |
|-----|---------|---------------------|
| `ClientInvitationReminderJob` | Scheduled | Trainer misses a reminder to follow up |
| `ProgramAssignmentExpirationJob` | Scheduled | Assignment stays active past expiry date |
| `TrainerInviteLinkExpirationJob` | Scheduled | Invite link stays active past expiry date |
| `TranslateExerciseJob` | On exercise create/update | Exercise not translated; athlete sees fallback locale |
| `ApplicationJob` | Base class | — |
| `SampleWorker` | Legacy/dev | — |

The system is transitioning from Sidekiq+Redis to **SolidQueue** (database-backed). SolidQueue supports at-least-once delivery with automatic retry, but no idempotency is currently enforced in job implementations.

No monitoring beyond `/health/jobs` endpoint. No dead-letter queue. No alerting on job failure.

**Fault tolerance assessment (Richards & Ford, Ch. 4 — architecture characteristics):**
Fault tolerance for jobs is currently at-most-once effective delivery because:
- No explicit retry counts configured in job classes
- No idempotency guards (re-running `ProgramAssignmentExpirationJob` twice could double-expire)
- No failure notification path

## Decision drivers

- Consequence of job failure is low to medium (reminder misses, stale expiry dates, missing translations)
- No revenue-critical path runs through jobs (no payment processing, no data deletion)
- SolidQueue's built-in retry is available but not yet configured
- Solo operation: complex retry/dead-letter infrastructure adds operational burden without proportional benefit

## Options considered

### Option A: At-most-once — accept current state

Jobs run once. SolidQueue retries on hard failure (process crash) but no application-level retry configured. Failure is silent unless `/health/jobs` is checked.

**Pros:** Zero engineering cost. No idempotency complexity.
**Cons:** Silent failures. Stale expiry states discoverable only on next audit.

### Option B: At-least-once with idempotency guards

Configure retry counts per job. Add idempotency guards (e.g., check status before mutating):
```ruby
def perform(assignment_id)
  assignment = ProgramAssignment.find_by(id: assignment_id)
  return unless assignment&.active? # idempotency guard
  assignment.expire!
end
```
Add Slack/email alert on job failure via SolidQueue callbacks.

**Pros:** Reliable delivery. Silent failures become visible. Correct behavior on retry.
**Cons:** Must audit all 4 jobs for safe idempotency. Alert fatigue risk if misconfigured.

### Option C: Exactly-once (distributed transaction / deduplication)

Not applicable at this scale. Overkill.

## Decision

**Chosen: Option B — at-least-once with idempotency guards, phased.**

Rationale: Option A is the current state but not a sustainable decision — it is an omission, not a choice. The failure consequence is low but `ProgramAssignmentExpirationJob` and `TrainerInviteLinkExpirationJob` mutate state and are unsafe to run twice without guards. The work to add idempotency is small (one guard per job). The work to configure alerts is also small.

**Phase 1 (now):** Add idempotency guards to the 3 state-mutating jobs. No retry config change yet.

**Phase 2 (next sprint):** Configure `retry_on` in ApplicationJob base class. Add `/health/jobs` webhook alert to Telegram.

## Consequences

**Positive:**
- Jobs become safe to retry
- Stale state bugs eliminated for expiry jobs
- Foundation for future monitoring

**Negative / accepted trade-offs:**
- `TranslateExerciseJob` remains without idempotency guard until Phase 2 (translation re-runs are harmless but wasteful)
- No dead-letter queue — permanent failures still require manual investigation via SolidQueue dashboard or DB query

## Related

- Book: Fundamentals of Software Architecture, Ch. 4 (Architecture Characteristics — Reliability, Fault Tolerance)
- Code: `app/jobs/program_assignment_expiration_job.rb`, `app/jobs/trainer_invite_link_expiration_job.rb`, `app/jobs/client_invitation_reminder_job.rb`
- Next: implement Phase 1 idempotency guards in Synergym
