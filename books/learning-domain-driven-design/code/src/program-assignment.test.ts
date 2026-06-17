import { describe, it, expect, beforeEach } from 'vitest';
import {
  ProgramAssignment,
  DateRange,
  athleteId,
  trainerId,
  programId,
  assignmentId,
} from './program-assignment';
import type { AthleteId, AssignmentId } from './program-assignment';
import { AssignmentService } from './assignment-service';
import type { AssignmentRepository } from './assignment-service';

// --- In-memory repository ---

class InMemoryRepo implements AssignmentRepository {
  private store = new Map<string, ProgramAssignment>();

  async save(a: ProgramAssignment): Promise<void> {
    this.store.set(a.id, a);
  }

  async findById(id: AssignmentId): Promise<ProgramAssignment | undefined> {
    return this.store.get(id);
  }

  async findActiveByAthlete(aid: AthleteId): Promise<ProgramAssignment | undefined> {
    for (const a of this.store.values()) {
      if (a.athleteId === aid && a.status === 'active') return a;
    }
    return undefined;
  }
}

// --- Fixtures ---

const today = new Date('2026-06-17');
const range = DateRange.fromDays(today, 30);

const A1 = athleteId('athlete-1');
const T1 = trainerId('trainer-1');
const P1 = programId('program-1');
const P2 = programId('program-2');
const ID1 = assignmentId('assignment-1');
const ID2 = assignmentId('assignment-2');

// --- DateRange value object ---

describe('DateRange', () => {
  it('rejects end date before or equal to start', () => {
    expect(() => new DateRange(today, today)).toThrow('end date must be after start date');
    const past = new Date('2026-06-16');
    expect(() => new DateRange(today, past)).toThrow();
  });

  it('fromDays computes correct end date', () => {
    const r = DateRange.fromDays(new Date('2026-01-01'), 7);
    expect(r.endDate.toISOString().slice(0, 10)).toBe('2026-01-08');
  });

  it('contains checks boundary inclusivity', () => {
    const r = new DateRange(new Date('2026-06-01'), new Date('2026-06-30'));
    expect(r.contains(new Date('2026-06-01'))).toBe(true);
    expect(r.contains(new Date('2026-06-30'))).toBe(true);
    expect(r.contains(new Date('2026-07-01'))).toBe(false);
  });

  it('equals compares by value', () => {
    const a = DateRange.fromDays(today, 30);
    const b = DateRange.fromDays(today, 30);
    const c = DateRange.fromDays(today, 31);
    expect(a.equals(b)).toBe(true);
    expect(a.equals(c)).toBe(false);
  });
});

// --- ProgramAssignment aggregate ---

describe('ProgramAssignment.assign', () => {
  it('creates assignment in active status', () => {
    const a = ProgramAssignment.assign(ID1, A1, T1, P1, range);
    expect(a.status).toBe('active');
    expect(a.id).toBe(ID1);
    expect(a.athleteId).toBe(A1);
    expect(a.trainerId).toBe(T1);
    expect(a.programId).toBe(P1);
  });

  it('emits ProgramAssigned event', () => {
    const a = ProgramAssignment.assign(ID1, A1, T1, P1, range);
    const events = a.drainEvents();
    expect(events).toHaveLength(1);
    expect(events[0]?.type).toBe('ProgramAssigned');
  });

  it('drainEvents clears the buffer', () => {
    const a = ProgramAssignment.assign(ID1, A1, T1, P1, range);
    a.drainEvents();
    expect(a.drainEvents()).toHaveLength(0);
  });
});

describe('ProgramAssignment.complete', () => {
  it('transitions active → completed', () => {
    const a = ProgramAssignment.assign(ID1, A1, T1, P1, range);
    a.drainEvents();
    a.complete();
    expect(a.status).toBe('completed');
    const events = a.drainEvents();
    expect(events[0]?.type).toBe('ProgramCompleted');
  });

  it('transitions paused → completed', () => {
    const a = ProgramAssignment.assign(ID1, A1, T1, P1, range);
    a.pause();
    a.complete();
    expect(a.status).toBe('completed');
  });

  it('rejects completing an expired assignment', () => {
    const a = ProgramAssignment.assign(ID1, A1, T1, P1, range);
    a.expire();
    expect(() => a.complete()).toThrow('Cannot complete a expired assignment');
  });

  it('rejects completing an already-completed assignment', () => {
    const a = ProgramAssignment.assign(ID1, A1, T1, P1, range);
    a.complete();
    expect(() => a.complete()).toThrow('Cannot complete a completed assignment');
  });
});

