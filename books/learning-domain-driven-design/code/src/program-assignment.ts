// Value objects

type Brand<T, B extends string> = T & { readonly __brand: B };

export type AthleteId = Brand<string, 'AthleteId'>;
export type TrainerId = Brand<string, 'TrainerId'>;
export type ProgramId = Brand<string, 'ProgramId'>;
export type AssignmentId = Brand<string, 'AssignmentId'>;

export const athleteId = (v: string): AthleteId => v as AthleteId;
export const trainerId = (v: string): TrainerId => v as TrainerId;
export const programId = (v: string): ProgramId => v as ProgramId;
export const assignmentId = (v: string): AssignmentId => v as AssignmentId;

export class DateRange {
  constructor(
    readonly startDate: Date,
    readonly endDate: Date,
  ) {
    if (endDate <= startDate) {
      throw new Error(`end date must be after start date`);
    }
  }

  static fromDays(start: Date, durationDays: number): DateRange {
    const end = new Date(start);
    end.setDate(end.getDate() + durationDays);
    return new DateRange(start, end);
  }

  contains(date: Date): boolean {
    return date >= this.startDate && date <= this.endDate;
  }

  equals(other: DateRange): boolean {
    return (
      this.startDate.getTime() === other.startDate.getTime() &&
      this.endDate.getTime() === other.endDate.getTime()
    );
  }
}

// Domain events

export interface DomainEvent {
  readonly type: string;
  readonly occurredAt: Date;
}

export interface ProgramAssignedEvent extends DomainEvent {
  readonly type: 'ProgramAssigned';
  readonly assignmentId: AssignmentId;
  readonly athleteId: AthleteId;
  readonly trainerId: TrainerId;
  readonly programId: ProgramId;
  readonly dateRange: DateRange;
}

export interface ProgramCompletedEvent extends DomainEvent {
  readonly type: 'ProgramCompleted';
  readonly assignmentId: AssignmentId;
}

export interface ProgramPausedEvent extends DomainEvent {
  readonly type: 'ProgramPaused';
  readonly assignmentId: AssignmentId;
}

export interface ProgramExpiredEvent extends DomainEvent {
  readonly type: 'ProgramExpired';
  readonly assignmentId: AssignmentId;
}

// Aggregate

export type AssignmentStatus = 'active' | 'completed' | 'paused' | 'expired';

export class ProgramAssignment {
  private _status: AssignmentStatus;
  private _events: DomainEvent[] = [];

  private constructor(
    readonly id: AssignmentId,
    readonly athleteId: AthleteId,
    readonly trainerId: TrainerId,
    readonly programId: ProgramId,
    readonly dateRange: DateRange,
    status: AssignmentStatus,
  ) {
    this._status = status;
  }

  get status(): AssignmentStatus {
    return this._status;
  }

  static assign(
    id: AssignmentId,
    athleteId: AthleteId,
    trainerId: TrainerId,
    programId: ProgramId,
    dateRange: DateRange,
  ): ProgramAssignment {
    const a = new ProgramAssignment(id, athleteId, trainerId, programId, dateRange, 'active');
    const event: ProgramAssignedEvent = {
      type: 'ProgramAssigned',
      occurredAt: new Date(),
      assignmentId: id,
      athleteId,
      trainerId,
      programId,
      dateRange,
    };
    a._events.push(event);
    return a;
  }

  complete(): void {
    if (this._status !== 'active' && this._status !== 'paused') {
      throw new Error(`Cannot complete a ${this._status} assignment`);
    }
    this._status = 'completed';
    const event: ProgramCompletedEvent = {
      type: 'ProgramCompleted',
      occurredAt: new Date(),
      assignmentId: this.id,
    };
    this._events.push(event);
  }

  pause(): void {
    if (this._status !== 'active') {
      throw new Error(`Cannot pause a ${this._status} assignment`);
    }
    this._status = 'paused';
    const event: ProgramPausedEvent = {
      type: 'ProgramPaused',
      occurredAt: new Date(),
      assignmentId: this.id,
    };
    this._events.push(event);
  }

  expire(): void {
    if (this._status !== 'active') {
      throw new Error(`Cannot expire a ${this._status} assignment`);
    }
    this._status = 'expired';
    const event: ProgramExpiredEvent = {
      type: 'ProgramExpired',
      occurredAt: new Date(),
      assignmentId: this.id,
    };
    this._events.push(event);
  }

  // Returns pending events and clears the internal buffer.
  // The application service calls this after save() to dispatch events.
  drainEvents(): DomainEvent[] {
    const pending = [...this._events];
    this._events = [];
    return pending;
  }
}
