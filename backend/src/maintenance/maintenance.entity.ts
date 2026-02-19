import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Machine } from '../machine/machine.entity';

@Entity('maintenance_schedules')
export class Maintenance {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  task: string; // e.g., 'Oil Change', 'Filter Replacement'

  @Column('text')
  description: string;

  @Column()
  frequency: string; // e.g., 'Every 1000 hours', 'Monthly', 'Quarterly'

  @Column('text')
  steps: string; // JSON string or text with maintenance steps

  @ManyToOne(() => Machine, (machine) => machine.maintenanceSchedules)
  @JoinColumn({ name: 'machine_id' })
  machine: Machine;

  @Column({ name: 'machine_id' })
  machineId: number;
}

