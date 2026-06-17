import type {
  ProgramAssignment,
  AthleteId,
  TrainerId,
  ProgramId,
  AssignmentId,
  DateRange,
} from './program-assignment';
import { ProgramAssignment as PA } from './program-assignment';

// Port — implemented by infrastructure (in-memory for tests, ActiveRecord adapter in Rails)
export interface AssignmentRepository {
  save(assignment: ProgramAssignment): Promise<void>;
  findById(id: AssignmentId): Promise<ProgramAssignment | undefined>;
  findActiveByAthlete(athleteId: AthleteId): Promise<ProgramAssignment | undefined>;
}

export interface AssignCommand {
  id: AssignmentId;
  athleteId: AthleteId;
  trainerId: TrainerId;
  programId: ProgramId;
  dateRange: DateRange;
}

// Application service: thin orchestration. Business logic lives in the aggregate.
// This service owns the cross-aggregate invariant: one active program per athlete.
export class AssignmentService {
  constructor(private readonly repo: AssignmentRepository) {}

  async assign(cmd: AssignCommand): Promise<void> {
    const existing = await this.repo.findActiveByAthlete(cmd.athleteId);
    if (existing !== undefined) {
      throw new Error(
        `Athlete ${cmd.athleteId} already has active assignment ${existing.id}`,
      );
    }

    const assignment = PA.assign(
      cmd.id,
      cmd.athleteId,
      cmd.trainerId,
      cmd.programId,
      cmd.dateRange,
    );
    await this.repo.save(assignment);
  }

  async complete(id: AssignmentId): Promise<void> {
    const assignment = await this.require(id);
    assignment.complete();
    await this.repo.save(assignment);
  }

  async pause(id: AssignmentId): Promise<void> {
    const assignment = await this.require(id);
    assignment.pause();
    await this.repo.save(assignment);
  }

  async expire(id: AssignmentId): Promise<void> {
    const assignment = await this.require(id);
    assignment.expire();
    await this.repo.save(assignment);
  }

  private async require(id: AssignmentId): Promise<ProgramAssignment> {
    const a = await this.repo.findById(id);
    if (a === undefined) throw new Error(`Assignment not found: ${id}`);
    return a;
  }
}
