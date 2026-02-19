import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Machine } from '../machine/machine.entity';

@Entity('error_codes')
export class ErrorCode {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  code: string; // e.g., 'E45', 'M101', etc.

  @Column()
  meaning: string; // Brief description of the error

  @Column('text')
  description: string; // Detailed description

  @Column('text')
  troubleshootingSteps: string; // JSON string or text with steps

  @ManyToOne(() => Machine, (machine) => machine.errorCodes)
  @JoinColumn({ name: 'machine_id' })
  machine: Machine;

  @Column({ name: 'machine_id' })
  machineId: number;
}

