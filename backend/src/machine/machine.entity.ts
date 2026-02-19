import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { ErrorCode } from '../error-code/error-code.entity';
import { Maintenance } from '../maintenance/maintenance.entity';

@Entity('machines')
export class Machine {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  type: string; // e.g., 'Conveyor', 'Motor', 'CNC', 'Air Compressor'

  @Column('text', { nullable: true })
  description: string;

  @Column({ nullable: true })
  manufacturer: string;

  @Column({ nullable: true })
  model: string;

  @OneToMany(() => ErrorCode, (errorCode) => errorCode.machine)
  errorCodes: ErrorCode[];

  @OneToMany(() => Maintenance, (maintenance) => maintenance.machine)
  maintenanceSchedules: Maintenance[];
}

