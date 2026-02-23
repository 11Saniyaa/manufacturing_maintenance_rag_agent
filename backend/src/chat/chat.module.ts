import { Module } from '@nestjs/common';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { MachineModule } from '../machine/machine.module';
import { ErrorCodeModule } from '../error-code/error-code.module';
import { MaintenanceModule } from '../maintenance/maintenance.module';
import { QueryLogModule } from '../query-log/query-log.module';

@Module({
  imports: [
    MachineModule,
    ErrorCodeModule,
    MaintenanceModule,
    QueryLogModule,
  ],
  controllers: [ChatController],
  providers: [ChatService],
})
export class ChatModule {}