describe('ProgramAssignment.pause', () => {
  it('transitions active → paused', () => {
    const a = ProgramAssignment.assign(ID1, A1, T1, P1, range);
    a.drainEvents();
    a.pause();
    expect(a.status).toBe('paused');
    const events = a.drainEvents();
    expect(events[0]?.type).toBe('ProgramPaused');
  });

  it('rejects pausing a paused assignment', () => {
    const a = ProgramAssignment.assign(ID1, A1, T1, P1, range);
    a.pause();
    expect(() => a.pause()).toThrow('Cannot pause a paused assignment');
  });

  it('rejects pausing a completed assignment', () => {
    const a = ProgramAssignment.assign(ID1, A1, T1, P1, range);
    a.complete();
    expect(() => a.pause()).toThrow('Cannot pause a completed assignment');
  });
});

describe('ProgramAssignment.expire', () => {
  it('transitions active → expired', () => {
    const a = ProgramAssignment.assign(ID1, A1, T1, P1, range);
    a.drainEvents();
    a.expire();
    expect(a.status).toBe('expired');
    const events = a.drainEvents();
    expect(events[0]?.type).toBe('ProgramExpired');
  });

  it('rejects expiring a paused assignment', () => {
    const a = ProgramAssignment.assign(ID1, A1, T1, P1, range);
    a.pause();
    expect(() => a.expire()).toThrow('Cannot expire a paused assignment');
  });

  it('rejects expiring a completed assignment', () => {
    const a = ProgramAssignment.assign(ID1, A1, T1, P1, range);
    a.complete();
    expect(() => a.expire()).toThrow('Cannot expire a completed assignment');
  });
});

// --- AssignmentService (cross-aggregate invariant) ---

describe('AssignmentService', () => {
  let repo: InMemoryRepo;
  let service: AssignmentService;

  beforeEach(() => {
    repo = new InMemoryRepo();
    service = new AssignmentService(repo);
  });

  it('assigns a program to an athlete with no existing assignment', async () => {
    await service.assign({ id: ID1, athleteId: A1, trainerId: T1, programId: P1, dateRange: range });
    const saved = await repo.findById(ID1);
    expect(saved?.status).toBe('active');
  });

  it('enforces only-one-active-program-per-athlete invariant', async () => {
    await service.assign({ id: ID1, athleteId: A1, trainerId: T1, programId: P1, dateRange: range });
    await expect(
      service.assign({ id: ID2, athleteId: A1, trainerId: T1, programId: P2, dateRange: range }),
    ).rejects.toThrow(`already has active assignment`);
  });

  it('allows a second assignment after the first is completed', async () => {
    await service.assign({ id: ID1, athleteId: A1, trainerId: T1, programId: P1, dateRange: range });
    await service.complete(ID1);
    await expect(
      service.assign({ id: ID2, athleteId: A1, trainerId: T1, programId: P2, dateRange: range }),
    ).resolves.toBeUndefined();
  });

  it('allows a second assignment after the first is expired', async () => {
    await service.assign({ id: ID1, athleteId: A1, trainerId: T1, programId: P1, dateRange: range });
    await service.expire(ID1);
    await expect(
      service.assign({ id: ID2, athleteId: A1, trainerId: T1, programId: P2, dateRange: range }),
    ).resolves.toBeUndefined();
  });

  it('complete delegates to aggregate and persists', async () => {
    await service.assign({ id: ID1, athleteId: A1, trainerId: T1, programId: P1, dateRange: range });
    await service.complete(ID1);
    const saved = await repo.findById(ID1);
    expect(saved?.status).toBe('completed');
  });

  it('pause delegates to aggregate and persists', async () => {
    await service.assign({ id: ID1, athleteId: A1, trainerId: T1, programId: P1, dateRange: range });
    await service.pause(ID1);
    const saved = await repo.findById(ID1);
    expect(saved?.status).toBe('paused');
  });

  it('expire delegates to aggregate and persists', async () => {
    await service.assign({ id: ID1, athleteId: A1, trainerId: T1, programId: P1, dateRange: range });
    await service.expire(ID1);
    const saved = await repo.findById(ID1);
    expect(saved?.status).toBe('expired');
  });

  it('throws on operation against unknown assignment', async () => {
    await expect(service.complete(ID1)).rejects.toThrow(`Assignment not found: ${ID1}`);
  });
});
