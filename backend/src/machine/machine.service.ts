import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Machine } from './machine.entity';

@Injectable()
export class MachineService {
  constructor(
    @InjectRepository(Machine)
    private machineRepository: Repository<Machine>,
  ) {}

  /**
   * Get all machines
   */
  async findAll(): Promise<Machine[]> {
    return this.machineRepository.find({
      relations: ['errorCodes', 'maintenanceSchedules'],
    });
  }

  /**
   * Get a machine by ID
   */
  async findOne(id: number): Promise<Machine> {
    return this.machineRepository.findOne({
      where: { id },
      relations: ['errorCodes', 'maintenanceSchedules'],
    });
  }

  /**
   * Get machines by type
   */
  async findByType(type: string): Promise<Machine[]> {
    return this.machineRepository.find({
      where: { type },
      relations: ['errorCodes', 'maintenanceSchedules'],
    });
  }

  /**
   * Create a new machine
   */
  async create(machine: Partial<Machine>): Promise<Machine> {
    const newMachine = this.machineRepository.create(machine);
    return this.machineRepository.save(newMachine);
  }
}

