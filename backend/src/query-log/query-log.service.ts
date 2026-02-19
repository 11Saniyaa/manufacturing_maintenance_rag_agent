import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { QueryLog } from './query-log.entity';

@Injectable()
export class QueryLogService {
  constructor(
    @InjectRepository(QueryLog)
    private queryLogRepository: Repository<QueryLog>,
  ) {}

  /**
   * Create a new query log entry
   */
  async create(log: Partial<QueryLog>): Promise<QueryLog> {
    const newLog = this.queryLogRepository.create(log);
    return this.queryLogRepository.save(newLog);
  }

  /**
   * Get all query logs
   */
  async findAll(): Promise<QueryLog[]> {
    return this.queryLogRepository.find({
      order: { createdAt: 'DESC' },
      take: 100, // Limit to last 100 queries
    });
  }

  /**
   * Get query logs for a specific machine
   */
  async findByMachineId(machineId: number): Promise<QueryLog[]> {
    return this.queryLogRepository.find({
      where: { machineId },
      order: { createdAt: 'DESC' },
    });
  }
}

