import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Maintenance } from './maintenance.entity';

@Injectable()
export class MaintenanceService {
  constructor(
    @InjectRepository(Maintenance)
    private maintenanceRepository: Repository<Maintenance>,
  ) {}

  /**
   * Get all maintenance schedules
   */
  async findAll(): Promise<Maintenance[]> {
    return this.maintenanceRepository.find({
      relations: ['machine'],
    });
  }

  /**
   * Get maintenance schedules for a specific machine
   */
  async findByMachineId(machineId: number): Promise<Maintenance[]> {
    return this.maintenanceRepository.find({
      where: { machineId },
      relations: ['machine'],
    });
  }

  /**
   * Search maintenance tasks by keyword
   */
  async search(keyword: string): Promise<Maintenance[]> {
    return this.maintenanceRepository
      .createQueryBuilder('maintenance')
      .leftJoinAndSelect('maintenance.machine', 'machine')
      .where('maintenance.task LIKE :keyword', { keyword: `%${keyword}%` })
      .orWhere('maintenance.description LIKE :keyword', { keyword: `%${keyword}%` })
      .getMany();
  }

  /**
   * Create a new maintenance schedule
   */
  async create(maintenance: Partial<Maintenance>): Promise<Maintenance> {
    const newMaintenance = this.maintenanceRepository.create(maintenance);
    return this.maintenanceRepository.save(newMaintenance);
  }
}

