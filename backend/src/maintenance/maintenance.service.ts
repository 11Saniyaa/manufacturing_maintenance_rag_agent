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

  async findAll(): Promise<Maintenance[]> {
    return this.maintenanceRepository.find({
      relations: ['machine'],
    });
  }

  async findByMachineId(machineId: number): Promise<Maintenance[]> {
    return this.maintenanceRepository.find({
      where: { machineId },
      relations: ['machine'],
    });
  }

  async search(keyword: string): Promise<Maintenance[]> {
    if (!keyword || !keyword.trim()) {
      return [];
    }

    const searchTerm = `%${keyword.trim()}%`;
    
    // Enhanced search with case-insensitive matching across multiple fields
    return this.maintenanceRepository
      .createQueryBuilder('maintenance')
      .leftJoinAndSelect('maintenance.machine', 'machine')
      .where('LOWER(maintenance.task) LIKE LOWER(:keyword)', { keyword: searchTerm })
      .orWhere('LOWER(maintenance.description) LIKE LOWER(:keyword)', { keyword: searchTerm })
      .orWhere('LOWER(maintenance.frequency) LIKE LOWER(:keyword)', { keyword: searchTerm })
      .orderBy('maintenance.task', 'ASC')
      .getMany();
  }

  async create(maintenance: Partial<Maintenance>): Promise<Maintenance> {
    const newMaintenance = this.maintenanceRepository.create(maintenance);
    return this.maintenanceRepository.save(newMaintenance);
  }
}

