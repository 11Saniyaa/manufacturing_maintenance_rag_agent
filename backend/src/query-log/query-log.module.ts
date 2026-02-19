import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QueryLog } from './query-log.entity';
import { QueryLogService } from './query-log.service';

@Module({
  imports: [TypeOrmModule.forFeature([QueryLog])],
  providers: [QueryLogService],
  exports: [QueryLogService],
})
export class QueryLogModule {}

