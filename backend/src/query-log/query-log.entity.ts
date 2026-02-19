import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('query_logs')
export class QueryLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('text')
  query: string; // User's query text

  @Column('text', { nullable: true })
  response: string; // AI-generated response

  @Column({ nullable: true })
  machineId: number;

  @Column({ nullable: true })
  errorCode: string;

  @CreateDateColumn()
  createdAt: Date;
}

